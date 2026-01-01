package auth

import (
	"context"
	"errors"
	"time"

	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/jwt"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type IdentityService interface {
	AddUser(ctx context.Context, params AddUserParams) (*Tokens, error)
	ValidateUser(ctx context.Context, params LoginUserParams) (*Tokens, error)
	ValidateOauthUser(ctx context.Context, params OauthUserParams) (*Tokens, bool, error)
	RefreshAccessToken(ctx context.Context, refreshToken string) (string, string, error)
	Logout(ctx context.Context, accessToken, refreshToken string) error
	LogoutAll(ctx context.Context, userID uuid.UUID) error
	ValidateToken(ctx context.Context, tokenStr string) (*jwt.Claims, error)
}

type AuthService struct {
	querier    db.Querier
	jwtManager jwt.Manager
	config     *config.Config
	log        *logger.Logger
}

func NewAuthService(querier db.Querier, jwtManager jwt.Manager, cfg *config.Config) *AuthService {
	log := logger.NewLogger(cfg)
	return &AuthService{
		querier:    querier,
		jwtManager: jwtManager,
		config:     cfg,
		log:        log,
	}
}

func (s *AuthService) AddUser(ctx context.Context, params AddUserParams) (*Tokens, error) {
	hash, err := utils.HashPassword(params.Password)
	if err != nil {
		return &Tokens{}, err
	}
	user, err := s.querier.CreateUserReturning(ctx, db.CreateUserReturningParams{
		Username: params.Username,
		Password: &hash,
		Email:    params.Email,
	})
	if err == nil {
		return &Tokens{}, nil
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		if pgErr.Code == UniqueConstCode {
			return &Tokens{}, ErrUserAlreadyExists
		}
		return &Tokens{}, err
	}
	access, refresh, err := s.issueTokens(ctx, user)
	if err != nil {
		return &Tokens{}, err
	}

	return &Tokens{
		AccessToken:  access,
		RefreshToken: refresh,
	}, err
}

func (s *AuthService) ValidateUser(ctx context.Context, params LoginUserParams) (*Tokens, error) {
	user, err := s.querier.GetUserByEmail(ctx, params.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &Tokens{}, ErrInvalidCreds
		}
	}

	valid, err := utils.ComparePassword(params.Password, *user.Password)
	if err != nil || !valid {
		return &Tokens{}, ErrInvalidCreds
	}

	access, refresh, err := s.issueTokens(ctx, user)
	if err != nil {
		return &Tokens{}, err
	}

	return &Tokens{
		AccessToken:  access,
		RefreshToken: refresh,
	}, nil

}

func (s *AuthService) ValidateOauthUser(ctx context.Context, params OauthUserParams) (*Tokens, bool, error) {
	user, err := s.querier.LoginOAuthUser(ctx, db.LoginOAuthUserParams{
		Email:           params.Email,
		Username:        params.Username,
		OauthProvider:   &params.Provider,
		OauthProviderID: &params.ProviderID,
		AvatarUrl:       &params.AvatarURL,
	})

	if err != nil {
		return &Tokens{}, false, err
	}

	isNewUser := user.CreatedAt.Equal(user.UpdatedAt)

	access, refresh, err := s.issueTokens(ctx, user)
	if err != nil {
		return &Tokens{}, false, err
	}
	return &Tokens{
		AccessToken:  access,
		RefreshToken: refresh,
	}, isNewUser, nil
}

func (s *AuthService) issueTokens(ctx context.Context, user db.User) (accessToken string, refreshToken string, err error) {
	accessToken, err = s.jwtManager.GenerateToken(user.ID.String(), int(user.TokenVersion))
	if err != nil {
		return "", "", err
	}

	refreshToken = uuid.NewString()
	hashed := utils.HashToken(refreshToken)

	err = s.querier.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
		ID:        uuid.New(),
		UserID:    user.ID,
		TokenHash: hashed,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
	})
	if err != nil {
		return "", "", err
	}
	return accessToken, refreshToken, nil
}

func (s *AuthService) RefreshAccessToken(ctx context.Context, refreshToken string) (newAccess string, newRefresh string, err error) {
	hashed := utils.HashToken(refreshToken)

	rt, err := s.querier.GetRefreshToken(ctx, hashed)
	if err != nil {
		return "", "", ErrInvalidToken
	}

	if err := s.querier.RevokeRefreshToken(ctx, rt.ID); err != nil {
		return "", "", err
	}

	user, err := s.querier.GetUserById(ctx, rt.UserID)
	if err != nil {
		return "", "", nil
	}
	return s.issueTokens(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, accessToken, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}

	hashed := utils.HashToken(refreshToken)
	rt, err := s.querier.GetRefreshToken(ctx, hashed)
	if err == nil {
		_ = s.querier.RevokeRefreshToken(ctx, rt.ID)
	}
	return nil
}

func (s *AuthService) LogoutAll(ctx context.Context, userID uuid.UUID) error {
	return s.querier.IncrementUserTokenVersion(ctx, userID)
}

func (s *AuthService) ValidateToken(
	ctx context.Context,
	tokenStr string,
) (*jwt.Claims, error) {

	claims, err := s.jwtManager.ValidateToken(
		ctx,
		tokenStr,
		func(ctx context.Context, userID string) (int, error) {
			id, err := uuid.Parse(userID)
			if err != nil {
				return 0, jwt.ErrTokenInvalid
			}

			user, err := s.querier.GetUserById(ctx, id)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					return 0, jwt.ErrTokenInvalid
				}
				return 0, err
			}

			return int(user.TokenVersion), nil
		},
	)

	if err != nil {
		return nil, err
	}

	return claims, nil
}
