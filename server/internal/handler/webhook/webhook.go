package webhook

import (
	"net/http"

	"github.com/MobasirSarkar/hookfilter/internal/service/realtime"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

type RealtimeHandler struct {
	Service realtime.IRealtime
	log     *logger.Logger
}

func NewRealtimeHandler(service realtime.IRealtime, logger *logger.Logger) *RealtimeHandler {
	return &RealtimeHandler{
		Service: service,
		log:     logger,
	}
}

func (h *RealtimeHandler) Handle(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	if userID == "" {
		userID = r.URL.Query().Get("userID")
	}
	if userID == "" {
		response.Error(w, http.StatusNotFound, "user ID required", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.log.Errorf("[HANDLER] -> websocket error -> %v", err)
		response.Error(w, http.StatusInternalServerError, "internal server error", &response.Metadata{
			RequestID: uuid.NewString(),
		})
		return
	}

	msgs, closeSub, err := h.Service.SubscribeToUserEvents(r.Context(), userID)
	if err != nil {
		h.log.Errorf("[HANDLER] -> subscription failed -> %v", err)
		return
	}
	defer closeSub()

	go func() {
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				closeSub()
				return
			}
		}
	}()

	for {
		select {
		case msg, ok := <-msgs:
			if !ok {
				return
			}
			if err := conn.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
				return
			}
		case <-r.Context().Done():
			return
		}
	}
}
