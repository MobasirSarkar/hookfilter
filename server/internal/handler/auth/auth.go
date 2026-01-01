package auth

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/service/auth"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/MobasirSarkar/hookfilter/pkg/utils"
	"github.com/google/uuid"
)

const (
	OAUTH_STATE_KEY = "oauth_state"
	COOKIE_KEY      = "refresh_token"
)

type AuthHandler struct {
	service  auth.IdentityService
	provider auth.Provider
	log      *logger.Logger
}

func NewAuthHandler(svc auth.IdentityService, provider auth.Provider, log *logger.Logger) *AuthHandler {
	return &AuthHandler{
		service:  svc,
		provider: provider,
		log:      log,
	}
}

func (h *AuthHandler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req auth.Register
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request format", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	if req.Email == "" || req.Password == "" || req.Username == "" {
		response.Error(w, http.StatusBadRequest, "missing required fields", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	tokens, err := h.service.AddUser(r.Context(), auth.AddUserParams{
		Password: req.Password,
		Email:    req.Email,
		Username: req.Username,
	})

	if err != nil {
		switch {
		case errors.Is(err, auth.ErrUserAlreadyExists):
			response.Error(w, http.StatusConflict, "user already exists", &response.Metadata{
				RequestID: uuid.NewString(),
			})
		default:
			h.log.Errorf("reqister failed: %v", err)
			response.Error(w, http.StatusInternalServerError, "internal server error", &response.Metadata{
				RequestID: uuid.NewString(),
			})
		}
		return
	}

	resp := map[string]any{
		"access_token": tokens.AccessToken,
	}

	http.SetCookie(w, &http.Cookie{
		Name:     COOKIE_KEY,
		Value:    tokens.RefreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/auth/refresh",
		MaxAge:   int(30 * 24 * time.Hour.Seconds()),
	})

	response.JSON(w, http.StatusCreated, resp, "user registered", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}

func (h *AuthHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var req auth.Login
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request format", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	if req.Email == "" || req.Password == "" {
		response.Error(w, http.StatusBadRequest, "missing required fields", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	tokens, err := h.service.ValidateUser(r.Context(), auth.LoginUserParams{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrInvalidCreds):
			response.Error(w, http.StatusConflict, "email or password is invalid", &response.Metadata{
				RequestID: uuid.NewString(),
			})
		default:
			h.log.Errorf("reqister failed: %v", err)
			response.Error(w, http.StatusInternalServerError, "internal server error", &response.Metadata{
				RequestID: uuid.NewString(),
			})
		}
		return
	}

	resp := map[string]any{
		"access_token": tokens.AccessToken,
	}

	http.SetCookie(w, &http.Cookie{
		Name:     COOKIE_KEY,
		Value:    tokens.RefreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/auth/refresh",
		MaxAge:   int(30 * 24 * time.Hour.Seconds()),
	})

	response.JSON(w, http.StatusOK, resp, "login successfully", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	state := utils.GenerateGoogleState()

	http.SetCookie(w, &http.Cookie{
		Name:     OAUTH_STATE_KEY,
		Value:    state,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/auth/google/callback",
		MaxAge:   300,
	})
	url := h.provider.AuthURL(state)
	resp := map[string]any{
		"auth_url": url,
	}

	response.JSON(w, http.StatusOK, resp, "redirecting", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	accessToken := r.Header.Get("authorization")
	if accessToken == "" {
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	cookie, err := r.Cookie(COOKIE_KEY)
	if err != nil || cookie.Value == "" {
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	err = h.service.Logout(r.Context(), accessToken, cookie.Value)
	if err != nil {
		http.SetCookie(w, &http.Cookie{
			Name:     COOKIE_KEY,
			Value:    "",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
			Path:     "/auth/google/callback",
			MaxAge:   -1,
		})
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     COOKIE_KEY,
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/auth/google/callback",
		MaxAge:   -1,
	})

}

func (h *AuthHandler) LogoutAll(w http.ResponseWriter, r *http.Request) {
	accessToken := r.Header.Get("authorization")
	if accessToken == "" {
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	cookie, err := r.Cookie(COOKIE_KEY)
	if err != nil || cookie.Value == "" {
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	claims, err := h.service.ValidateToken(r.Context(), accessToken)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	userId, err := uuid.Parse(claims.UserID)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	err = h.service.LogoutAll(r.Context(), userId)
	if err != nil {
		http.SetCookie(w, &http.Cookie{
			Name:     COOKIE_KEY,
			Value:    "",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
			Path:     "/auth/google/callback",
			MaxAge:   -1,
		})
		response.Error(w, http.StatusUnauthorized, "token invalid", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     COOKIE_KEY,
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/auth/google/callback",
		MaxAge:   -1,
	})
	response.Message(w, http.StatusOK, "logout successfully", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	if code == "" || state == "" {
		response.Error(w, http.StatusBadRequest, "invalid oauth callback", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	cookie, err := r.Cookie(OAUTH_STATE_KEY)
	if err != nil || cookie.Value != state {
		response.Error(w, http.StatusUnauthorized, "invalid oauth callback", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	gUser, err := h.provider.ExchangeCode(r.Context(), code)
	if err != nil {
		h.log.Errorf("[HANDLER] -> Login Failed -> %v", err)
		response.Error(w, http.StatusUnauthorized, "login failed", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	tokens, isNewUser, err := h.service.ValidateOauthUser(r.Context(), auth.OauthUserParams{
		Email:      gUser.Email,
		Username:   gUser.Name,
		Provider:   auth.GOOGLE_ID_KEY,
		ProviderID: gUser.ID,
		AvatarURL:  gUser.AvatarUrl,
	})

	if err != nil {
		h.log.Errorf("[HANDLER] -> login failed -> %v", err)
		response.Error(w, http.StatusInternalServerError, "login failed", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     COOKIE_KEY,
		Value:    tokens.RefreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/auth/refresh",
		MaxAge:   int((30 * 24 * time.Hour).Seconds()),
	})

	resp := map[string]any{
		"access_token": tokens.AccessToken,
		"is_new_user":  isNewUser,
	}
	response.JSON(w, http.StatusOK, resp, "login successfully", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}
