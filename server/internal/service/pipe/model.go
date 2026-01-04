package pipe

import (
	db "github.com/MobasirSarkar/hookfilter/internal/database"
	"github.com/google/uuid"
)

type CreatePipeParams struct {
	UserID    uuid.UUID
	Name      string
	Slug      string
	TargetUrl string
	JQFilter  string
}

type cachedPipeList struct {
	Total int64     `json:"total"`
	Pipes []db.Pipe `json:"pipes"`
}
