package server

import (
	"net/http"

	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
)

func (s *Server) MountRoutes(router chi.Router) http.Handler {

	// Global middleware
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.RealIP)
	router.Use(cors.AllowAll().Handler)

	// public / webhook routes
	s.IngestRoutes(router)
	s.RealtimeRoutes(router)

	router.Get("/health", s.Health)

	// private api routes
	router.Route("/api/v1", func(r chi.Router) {
		s.PipeRoutes(r)
		s.AuthRoutes(r)
	})

	return router
}

// PipeRoutes handles CRUD operations for the configuration
func (s *Server) PipeRoutes(router chi.Router) {
	handler := s.Dependencies.PipeHandler
	router.Route("/pipes", func(r chi.Router) {
		r.Post("/", handler.CreatePipe)
		r.Get("/", handler.ListPipes)
		r.Delete("/{pipeID}", handler.DeletePipe)
	})
}

// IngestRoutes handles the high-volumes webhook hanlder
func (s *Server) IngestRoutes(router chi.Router) {
	handler := s.Dependencies.IngestHandler

	router.Route("/u", func(r chi.Router) {
		r.Post("/{slug}", handler.HandleWebhook)
	})
}

// RealtimeRoutes handles websocket connections
func (s *Server) RealtimeRoutes(router chi.Router) {
	handler := s.Dependencies.WebhookHandler

	router.Route("/ws", func(r chi.Router) {
		r.Get("/{userID}", handler.Handle)
	})
}

func (s *Server) AuthRoutes(router chi.Router) {
	handler := s.Dependencies.AuthHandler

	router.Route("/auth", func(r chi.Router) {
		r.Post("/sign-in", handler.LoginUser)
		r.Post("/sign-up", handler.RegisterUser)
		r.Post("/google/login", handler.GoogleLogin)
		r.Post("/google/callback", handler.GoogleCallback)
		r.Post("/logout", handler.Logout)
		r.Post("/logout-all", handler.LogoutAll)
	})
}

func (s *Server) Health(w http.ResponseWriter, r *http.Request) {
	response.Message(w, http.StatusOK, "Server is running", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}
