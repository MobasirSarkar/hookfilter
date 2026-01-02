package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/MobasirSarkar/hookfilter/internal/service/auth"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/google/uuid"
)

func JWTMiddleware(authSvc auth.IdentityService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, http.StatusUnauthorized, "missing authorization header", &response.Metadata{
					RequestID: uuid.NewString(),
				})
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.Error(w, http.StatusUnauthorized, "invalid authorization header", &response.Metadata{
					RequestID: uuid.NewString(),
				})
				return
			}

			tokenStr := parts[1]

			claims, err := authSvc.ValidateToken(r.Context(), tokenStr)
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "invalid or expired token", &response.Metadata{
					RequestID: uuid.NewString(),
				})
				return
			}

			ctx := context.WithValue(r.Context(), ctxUserID, claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(ctxUserID).(string)
	return id, ok
}
