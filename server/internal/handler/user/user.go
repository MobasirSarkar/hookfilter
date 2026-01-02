package user

import (
	"net/http"

	"github.com/MobasirSarkar/hookfilter/internal/middleware"
	"github.com/MobasirSarkar/hookfilter/internal/service/user"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/google/uuid"
)

type UserHandler struct {
	service user.Service
}

func NewUserHandler(sevc user.Service) *UserHandler {
	return &UserHandler{
		service: sevc,
	}
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	profile, err := h.service.GetProfile(r.Context(), userId)
	if err != nil {
		response.Error(w, http.StatusNotFound, "user not found", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	response.JSON(w, http.StatusOK, profile, "user profile fetched", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}
