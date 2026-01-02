package dependency

import (
	"context"

	"github.com/MobasirSarkar/hookfilter/internal/cache"
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/internal/handler/auth"
	"github.com/MobasirSarkar/hookfilter/internal/handler/ingest"
	"github.com/MobasirSarkar/hookfilter/internal/handler/pipe"
	"github.com/MobasirSarkar/hookfilter/internal/handler/user"
	"github.com/MobasirSarkar/hookfilter/internal/handler/webhook"
	"github.com/MobasirSarkar/hookfilter/internal/service"
	gp "github.com/MobasirSarkar/hookfilter/internal/service/auth"
	"github.com/MobasirSarkar/hookfilter/internal/worker"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/logger"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Dependency struct {
	Cache          *cache.RedisCache
	Db             *pgxpool.Pool
	PipeHandler    *pipe.PipeHandler
	IngestHandler  *ingest.IngestHandler
	WebhookHandler *webhook.RealtimeHandler
	AuthHandler    *auth.AuthHandler
	UserHandler    *user.UserHandler
	Worker         *worker.Runner
	Config         *config.Config
}

func NewDependency(ctx context.Context) (*Dependency, error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}

	logger := logger.NewLogger(cfg)

	dbConn, err := pgxpool.New(ctx, cfg.Db.DSN)
	if err != nil {
		return nil, err
	}

	if err := dbConn.Ping(ctx); err != nil {
		return nil, err
	}

	cache, err := cache.NewRedisCache(ctx, cfg)
	if err != nil {
		return nil, err
	}

	querier := db.New(dbConn)

	servicer := service.NewServicer(querier, cache, cfg)

	pipeHandler := pipe.NewPipeHandler(servicer.PipeService, logger)

	ingestHandler := ingest.NewIngestHandler(servicer.IngestService, logger)
	webhookHandler := webhook.NewRealtimeHandler(servicer.RealtimeService, servicer.AuthService, logger)

	googleProvider := gp.NewGoogleProvider(cfg)
	authHandler := auth.NewAuthHandler(servicer.AuthService, googleProvider, logger)

	userHandler := user.NewUserHandler(servicer.UserService)

	workerRunner := worker.NewRunner(cache, querier, 5, logger, cfg)

	return &Dependency{
		Cache:          cache,
		Db:             dbConn,
		WebhookHandler: webhookHandler,
		PipeHandler:    pipeHandler,
		IngestHandler:  ingestHandler,
		AuthHandler:    authHandler,
		UserHandler:    userHandler,
		Worker:         workerRunner,
		Config:         cfg,
	}, nil
}
