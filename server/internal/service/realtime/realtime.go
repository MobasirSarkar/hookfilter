package realtime

import (
	"context"
	"fmt"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/google/uuid"
)

const (
	EVENTS_USER_KEY = "events:user"
	PIPE_EVENTS_KEY = "events:pipe"
)

type IRealtime interface {
	SubscribeToUserEvents(ctx context.Context, userID string) (<-chan string, func(), error)
	SubscribeToPipeEvents(ctx context.Context, pipeID string) (<-chan string, func(), error)
	VerifyPipeOwnership(ctx context.Context, pipeID uuid.UUID, userID uuid.UUID) (bool, error)
}

type RealtimeService struct {
	cache   cache.Cacher
	querier db.Querier
}

func NewRealtimeService(cache cache.Cacher, querier db.Querier) *RealtimeService {
	return &RealtimeService{
		cache:   cache,
		querier: querier,
	}
}

func (s *RealtimeService) SubscribeToUserEvents(ctx context.Context, userID string) (<-chan string, func(), error) {
	channelName := fmt.Sprintf("%s:%s", EVENTS_USER_KEY, userID)
	return s.cache.Subscribe(ctx, channelName)
}

func (s *RealtimeService) SubscribeToPipeEvents(ctx context.Context, pipeID string) (<-chan string, func(), error) {
	channelName := fmt.Sprintf("%s:%s", PIPE_EVENTS_KEY, pipeID)
	return s.cache.Subscribe(ctx, channelName)
}

func (s *RealtimeService) VerifyPipeOwnership(ctx context.Context, pipeID uuid.UUID, userID uuid.UUID) (bool, error) {
	found, err := s.querier.VerifyPipeOwnership(ctx, db.VerifyPipeOwnershipParams{
		ID:     pipeID,
		UserID: userID,
	})
	if err != nil {
		return false, err
	}
	return found, nil
}
