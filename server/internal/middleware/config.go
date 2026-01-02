package middleware

type ctxKey string

const (
	ctxUserID ctxKey = "user_id"
	CACHE_KEY        = "rate_limit:"
)
