package playground

type PlaygroundRequest struct {
	Payload any    `json:"payload" validate:"required,max=1000"`
	Filter  string `json:"filter" validate:"required"`
}

type PlaygroundResponse struct {
	Result any `json:"result"`
}
