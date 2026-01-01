package response

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type Pagination struct {
	Page       int32 `json:"page"`
	Pagesize   int32 `json:"page_size"`
	Totalpages int32 `json:"total_page"`
	TotalData  int32 `json:"total_data"`
}

type Metadata struct {
	RequestID  string      `json:"requrest_id"`
	Pagination *Pagination `json:"pagination"`
}

// Envelope is the standard structure for all API responses
type Envelope struct {
	Success  bool      `json:"success"`
	Message  string    `json:"message,omitempty"`
	Data     any       `json:"data,omitempty"`
	Error    string    `json:"error,omitempty"`
	Metadata *Metadata `json:"metadata,omitempty"`
}

// JSON sends a standardized success response
func JSON(w http.ResponseWriter, status int, data any, message string, metadata *Metadata) {
	if metadata == nil {
		metadata = &Metadata{}
	}
	if metadata.RequestID == "" {
		metadata.RequestID = uuid.NewString()
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Request-ID", metadata.RequestID)
	w.WriteHeader(status)

	resp := Envelope{
		Success:  true,
		Data:     data,
		Message:  message,
		Metadata: metadata,
	}

	json.NewEncoder(w).Encode(resp)
}

// Error sends a standardized error response
func Error(w http.ResponseWriter, status int, message string, meta *Metadata) {
	if meta == nil {
		meta = &Metadata{}
	}
	if meta.RequestID == "" {
		meta.RequestID = uuid.NewString()
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Request-ID", meta.RequestID)
	w.WriteHeader(status)

	resp := Envelope{
		Success: false,
		Error:   message,
	}

	json.NewEncoder(w).Encode(resp)
}

// Message sends a simple success simple (e.g. "Deleted successfully")
func Message(w http.ResponseWriter, status int, msg string, meta *Metadata) {
	if meta == nil {
		meta = &Metadata{}
	}
	if meta.RequestID == "" {
		meta.RequestID = uuid.NewString()
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Request-ID", meta.RequestID)
	w.WriteHeader(status)

	resp := Envelope{
		Success: true,
		Message: msg,
	}

	json.NewEncoder(w).Encode(resp)
}
