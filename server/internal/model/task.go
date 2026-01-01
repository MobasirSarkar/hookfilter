package model

import "github.com/google/uuid"

type WorkerTask struct {
	PipeID    uuid.UUID `json:"pipe_id"`
	UserID    uuid.UUID `json:"user_id"`
	TargetURL string    `json:"target_url"`
	JQFilter  string    `json:"jq_filter"`
	Payload   any       `json:"payload"`
}
