package pipe

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/MobasirSarkar/hookfilter/internal/middleware"
	"github.com/MobasirSarkar/hookfilter/internal/service/pipe"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type PipeHandler struct {
	Service pipe.Piper
	log     *logger.Logger
}

func NewPipeHandler(serv pipe.Piper, log *logger.Logger) *PipeHandler {
	return &PipeHandler{
		Service: serv,
		log:     log,
	}
}

func (h *PipeHandler) CreatePipe(w http.ResponseWriter, r *http.Request) {
	id, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	userID, err := uuid.Parse(id)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "Invalid user ID", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	var req PipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid body", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	err = h.Service.CreatePipe(r.Context(), pipe.CreatePipeParams{
		UserID:    userID,
		Name:      req.Name,
		Slug:      req.Slug,
		TargetUrl: req.TargetURL,
		JQFilter:  req.JqFilter,
	})
	if err != nil {
		h.log.Errorf("[HANDLER] -> failed to create pipe -> %v", err)
		if errors.Is(err, pipe.ErrPipeExists) {
			response.Error(w, http.StatusConflict, "pipe already exists with same slug", &response.Metadata{
				RequestID: uuid.NewString(),
			})
			return
		}
		response.Error(w, http.StatusInternalServerError, "Internal server error", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	response.Message(w, http.StatusCreated, "pipe created successfully", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}

func (h *PipeHandler) ListPipes(w http.ResponseWriter, r *http.Request) {
	id, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	userID, err := uuid.Parse(id)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "Invalid user ID", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 5 {
		limit = 5
	}

	pipes, err := h.Service.ListPipeByUser(r.Context(), userID, int32(page), int32(limit))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch pipes", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	totalPage := len(pipes)/limit + 1
	pagination := response.Pagination{
		Page:       int32(page),
		Pagesize:   int32(limit),
		Totalpages: int32(totalPage),
		TotalData:  int32(len(pipes)),
	}

	response.JSON(w, http.StatusOK, pipes, "pipe fetched successfully", &response.Metadata{
		RequestID:  uuid.NewString(),
		Pagination: &pagination,
	})
}

func (h *PipeHandler) DeletePipe(w http.ResponseWriter, r *http.Request) {
	id, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	userID, err := uuid.Parse(id)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "Invalid user ID", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	pipeIDStr := chi.URLParam(r, "pipeID")
	pipeID, err := uuid.Parse(pipeIDStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid Pipe Id", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	if err := h.Service.DeletePipe(r.Context(), pipeID, userID); err != nil {
		if errors.Is(err, pipe.ErrPipeNotFound) {
			response.Error(w, http.StatusNotFound, "pipe not found", &response.Metadata{
				RequestID: uuid.NewString(),
			})
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to delete pipe", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	response.Message(w, http.StatusOK, "Pipe delete successfully", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}
