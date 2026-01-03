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
	"github.com/MobasirSarkar/hookfilter/pkg/validator"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

var validate = validator.Validator()

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
	meta := &response.Metadata{RequestID: uuid.NewString()}

	// userID
	id, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}
	userID, err := uuid.Parse(id)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}
	var req PipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request format", meta)
		return
	}
	if err := validate.Struct(req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request format", meta)
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
		if errors.Is(err, pipe.ErrPipeExists) {
			response.Error(w, http.StatusConflict, "pipe already exists with same slug", meta)
			return
		}
		h.log.Errorf("[HANDLER] -> failed to create pipe -> %v", err)
		response.Error(w, http.StatusInternalServerError, "Internal server error", meta)
		return
	}

	response.Message(w, http.StatusCreated, "pipe created successfully", meta)
}

func (h *PipeHandler) ListPipes(w http.ResponseWriter, r *http.Request) {
	meta := &response.Metadata{RequestID: uuid.NewString()}

	id, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}
	userID, err := uuid.Parse(id)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
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

	totalData, pipes, err := h.Service.ListPipeByUser(r.Context(), userID, int32(page), int32(limit))
	if err != nil {
		h.log.Error(err)
		response.Error(w, http.StatusInternalServerError, "internal server error", meta)
		return
	}

	totalPage := len(pipes)/limit + 1
	pagination := response.Pagination{
		Page:       int32(page),
		Pagesize:   int32(limit),
		Totalpages: int32(totalPage),
		TotalData:  int32(totalData),
	}
	meta.Pagination = &pagination

	response.JSON(w, http.StatusOK, pipes, "pipe fetched successfully", meta)
}

func (h *PipeHandler) GetPipeByID(w http.ResponseWriter, r *http.Request) {
	meta := &response.Metadata{RequestID: uuid.NewString()}

	userIDStr, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}

	pipeIDStr := chi.URLParam(r, "pipeID")
	pipeID, err := uuid.Parse(pipeIDStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid pipeID", meta)
		return
	}

	pipeD, err := h.Service.GetPipeById(r.Context(), pipeID, userID)
	if err != nil {
		if errors.Is(err, pipe.ErrPipeNotFound) {
			response.Error(w, http.StatusNotFound, "pipe not found", meta)
			return
		}
		h.log.Errorf("GetPipeById failed: %v", err)
		response.Error(w, http.StatusInternalServerError, "internal server error", meta)
		return
	}

	response.JSON(w, http.StatusOK, pipeD, "pipe fetched successfully", meta)
}

func (h *PipeHandler) DeletePipe(w http.ResponseWriter, r *http.Request) {
	meta := &response.Metadata{RequestID: uuid.NewString()}

	id, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}
	userID, err := uuid.Parse(id)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}
	pipeIDStr := chi.URLParam(r, "pipeID")
	pipeID, err := uuid.Parse(pipeIDStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request params", meta)
		return
	}
	if err := h.Service.DeletePipe(r.Context(), pipeID, userID); err != nil {
		if errors.Is(err, pipe.ErrPipeNotFound) {
			response.Error(w, http.StatusNotFound, "pipe not found", meta)
			return
		}
		response.Error(w, http.StatusInternalServerError, "internal server error", meta)
		return
	}

	response.Message(w, http.StatusOK, "Pipe delete successfully", meta)
}
