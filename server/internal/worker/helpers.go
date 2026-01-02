package worker

import (
	"math/rand"
	"time"
)

func shouldRetry(status int, err error) bool {
	if err != nil {
		return true
	}
	return status >= 500
}

// backOff returns an exponentially increasing delay with jitter.
//
// Purpose:
// - Prevents retry storms when a downstream service is failing
// - Gives the remote system time to recover
// - Spreads retries over time to avoid synchorized spikes
//
// Behavior:
// - Delay doubles on every retry attemp (expoenential backOff)
// - Delay is capped to avoid unbounded waiting.
// - Random jitter is added to reduce thudering-herd effects
func backOff(retry int) time.Duration {
	base := time.Second     // initial delay (1s)
	max := 30 * time.Second // maximum delay cap

	// cap the delay to avoid execessive waiting. expoenential growth: 2^retry * base
	delay := min(time.Duration(1<<retry)*base, max)

	// add jitter (up to 50% of delay) to spread retry attempts
	return delay + time.Duration(rand.Int63n(int64(delay/2)))
}
