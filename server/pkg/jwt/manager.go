package jwt

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	INVALIDATE_TOKEN_KEY = "blacklist:token"
	REVOKED_KEY          = "revoked"
)

var (
	ErrTokenInvalid     = errors.New("token is invalid")
	ErrTokenBlacklisted = errors.New("token has been revoked")
	ErrTokenIdMissing   = errors.New("missing token id")
)

type Manager interface {
	GenerateToken(userID string, tokenVersion int) (string, error)
	ValidateToken(
		ctx context.Context,
		tokenStr string,
		getUserVersion func(ctx context.Context, userID string) (int, error),
	) (*Claims, error)
}

// Manager holds the configuration for JWT operations
type JWTManager struct {
	SecretKey     []byte
	TokenDuration time.Duration
}

// NewJWTManager initializes a new JWT Manager
func NewJWTManager(cfg *config.Config) *JWTManager {
	secretkey := cfg.Auth.AccessSecret
	tokenDuration := time.Duration(cfg.Auth.AccessTokenTTL) * time.Hour

	return &JWTManager{
		SecretKey:     []byte(secretkey),
		TokenDuration: tokenDuration,
	}
}

// GenerateToken creates a signed JWT for a specific user.
func (m *JWTManager) GenerateToken(userID string, tokenVersion int) (string, error) {
	now := time.Now()
	expiryTime := now.Add(m.TokenDuration)
	tokenID := uuid.NewString()

	claims := &Claims{
		UserID:       userID,
		TokenVersion: tokenVersion,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "auth-service",
			Audience:  jwt.ClaimStrings{"local"},
			ExpiresAt: jwt.NewNumericDate(expiryTime),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        tokenID,
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(m.SecretKey)
}

func (m *JWTManager) ValidateToken(ctx context.Context, tokenStr string, getUserVerison func(ctx context.Context, userID string) (int, error)) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.SecretKey, nil
	})

	if err != nil || !token.Valid {
		return nil, ErrTokenInvalid
	}

	currentVersion, err := getUserVerison(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}

	if claims.TokenVersion != currentVersion {
		return nil, ErrTokenInvalid
	}

	return claims, nil
}
