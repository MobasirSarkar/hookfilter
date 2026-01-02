package webhook_test

import (
	"github.com/MobasirSarkar/hookfilter/internal/handler/webhook"
	"github.com/MobasirSarkar/hookfilter/internal/service/realtime"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"net/http"
	"testing"
)

func TestRealtimeHandler_Handle(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for receiver constructor.
		service realtime.IRealtime
		logger  *logger.Logger
		// Named input parameters for target function.
		w http.ResponseWriter
		r *http.Request
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := webhook.NewRealtimeHandler(tt.service, tt.logger)
			h.Handle(tt.w, tt.r)
		})
	}
}
