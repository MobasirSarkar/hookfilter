package cache

import (
	"context"
	"errors"
	"time"

	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/redis/go-redis/v9"
)

var (
	ErrInvalidTTL = errors.New("ttl must be > 0")
	ErrQueueEmpty = errors.New("queue is empty")
	conTimeout    = 5 * time.Second
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(ctx context.Context, cfg *config.Config) (*RedisCache, error) {
	addr := cfg.Redis.Addr
	password := cfg.Redis.Password
	db := cfg.Redis.Db

	client := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		PoolSize:     50,
		MinIdleConns: 10,
		DialTimeout:  conTimeout,
		ReadTimeout:  conTimeout,
		WriteTimeout: conTimeout,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, err
	}

	return &RedisCache{
		client: client,
	}, nil
}

func (r *RedisCache) Get(ctx context.Context, key string) (string, bool, error) {
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return val, true, nil
}

func (r *RedisCache) Set(ctx context.Context, key, val string, ttl time.Duration) error {
	if ttl <= 0 {
		return ErrInvalidTTL
	}
	return r.client.Set(ctx, key, val, ttl).Err()
}

func (r *RedisCache) SetNX(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	if ttl <= 0 {
		return false, ErrInvalidTTL
	}

	res, err := r.client.SetArgs(ctx, key, "1", redis.SetArgs{
		Mode: "NX",
		TTL:  ttl,
	}).Result()

	if err == redis.Nil {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	if res != "OK" {
		return false, nil
	}

	return true, nil
}

func (r *RedisCache) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

func (r *RedisCache) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

func (r *RedisCache) IncrWithTTL(ctx context.Context, key string, ttl time.Duration) (int64, error) {
	var incrWithTTL = redis.NewScript(`
if redis.call("EXISTS", KEYS[1]) == 0 then
  redis.call("SET", KEYS[1], 1, "PX", ARGV[1])
  return 1
else
  return redis.call("INCR", KEYS[1])
end
`)
	if ttl <= 0 {
		return 0, ErrInvalidTTL
	}
	res, err := incrWithTTL.Run(ctx, r.client, []string{key}, ttl.Milliseconds()).Result()
	if err != nil {
		return 0, err
	}
	return res.(int64), nil

}
func (r *RedisCache) Expire(ctx context.Context, key string, ttl time.Duration) error {
	return r.client.Expire(ctx, key, ttl).Err()
}

func (r *RedisCache) QueuePush(ctx context.Context, queue, val string) error {
	return r.client.LPush(ctx, queue, val).Err()
}

func (r *RedisCache) QueueBlockingPop(ctx context.Context, queue string) (string, error) {
	results, err := r.client.BRPop(ctx, 1*time.Second, queue).Result()
	if err == redis.Nil {
		return "", ErrQueueEmpty
	}
	if err != nil {
		return "", err
	}
	return results[1], nil
}

func (r *RedisCache) QueueTryPop(ctx context.Context, queue string) (string, bool, error) {
	val, err := r.client.RPop(ctx, queue).Result()
	if err == redis.Nil {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return val, true, nil
}

// Publish sends a message to a channel (e.g., "events:user_123").
func (r *RedisCache) Publish(ctx context.Context, channel, message string) error {
	return r.client.Publish(ctx, channel, message).Err()
}

// Subscribe listens to a Redis channel and streams messages into a Go channel.
// It returns:
// 1. A read-only Go channel (<-chan string) where messages will appear.
// 2. A close function (func()) that you MUST call to stop listening and clean up.
func (r *RedisCache) Subscribe(ctx context.Context, channel string) (<-chan string, func(), error) {
	// create the subscription
	pubsub := r.client.Subscribe(ctx, channel)

	// verify connection
	_, err := pubsub.Receive(ctx)
	if err != nil {
		return nil, nil, err
	}

	// create a go channel to pipe data to the caller
	msgChan := make(chan string, 16)

	// start a background goroutine to pump messages from redis to go channel
	go func() {
		defer close(msgChan)

		ch := pubsub.Channel()
		for {
			select {
			case msg, ok := <-ch:
				if !ok {
					return
				}
				select {
				case msgChan <- msg.Payload:
				case <-ctx.Done():
					return
				}
			case <-ctx.Done():
				return
			}
		}
	}()

	// define the cleanup function (closure)
	closFunc := func() {
		_ = pubsub.Close()
	}

	return msgChan, closFunc, nil

}

func (r *RedisCache) Close() error {
	return r.client.Close()
}

func (r *RedisCache) Ping(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}
