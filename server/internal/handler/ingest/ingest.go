package ingest

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/MobasirSarkar/hookfilter/internal/service/ingest"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

const (
	// MAX_BODY_BUFFER is max buffer size for request body
	MAX_BODY_BUFFER = 1 << 20
)

type IngestHandler struct {
	service ingest.Ingestor
	log     *logger.Logger
}

func NewIngestHandler(service ingest.Ingestor, log *logger.Logger) *IngestHandler {
	return &IngestHandler{
		service: service,
		log:     log,
	}
}

func (h *IngestHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	// read body
	body, err := io.ReadAll(io.LimitReader(r.Body, MAX_BODY_BUFFER))
	if err != nil {
		response.Error(w, http.StatusRequestEntityTooLarge, "Request body exceeds 1MB limit", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	defer r.Body.Close()

	var payload any
	if err := json.Unmarshal(body, &payload); err != nil {
		h.log.Errorf("[HANDLER] -> json payload error -> %v", err)
		response.Error(w, http.StatusBadRequest, "Invalid JSON format", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	if err := h.service.ProcessWebhook(r.Context(), slug, payload); err != nil {
		if errors.Is(err, ingest.ErrPipeNotFound) {
			response.Error(w, http.StatusNotFound, "Webook endpoint not found or inactive", &response.Metadata{
				RequestID: uuid.NewString(),
			})
			return
		}
		h.log.Errorf("[HANDLER] -> webhook process error -> %v", err)
		response.Error(w, http.StatusInternalServerError, "Failed to process webhook", &response.Metadata{
			RequestID: uuid.NewString(),
		})
	}

	response.Message(w, http.StatusAccepted, "Webook queued for processing", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}
