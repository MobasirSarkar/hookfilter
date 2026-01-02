package pipe

import (
	"context"
	"errors"

	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/MobasirSarkar/hookfilter/pkg/encryption"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

var (
	ErrPipeNotFound = errors.New("pipe not found")
	ErrPipeExists   = errors.New("pipe already exists")
	UniqueConstCode = "23505"
)

type Piper interface {
	CreatePipe(ctx context.Context, params CreatePipeParams) error
	ListPipeByUser(ctx context.Context, userID uuid.UUID, page, pageSize int32) ([]db.Pipe, error)
	DeletePipe(ctx context.Context, pipeID, userID uuid.UUID) error
}

type PipeService struct {
	querier db.Querier
	Config  *config.Config
}

func NewPipeService(db db.Querier, cfg *config.Config) *PipeService {
	return &PipeService{
		querier: db,
		Config:  cfg,
	}
}

func (s *PipeService) CreatePipe(ctx context.Context, params CreatePipeParams) error {
	if params.Slug == "" || params.TargetUrl == "" {
		return errors.New("slug and target_url are required")
	}

	if params.JQFilter == "" {
		params.JQFilter = "."
	}

	encryptedURL, err := encryption.Encrypt(params.TargetUrl, s.Config.Aes.EncryptionKey)
	if err != nil {
		return err
	}

	err = s.querier.CreatePipe(ctx, db.CreatePipeParams{
		ID:        uuid.New(),
		UserID:    params.UserID,
		Name:      params.Name,
		Slug:      params.Slug,
		TargetUrl: encryptedURL,
		JqFilter:  params.JQFilter,
	})
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == UniqueConstCode {
				return ErrPipeExists
			}
		}
		return err
	}

	return nil
}

func (s *PipeService) ListPipeByUser(ctx context.Context, userID uuid.UUID, page, pageSize int32) ([]db.Pipe, error) {
	offset := (page - 1) * pageSize
	pipes, err := s.querier.ListPipes(ctx, db.ListPipesParams{
		UserID: userID,
		Limit:  pageSize,
		Offset: offset,
	})
	if err != nil {
		return []db.Pipe{}, err
	}
	for i := range pipes {
		decrypted, _ := encryption.Decrypt(pipes[i].TargetUrl, s.Config.Aes.EncryptionKey)
		pipes[i].TargetUrl = decrypted
	}

	return pipes, nil
}

func (s *PipeService) DeletePipe(ctx context.Context, pipeID, userID uuid.UUID) error {
	rows, err := s.querier.DeletePipe(ctx, db.DeletePipeParams{
		ID:     pipeID,
		UserID: userID,
	})
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrPipeNotFound
	}
	return nil
}
