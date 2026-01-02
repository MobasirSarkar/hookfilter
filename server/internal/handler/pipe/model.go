package pipe

type PipeRequest struct {
	Name      string `json:"name" validate:"required,min=3,max=50"`
	Slug      string `json:"slug" validate:"required,min=3"`
	TargetURL string `json:"target_url" validate:"required,url"`
	JqFilter  string `json:"jq_filter" validate:"omitempty,max=1000"`
}
