package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/MobasirSarkar/hookfilter/internal/dependency"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/go-chi/chi/v5"
)

type Server struct {
	HttpServer   *http.Server
	Dependencies *dependency.Dependency
	Logger       *logger.Logger
}

func New() *Server {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	log := logger.NewLogger(cfg)

	dependencies, err := dependency.NewDependency(ctx)
	if err != nil {
		panic(err)
	}

	router := chi.NewRouter()

	server := &Server{
		Dependencies: dependencies,
		Logger:       log,
	}

	server.MountRoutes(router)

	server.HttpServer = &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Server.Hostname, cfg.Server.Port),
		Handler:      router,
		WriteTimeout: 30 * time.Second,
		ReadTimeout:  30 * time.Second,
	}

	return server
}

func (s *Server) Run() error {
	s.Logger.Infof("[SERVER] -> Running at %s", s.HttpServer.Addr)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	s.Logger.Info("[WORKER] Starting background processor....")
	s.Dependencies.Worker.Start(ctx, s.Dependencies.Config.Worker.Concurrency)

	go func() {
		if err := s.HttpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			s.Logger.Errorf("[SERVER] failed to serve -> %v", err)
		}
	}()

	//listen for the interrupt signal
	<-ctx.Done()
	s.Logger.Info("[SERVER] shutdown signal received")

	// create shutdown context with 30 * Second timeout
	shutCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// stop http server
	if err := s.HttpServer.Shutdown(shutCtx); err != nil {
		s.Logger.Error("[SERVER] shutdown failed -> %v", err)
		return err
	}

	s.Logger.Info("[WORKER] Waiting for active tasks to finish...")
	s.Dependencies.Worker.Stop()
	s.Logger.Info("[WORKER] Stopped.")

	// close cache
	if err := s.Dependencies.Cache.Close(); err != nil {
		s.Logger.Error("[REDIS] close failed -> %v", err)
		return err
	}

	// close database
	s.Dependencies.Db.Close()

	s.Logger.Info("[SERVER] shutdown complete.")

	return nil
}
