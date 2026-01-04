package model

import "time"

type RealtimeEvent struct {
	ID           string    `json:"id"`
	PipeID       string    `json:"pipe_id"`
	StatusCode   int       `json:"status_code"`
	ReceivedAt   time.Time `json:"received_at"`
	Payload      any       `json:"payload"`
	ResponseBody any       `json:"response_body,omitempty"`
}
