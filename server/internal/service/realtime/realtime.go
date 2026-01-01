package realtime

import (
	"context"
	"fmt"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
)

const (
	EVENTS_USER_KEY = "events:user"
)

type IRealtime interface {
	SubscribeToUserEvents(ctx context.Context, userID string) (<-chan string, func(), error)
}

type RealtimeService struct {
	cache cache.Cacher
}

func NewRealtimeService(cache cache.Cacher) *RealtimeService {
	return &RealtimeService{
		cache: cache,
	}
}

func (s *RealtimeService) SubscribeToUserEvents(ctx context.Context, userID string) (<-chan string, func(), error) {
	channelName := fmt.Sprintf("%s:%s", EVENTS_USER_KEY, userID)
	return s.cache.Subscribe(ctx, channelName)
}
