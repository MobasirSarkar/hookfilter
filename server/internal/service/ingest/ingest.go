package ingest

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/internal/model"
)

const (
	QUEUE_WEBOOK_KEY = "webhook_queue"
)

type Ingestor interface {
	ProcessWebhook(ctx context.Context, slug string, payload any) error
}

type IngestService struct {
	querier db.Querier
	cache   cache.Cacher
}

func NewIngestService(querier db.Querier, cache cache.Cacher) *IngestService {
	return &IngestService{
		querier: querier,
		cache:   cache,
	}
}

func (s *IngestService) ProcessWebhook(ctx context.Context, slug string, payload any) error {
	pipe, err := s.querier.GetPipeBySlug(ctx, slug)
	if err != nil {
		return ErrPipeNotFound
	}

	task := model.WorkerTask{
		PipeID:    pipe.ID,
		UserID:    pipe.UserID,
		TargetURL: pipe.TargetUrl,
		JQFilter:  pipe.JqFilter,
		Payload:   payload,
	}

	taskJson, err := json.Marshal(task)
	if err != nil {
		return fmt.Errorf("marshaling error: %w", err)
	}

	if err := s.cache.QueuePush(ctx, QUEUE_WEBOOK_KEY, string(taskJson)); err != nil {
		return ErrQueueErr
	}

	return nil
}
