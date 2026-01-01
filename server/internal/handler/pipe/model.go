package pipe

type PipeRequest struct {
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	TargetURL string `json:"target_url"`
	JqFilter  string `json:"jq_filter"`
}
