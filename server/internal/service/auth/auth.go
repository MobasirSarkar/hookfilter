package auth

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/jwt"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/sync/singleflight"
)

const (
	CACHE_KEY = "auth:token_version:"
)

type IdentityService interface {
	AddUser(ctx context.Context, params AddUserParams) (*Tokens, error)
	ValidateUser(ctx context.Context, params LoginUserParams) (*Tokens, error)
	ValidateOauthUser(ctx context.Context, params OauthUserParams) (*Tokens, bool, error)
	RefreshAccessToken(ctx context.Context, refreshToken string) (string, string, error)
	Logout(ctx context.Context, refreshToken string) error
	LogoutAll(ctx context.Context, userID uuid.UUID) error
	ValidateToken(ctx context.Context, tokenStr string) (*jwt.Claims, error)
}

type AuthService struct {
	cache      cache.Cacher
	querier    db.Querier
	jwtManager jwt.Manager
	config     *config.Config
	log        *logger.Logger
	sf         singleflight.Group
}

func NewAuthService(querier db.Querier, jwtManager jwt.Manager, cfg *config.Config, cache cache.Cacher) *AuthService {
	log := logger.NewLogger(cfg)
	return &AuthService{
		querier:    querier,
		jwtManager: jwtManager,
		config:     cfg,
		log:        log,
		cache:      cache,
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
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == UniqueConstCode {
			return nil, ErrUserAlreadyExists
		}
		return nil, err
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

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
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
	err := s.querier.IncrementUserTokenVersion(ctx, userID)

	if err != nil {
		return err
	}
	cacheKey := CACHE_KEY + userID.String()
	_ = s.cache.Delete(ctx, cacheKey)

	return nil
}

func (s *AuthService) ValidateToken(
	ctx context.Context,
	tokenStr string,
) (*jwt.Claims, error) {

	claims, err := s.jwtManager.ValidateToken(
		ctx,
		tokenStr,
		s.getUserTokenVersion,
	)

	if err != nil {
		return nil, err
	}

	return claims, nil
}

func (s *AuthService) getUserTokenVersion(ctx context.Context, userID string) (int, error) {
	cacheKey := CACHE_KEY + userID

	// try cache
	if val, found, err := s.cache.Get(ctx, cacheKey); err == nil && found {
		v, err := strconv.Atoi(val)
		if err == nil {
			return v, nil
		}
	}

	// prevent stampede
	v, err, _ := s.sf.Do(cacheKey, func() (any, error) {
		if val, found, err := s.cache.Get(ctx, cacheKey); err == nil && found {
			if v, err := strconv.Atoi(val); err == nil {
				return v, nil
			}
		}

		// db hit
		id, err := uuid.Parse(userID)
		if err != nil {
			return 0, jwt.ErrTokenInvalid
		}

		user, err := s.querier.GetUserById(ctx, id)
		if err != nil {
			return 0, jwt.ErrTokenInvalid
		}

		_ = s.cache.Set(ctx, cacheKey, strconv.Itoa(int(user.TokenVersion)), 30*time.Second)

		return int(user.TokenVersion), nil
	})

	if err != nil {
		return 0, err
	}

	return v.(int), nil
}
