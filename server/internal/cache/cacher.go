package cache

import (
	"context"
	"time"
)

type Cacher interface {
	// standard function
	Get(ctx context.Context, key string) (string, bool, error)
	Set(ctx context.Context, key, val string, ttl time.Duration) error
	SetNX(ctx context.Context, key string, ttl time.Duration) (bool, error)
	Delete(ctx context.Context, key string) error

	// requests counter
	Incr(ctx context.Context, key string) (int64, error)
	IncrWithTTL(ctx context.Context, key string, ttl time.Duration) (int64, error)
	Expire(ctx context.Context, key string, ttl time.Duration) error

	// queue function
	QueuePush(ctx context.Context, queue, val string) error
	QueueBlockingPop(ctx context.Context, queue string) (string, error)
	QueueTryPop(ctx context.Context, queue string) (string, bool, error)

	// pub/sub function
	Publish(ctx context.Context, channel, message string) error
	Subscribe(ctx context.Context, channel string) (<-chan string, func(), error)

	// lifecycle
	Ping(ctx context.Context) error
	Close() error
}
