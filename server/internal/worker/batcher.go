package worker

import (
	"context"
	"sync"
	"time"

	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/google/uuid"
)

const (
	MAX_BATCH_BUFFER = 20
)

type EventBatcher struct {
	mu    sync.Mutex
	buf   []db.CreateEventParams
	timer *time.Timer
	db    db.Querier
}

func NewEventBatcher(q db.Querier) *EventBatcher {
	b := &EventBatcher{
		db:  q,
		buf: make([]db.CreateEventParams, 0, MAX_BATCH_BUFFER),
	}
	b.timer = time.AfterFunc(2*time.Second, func() {
		b.flush(context.Background())
	})
	return b
}

func (b *EventBatcher) add(ctx context.Context, e db.CreateEventParams) error {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.buf = append(b.buf, e)

	if b.timer != nil {
		b.timer.Reset(2 * time.Second)
	}

	if len(b.buf) >= MAX_BATCH_BUFFER {
		return b.flushLocked(ctx)
	}
	return nil
}

func (b *EventBatcher) flush(ctx context.Context) {
	b.mu.Lock()
	defer b.mu.Unlock()
	_ = b.flushLocked(ctx)
}

func (b *EventBatcher) flushLocked(ctx context.Context) error {
	if len(b.buf) == 0 {
		return nil
	}

	batch := b.buf
	b.buf = b.buf[:0]

	params := db.CreateEventsBatchParams{
		Ids:                 make([]uuid.UUID, 0, len(b.buf)),
		PipeIds:             make([]uuid.UUID, 0, len(b.buf)),
		StatusCodes:         make([]int32, 0, len(b.buf)),
		RequestPayloads:     make([][]byte, 0, len(b.buf)),
		TransformedPayloads: make([][]byte, 0, len(b.buf)),
	}

	for _, e := range batch {
		params.Ids = append(params.Ids, e.ID)
		params.PipeIds = append(params.PipeIds, e.PipeID)
		params.StatusCodes = append(params.StatusCodes, e.StatusCode)
		params.RequestPayloads = append(params.RequestPayloads, e.RequestPayload)
		params.TransformedPayloads = append(params.TransformedPayloads, e.TransformedPayload)
	}
	if err := b.db.CreateEventsBatch(ctx, params); err != nil {
		return err
	}
	return nil
}
