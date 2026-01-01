package worker

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/internal/model"
	"github.com/MobasirSarkar/hookfilter/pkg/jsonfilter"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/google/uuid"
	"golang.org/x/sync/semaphore"
)

const (
	WEBHOOK_QUEUE_KEY  = "webhook_queue"
	MAX_CONCURRENCY    = 1
	PUBLISH_CHANNE_KEY = "events:user"
)

type Worker interface {
	Start(ctx context.Context)
	Stop()
}

type Runner struct {
	cache   cache.Cacher
	querier db.Querier
	sem     *semaphore.Weighted
	wg      sync.WaitGroup
	log     *logger.Logger
}

func NewRunner(c cache.Cacher, querier db.Querier, maxConcur int64, logger *logger.Logger) *Runner {
	return &Runner{
		cache:   c,
		querier: querier,
		sem:     semaphore.NewWeighted(maxConcur),
		log:     logger,
	}
}

func (r *Runner) Start(ctx context.Context) {
	r.wg.Add(1)
	go r.dispatcher(ctx)
}

func (r *Runner) Stop() {
	r.wg.Wait()
}

func (r *Runner) dispatcher(ctx context.Context) {
	defer r.wg.Done()
	r.log.Info("[WORKER] -> Dispatcher started...")

	for {
		// check for shutdown signal
		if ctx.Err() != nil {
			r.log.Info("[WORKER] -> Dispatcher stopted...")
			return
		}

		// 2. Fetch Task (blocking)
		raw, err := r.cache.QueuePop(ctx, WEBHOOK_QUEUE_KEY)
		if err != nil {
			continue
		}

		// 3. acquire Semaphore
		if err := r.sem.Acquire(ctx, MAX_CONCURRENCY); err != nil {
			r.log.Error("[WORKER] failed to acquire semaphore -> ", err.Error())
			return
		}

		// 4. Spawn dynamic worker
		r.wg.Add(1)
		go func(payload string) {
			defer r.wg.Done()                    // mark task done for shutdown
			defer r.sem.Release(MAX_CONCURRENCY) // release token back to pool
			r.process(ctx, payload)
		}(raw)

	}
}

func (r *Runner) process(ctx context.Context, raw string) {
	var task model.WorkerTask
	if err := json.Unmarshal([]byte(raw), &task); err != nil {
		r.log.Errorf("[WORKER] failed to unmarshal task -> %v", err)
		return
	}

	logger := r.log.With("pipe_id", task.PipeID, "worker_id", "dynamic")

	// run transformation
	transformedPayload, err := jsonfilter.Transform(task.Payload, task.JQFilter)
	if err != nil {
		if errors.Is(err, jsonfilter.ErrEmptyOutput) {
			logger.Info("[WORKER] Event filtered out by user rule -> pipe_id : %s", task.PipeID)
			return
		}
		logger.Errorf("[WORKER] JQ transformation failed -> %v", err)
		errorData := map[string]string{
			"error": err.Error(),
		}
		r.recordEvent(ctx, task, 0, task.Payload, errorData)
		return
	}

	// send to destination
	statusCode, err := r.deliverWebhook(ctx, task.TargetURL, transformedPayload)
	if err != nil {
		logger.Errorf("[WORKER] Delivery failed %v", err)
	}

	if err := r.recordEvent(ctx, task, statusCode, task.Payload, transformedPayload); err != nil {
		logger.Errorf("[WORKER] to save event log -> %v", err)
	}

	r.publishRealtimeUpdate(ctx, task, statusCode, transformedPayload)

}

func (r *Runner) deliverWebhook(ctx context.Context, url string, payload any) (int, error) {
	reqBody, err := json.Marshal(payload)
	if err != nil {
		return 0, fmt.Errorf("failed to marshal payload: %w", err)
	}

	// create a request with a short timeout
	reqctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(reqctx, "POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "HookFilter-Worker/1.0")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	return resp.StatusCode, nil
}

func (r *Runner) recordEvent(ctx context.Context, task model.WorkerTask, status int, original, transformed any) error {
	originalBytes, err := json.Marshal(original)
	if err != nil {
		return fmt.Errorf("failed to marshal request payload: %w", err)
	}
	transformBytes, err := json.Marshal(transformed)
	if err != nil {
		return fmt.Errorf("failed to marshal transformed payload: %w", err)
	}

	return r.querier.CreateEvent(ctx, db.CreateEventParams{
		ID:                 uuid.New(),
		PipeID:             task.PipeID,
		StatusCode:         int32(status),
		RequestPayload:     originalBytes,
		TransformedPayload: transformBytes,
	})
}

func (r *Runner) publishRealtimeUpdate(ctx context.Context, task model.WorkerTask, status int, data any) {
	update := map[string]any{
		"pipe_id":     task.PipeID,
		"status_code": status,
		"timestamp":   time.Now(),
		"data":        data,
	}

	msg, _ := json.Marshal(update)

	channel := fmt.Sprintf("%s:%s", PUBLISH_CHANNE_KEY, task.UserID.String())

	if err := r.cache.Publish(ctx, channel, string(msg)); err != nil {
		r.log.Warnf("[WORKER] Failed to publish realtime update -> channel %s -> error -%v", channel, err)
	}
}
