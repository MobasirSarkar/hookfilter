package user

import (
	"context"

	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/google/uuid"
)

type Service interface {
	GetProfile(ctx context.Context, userID string) (*UserProfile, error)
}

type UserService struct {
	Querier db.Querier
	log     *logger.Logger
}

func NewUserService(db db.Querier, cfg *config.Config) *UserService {
	log := logger.NewLogger(cfg)
	return &UserService{
		Querier: db,
		log:     log,
	}
}

func (s *UserService) GetProfile(ctx context.Context, userID string) (*UserProfile, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}
	user, err := s.Querier.GetUserById(ctx, id)
	if err != nil {
		return nil, err
	}

	profile := &UserProfile{
		ID:        user.ID.String(),
		Email:     user.Email,
		Username:  user.Username,
		AvatarURL: user.AvatarUrl,
		CreatedAt: user.CreatedAt,
	}

	return profile, nil
}
