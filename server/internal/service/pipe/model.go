package pipe

import "github.com/google/uuid"

type CreatePipeParams struct {
	UserID    uuid.UUID
	Name      string
	Slug      string
	TargetUrl string
	JQFilter  string
}
