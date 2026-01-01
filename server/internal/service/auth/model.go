package auth

type Register struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

type Login struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail *bool  `json:"verified_email,omitempty"`
	Name          string `json:"name"`
	AvatarUrl     string `json:"avatar_url"`
}

type AddUserParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

type LoginUserParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type OauthUserParams struct {
	Email      string `json:"email"`
	Username   string `json:"username"`
	Provider   string `json:"provider"`
	ProviderID string `json:"provider_id"`
	AvatarURL  string `json:"avatar_url"`
}

type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
