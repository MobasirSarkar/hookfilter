package webhook

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/service/auth"
	"github.com/MobasirSarkar/hookfilter/internal/service/realtime"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	MAX_READ_BUFFER = 512
	MAX_READ_LIMIT  = 60 * time.Second
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	once sync.Once
)

type RealtimeHandler struct {
	Service     realtime.IRealtime
	authService auth.IdentityService
	log         *logger.Logger
}

func NewRealtimeHandler(service realtime.IRealtime, authServ auth.IdentityService, logger *logger.Logger) *RealtimeHandler {
	return &RealtimeHandler{
		Service:     service,
		authService: authServ,
		log:         logger,
	}
}

func (h *RealtimeHandler) Handle(w http.ResponseWriter, r *http.Request) {
	// 1. Extract token
	token := extractToken(r)
	if token == "" {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Validate token
	claims, err := h.authService.ValidateToken(r.Context(), token)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// 3. Identity comes ONLY from JWT
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	pipeIDStr := chi.URLParam(r, "pipeId")
	pipeID, err := uuid.Parse(pipeIDStr)
	if err != nil {
		http.Error(w, "invalid pipe id", http.StatusBadRequest)
		return
	}
	ok, err := h.Service.VerifyPipeOwnership(
		r.Context(),
		pipeID,
		userID,
	)
	if err != nil || !ok {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.log.Errorf("[HANDLER] -> websocket upgrade failed -> %v", err)
		return
	}

	defer conn.Close()

	msgs, closeSub, err := h.Service.SubscribeToPipeEvents(r.Context(), pipeID.String())
	if err != nil {
		h.log.Errorf("[HANDLER] -> subscription failed -> %v", err)
		return
	}

	safeClose := func() {
		once.Do(closeSub)
	}

	conn.SetReadLimit(MAX_READ_BUFFER)
	conn.SetReadDeadline(time.Now().Add(MAX_READ_LIMIT))
	conn.SetPongHandler(func(appData string) error {
		conn.SetReadDeadline(time.Now().Add(MAX_READ_LIMIT))
		return nil
	})

	go func() {
		defer safeClose()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	}()
	for msg := range msgs {
		if err := conn.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
			return
		}
	}
}

func extractToken(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if after, ok := strings.CutPrefix(auth, "Bearer "); ok {
		return after
	}
	return r.URL.Query().Get("token")
}
