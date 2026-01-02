package server

import (
	"net/http"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/middleware"
	"github.com/MobasirSarkar/hookfilter/pkg/response"
	"github.com/go-chi/chi/v5"
	chiM "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
)

func (s *Server) MountRoutes(router chi.Router) http.Handler {

	// Global middleware
	router.Use(chiM.Logger)
	router.Use(chiM.Recoverer)
	router.Use(chiM.RealIP)
	router.Use(cors.AllowAll().Handler)

	// public / webhook routes
	router.Get("/health", s.Health)
	s.IngestRoutes(router)
	s.RealtimeRoutes(router)

	// private api routes
	router.Route("/api/v1", func(r chi.Router) {
		s.AuthRoutes(r)
		r.Group(func(r chi.Router) {
			s.ProtectedRotues(r)
		})
	})

	return router
}

func (s *Server) ProtectedRotues(r chi.Router) {
	r.Use(middleware.JWTMiddleware(s.Dependencies.AuthHandler.Service))

	s.UserRoutes(r)
	s.PipeRoutes(r)
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
	limiter := middleware.RateLimit(s.Dependencies.Cache, 100, time.Minute)
	router.With(limiter).Route("/u", func(r chi.Router) {
		r.Post("/{slug}", handler.HandleWebhook)
	})
}

// RealtimeRoutes handles websocket connections
func (s *Server) RealtimeRoutes(router chi.Router) {
	handler := s.Dependencies.WebhookHandler
	router.Route("/ws", func(r chi.Router) {
		r.Get("/", handler.Handle)
	})
}

// AuthRoutes handles auth routes
func (s *Server) AuthRoutes(router chi.Router) {
	handler := s.Dependencies.AuthHandler
	cache := s.Dependencies.Cache

	strictLimiter := middleware.RateLimit(cache, 5, time.Minute)

	standardLimiter := middleware.RateLimit(cache, 20, time.Minute)

	router.Route("/auth", func(r chi.Router) {
		r.With(strictLimiter).Post("/sign-in", handler.LoginUser)
		r.With(strictLimiter).Post("/sign-up", handler.RegisterUser)
		r.Get("/google/login", handler.GoogleLogin)
		r.Get("/google/callback", handler.GoogleCallback)

		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTMiddleware(s.Dependencies.AuthHandler.Service))
			r.Use(standardLimiter)
			r.Post("/logout", handler.Logout)
			r.Post("/logout-all", handler.LogoutAll)
		})
	})
}

func (s *Server) UserRoutes(router chi.Router) {
	handler := s.Dependencies.UserHandler
	router.Route("/users", func(r chi.Router) {
		r.Get("/me", handler.GetProfile)
	})
}

func (s *Server) Health(w http.ResponseWriter, r *http.Request) {
	response.Message(w, http.StatusOK, "Server is running", &response.Metadata{
		RequestID: uuid.NewString(),
	})
}
