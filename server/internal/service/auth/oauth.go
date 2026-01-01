package auth

import (
	"context"
	"fmt"
	"net/http"

	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	googleapi "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

const (
	GOOGLE_ID_KEY = "GOOGLE"
)

type Provider interface {
	ID() string
	AuthURL(state string) string
	OauthClient(ctx context.Context, tok *oauth2.Token) *http.Client
	ExchangeCode(ctx context.Context, code string) (*GoogleUser, error)
}

type GoogleProvider struct {
	cfg *oauth2.Config
}

func NewGoogleProvider(cfg *config.Config) *GoogleProvider {
	clientID := cfg.GoogleOauth.ClientID
	clientSecret := cfg.GoogleOauth.ClientSecret
	redirectUrl := cfg.GoogleOauth.RedirectUrl
	return &GoogleProvider{
		cfg: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectUrl,
			Scopes:       []string{"email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

func (g *GoogleProvider) ID() string {
	return GOOGLE_ID_KEY
}

func (g *GoogleProvider) AuthURL(state string) string {
	return g.cfg.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline,
		oauth2.ApprovalForce,
	)
}

func (g *GoogleProvider) OauthClient(ctx context.Context, tok *oauth2.Token) *http.Client {
	return g.cfg.Client(ctx, tok)
}

func (g *GoogleProvider) ExchangeCode(ctx context.Context, code string) (*GoogleUser, error) {
	token, err := g.cfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %v", err)
	}

	opt := option.WithHTTPClient(g.cfg.Client(ctx, token))
	svc, err := googleapi.NewService(ctx, opt)
	if err != nil {
		return nil, fmt.Errorf("google api client %v", err)
	}

	uinfo, err := svc.Userinfo.Get().Do()
	if err != nil {
		return nil, fmt.Errorf("google userinfo error: %v", err)
	}

	user := &GoogleUser{
		ID:            uinfo.Id,
		Email:         uinfo.Email,
		VerifiedEmail: uinfo.VerifiedEmail,
		Name:          uinfo.Name,
		AvatarUrl:     uinfo.Picture,
	}

	return user, nil
}
