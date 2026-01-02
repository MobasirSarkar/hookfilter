package service

import (
	"github.com/MobasirSarkar/hookfilter/internal/cache"
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/internal/service/auth"
	"github.com/MobasirSarkar/hookfilter/internal/service/ingest"
	"github.com/MobasirSarkar/hookfilter/internal/service/pipe"
	"github.com/MobasirSarkar/hookfilter/internal/service/realtime"
	"github.com/MobasirSarkar/hookfilter/internal/service/user"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/jwt"
)

type Service struct {
	IngestService   ingest.Ingestor
	RealtimeService realtime.IRealtime
	PipeService     pipe.Piper
	AuthService     auth.IdentityService
	UserService     user.Service
}

func NewServicer(db db.Querier, cache cache.Cacher, cfg *config.Config) *Service {
	jwtManager := jwt.NewJWTManager(cfg)
	ingestService := ingest.NewIngestService(db, cache)
	realtimeService := realtime.NewRealtimeService(cache)
	pipeLineService := pipe.NewPipeService(db, cfg)
	authService := auth.NewAuthService(db, jwtManager, cfg, cache)
	userService := user.NewUserService(db, cfg)

	return &Service{
		PipeService:     pipeLineService,
		IngestService:   ingestService,
		RealtimeService: realtimeService,
		AuthService:     authService,
		UserService:     userService,
	}
}
