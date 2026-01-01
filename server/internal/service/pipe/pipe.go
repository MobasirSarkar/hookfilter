package pipe

import (
	"context"
	"errors"

	db "github.com/MobasirSarkar/hookfilter/internal/database"
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
}

func NewPipeService(db db.Querier) *PipeService {
	return &PipeService{
		querier: db,
	}
}

func (s *PipeService) CreatePipe(ctx context.Context, params CreatePipeParams) error {
	if params.Slug == "" || params.TargetUrl == "" {
		return errors.New("slug and target_url are required")
	}

	if params.JQFilter == "" {
		params.JQFilter = "."
	}

	err := s.querier.CreatePipe(ctx, db.CreatePipeParams{
		ID:        uuid.New(),
		UserID:    params.UserID,
		Name:      params.Name,
		Slug:      params.Slug,
		TargetUrl: params.TargetUrl,
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
	return s.querier.ListPipes(ctx, db.ListPipesParams{
		UserID: userID,
		Limit:  pageSize,
		Offset: offset,
	})
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
