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
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/encryption"
	"github.com/MobasirSarkar/hookfilter/pkg/jsonfilter"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/google/uuid"
)

const (
	WEBHOOK_QUEUE_KEY  = "webhook_queue"
	MAX_CONCURRENCY    = 1
	MAX_RETRY          = 3
	PUBLISH_CHANNE_KEY = "events:pipe"
	DLQ_QUEUE_KEY      = "webhook:failed"
)

type Worker interface {
	Start(ctx context.Context)
	Stop()
}

type Runner struct {
	jobs       chan string
	httpClient *http.Client
	cache      cache.Cacher
	querier    db.Querier
	wg         sync.WaitGroup
	log        *logger.Logger
	cfg        *config.Config
	batcher    *EventBatcher
}

func NewRunner(c cache.Cacher, querier db.Querier, maxConcur int64, logger *logger.Logger, cfg *config.Config) *Runner {
	batcher := NewEventBatcher(querier)
	return &Runner{
		cache:   c,
		querier: querier,
		log:     logger,
		cfg:     cfg,
		batcher: batcher,
		jobs:    make(chan string, 100),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 20,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// Start launches the dispatcher and a fixed number of workers.
// Workers process jobs from the internal queue until ctx is cancelled.
func (r *Runner) Start(ctx context.Context, workCount int) {
	for range workCount {
		r.wg.Add(1)
		go r.worker(ctx)
	}
	r.wg.Add(1)
	go r.dispatcher(ctx)
}

// Stop waits for all workers to finish and flushes
// any remaining batched events to the database.
func (r *Runner) Stop() {
	r.wg.Wait()
	r.batcher.flush(context.Background())
}

// dispatcher continuously pulls tasks from redis and
// forwards them to the internal jobs channel
// It exists cleanly when ctx is cancelled.
func (r *Runner) dispatcher(ctx context.Context) {
	defer r.wg.Done()
	defer close(r.jobs)
	r.log.Info("[WORKER] -> Dispatcher started...")

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		// 2. Fetch Task (blocking)
		raw, err := r.cache.QueueBlockingPop(ctx, WEBHOOK_QUEUE_KEY)
		if err != nil {
			if errors.Is(err, cache.ErrQueueEmpty) {
				continue

			}
			r.log.Warnf("[WORKER] queue pop failed -> %v", err)
			continue
		}
		select {
		case r.jobs <- raw:
		case <-ctx.Done():
			return
		}

	}
}

func (r *Runner) worker(ctx context.Context) {
	defer r.wg.Done()
	for {
		select {
		case payload, ok := <-r.jobs:
			if !ok {
				return
			}
			r.process(ctx, payload)
		case <-ctx.Done():
			return
		}
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
			logger.Infof("[WORKER] Event filtered out by user rule -> pipe_id : %s", task.PipeID)
			return
		}
		logger.Errorf("[WORKER] JQ transformation failed -> %v", err)
		errorData := map[string]string{
			"error": err.Error(),
		}
		r.recordEvent(ctx, task, 0, task.Payload, errorData)
		return
	}

	realUrl, err := encryption.Decrypt(task.TargetURL, r.cfg.Aes.EncryptionKey)
	if err != nil {
		logger.Errorf("[WORKER] failed to decrypt target URL -> %v", err)
		_ = r.recordEvent(ctx, task, 0, task.Payload, map[string]string{
			"error": "failed to decrypt target URL",
		})
		return
	}

	// send to destination

	statusCode, err := r.deliverWebhook(ctx, realUrl, transformedPayload)
	r.log.Info(statusCode)
	if shouldRetry(statusCode, err) && task.RetryCount < MAX_RETRY {
		task.RetryCount++
		select {
		case <-time.After(backOff(task.RetryCount)):
		case <-ctx.Done():
			return
		}
		rawRetry, marshalErr := json.Marshal(task)
		if marshalErr != nil {
			r.log.Errorf("[WORKER] failed to marshal retry task -> %v", marshalErr)
			_ = r.moveTODLQ(ctx, raw, marshalErr)
			return
		}
		if pushErr := r.cache.QueuePush(ctx, WEBHOOK_QUEUE_KEY, string(rawRetry)); pushErr != nil {
			r.log.Errorf("[WORKER] failed to requeue retry -> %v", pushErr)
			_ = r.moveTODLQ(ctx, raw, pushErr)
		}
		return
	}
	if err != nil || statusCode >= 400 {
		logger.Warnf("[WORKER] Delivery failed (status: %d) -> Moving to DLQ", statusCode)

		var failureReason error
		if err != nil {
			failureReason = err
		} else {
			failureReason = fmt.Errorf("received non-200 status code: %d", statusCode)
		}

		if dlqErr := r.moveTODLQ(ctx, raw, failureReason); dlqErr != nil {
			logger.Errorf("[WORKER] CRITICAL: Failed to save to DLQ -> %v", failureReason)
		}
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

	resp, err := r.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	return resp.StatusCode, nil
}

// recordEvent enqueues an event for batched persistence.
// An error here means the event could not be accepted into the batch,
// Not that the database write failed.
func (r *Runner) recordEvent(ctx context.Context, task model.WorkerTask, status int, original, transformed any) error {
	originalBytes, err := json.Marshal(original)
	if err != nil {
		return fmt.Errorf("failed to marshal request payload: %w", err)
	}
	transformBytes, err := json.Marshal(transformed)
	if err != nil {
		return fmt.Errorf("failed to marshal transformed payload: %w", err)
	}

	return r.batcher.add(ctx, db.CreateEventParams{
		ID:                 uuid.New(),
		PipeID:             task.PipeID,
		StatusCode:         int32(status),
		RequestPayload:     originalBytes,
		TransformedPayload: transformBytes,
	})
}

func (r *Runner) publishRealtimeUpdate(ctx context.Context, task model.WorkerTask, status int, data any) {
	evnt := model.RealtimeEvent{
		ID:           task.EventID,
		PipeID:       task.PipeID.String(),
		StatusCode:   status,
		ReceivedAt:   time.Now(),
		Payload:      task.Payload,
		ResponseBody: data,
	}
	msg, _ := json.Marshal(evnt)
	channel := fmt.Sprintf("%s:%s", PUBLISH_CHANNE_KEY, task.PipeID.String())

	if err := r.cache.Publish(ctx, channel, string(msg)); err != nil {
		r.log.Warnf("[WORKER] Failed to publish realtime update -> channel %s -> error -%v", channel, err)
	}
}

func (r *Runner) moveTODLQ(ctx context.Context, rawTask string, errReason error) error {
	payload := model.DLQMessage{
		Error:      errReason.Error(),
		FailedAt:   time.Now(),
		RetryCount: 0,
		Task:       json.RawMessage(rawTask),
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal DLQ payload: %w", err)
	}

	return r.cache.QueuePush(ctx, DLQ_QUEUE_KEY, string(data))
}
