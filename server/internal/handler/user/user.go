package user

import (
	"errors"
	"net/http"

	"github.com/MobasirSarkar/hookfilter/internal/middleware"
	"github.com/MobasirSarkar/hookfilter/internal/service/user"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/google/uuid"
)

type UserHandler struct {
	service user.Service
	log     *logger.Logger
}

func NewUserHandler(sevc user.Service, log *logger.Logger) *UserHandler {
	return &UserHandler{
		service: sevc,
		log:     log,
	}
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	meta := &response.Metadata{RequestID: uuid.NewString()}

	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", meta)
		return
	}
	profile, err := h.service.GetProfile(r.Context(), userId)
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			response.Error(w, http.StatusNotFound, "user not found", meta)
			return
		}
		h.log.Errorf("[HANDLER] -> falied to fetch user profile -> %v", err)
		response.Error(w, http.StatusInternalServerError, "internal server error", meta)
		return
	}
	response.JSON(w, http.StatusOK, profile, "user profile fetched", meta)
}
