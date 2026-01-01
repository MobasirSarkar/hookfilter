package ingest

import "errors"

var (
	// pipe error code
	ErrPipeNotFound = errors.New("pipe not found or inactive")

	// queue error code
	ErrQueueErr = errors.New("failed to enqueue task")
)
