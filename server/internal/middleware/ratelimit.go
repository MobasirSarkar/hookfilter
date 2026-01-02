package middleware

import (
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/google/uuid"
)

func RateLimit(cache cache.Cacher, limit int, window time.Duration) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip, _, _ := net.SplitHostPort(r.RemoteAddr)

			key := fmt.Sprintf("%s:%s", CACHE_KEY, ip)

			count, err := cache.IncrWithTTL(r.Context(), key, window)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			if count > int64(limit) {
				w.Header().Set("Retry-After", "60")
				response.Error(w, http.StatusTooManyRequests, "Rate limit exceeded", &response.Metadata{
					RequestID: uuid.NewString(),
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
