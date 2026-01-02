package model

import (
	"encoding/json"
	"time"
)

type DLQMessage struct {
	Error      string          `json:"error"`
	FailedAt   time.Time       `json:"failed_at"`
	RetryCount int             `json:"retry_count"`
	Task       json.RawMessage `json:"task"`
}
