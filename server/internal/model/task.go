package model

import "github.com/google/uuid"

type WorkerTask struct {
	EventID    string
	RetryCount int
	PipeID     uuid.UUID
	UserID     uuid.UUID
	TargetURL  string
	JQFilter   string
	Payload    any
}
