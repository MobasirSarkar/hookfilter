package playground

import (
	"encoding/json"
	"net/http"

	"github.com/MobasirSarkar/hookfilter/pkg/jsonfilter"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/MobasirSarkar/hookfilter/pkg/validator"
	"github.com/google/uuid"
)

var validate = validator.Validator()

type PlaygroundHandler struct {
	log *logger.Logger
}

func NewPlaygroundHandler(log *logger.Logger) *PlaygroundHandler {
	return &PlaygroundHandler{
		log: log,
	}
}

func (h *PlaygroundHandler) HandlePlayground(w http.ResponseWriter, r *http.Request) {
	meta := &response.Metadata{RequestID: uuid.NewString()}
	var req PlaygroundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request format", meta)
		return
	}

	if err := validate.Struct(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload", meta)
		return
	}

	result, err := jsonfilter.Transform(req.Payload, req.Filter)
	if err != nil {
		h.log.Errorf("[HANDLER] filteration failed -> %v", err)
		response.Error(w, http.StatusInternalServerError, "internal server error", meta)
		return
	}

	res := &PlaygroundResponse{
		Result: result,
	}

	response.JSON(w, http.StatusOK, res, "filteration completed.", meta)

}
