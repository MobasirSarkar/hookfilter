package config

import (
	"errors"

	"github.com/MobasirSarkar/hookfilter/pkg/utils"
)

type Config struct {
	// Server config
	Server struct {
		Hostname string
		Env      string
		Port     int
	}

	// Database config
	Db struct {
		DSN string
	}

	// Redis config
	Redis struct {
		Addr     string
		Password string
		Db       int
	}

	// Minio config
	MiniIO struct {
		Endpoint  string
		AccessKey string
		SecretKey string
		UseSSL    bool
	}

	// Auth config
	Auth struct {
		AccessSecret   string
		RefreshSecret  string
		AccessTokenTTL int
	}

	GoogleOauth struct {
		ClientID     string
		ClientSecret string
		RedirectUrl  string
	}

	Aes struct {
		EncryptionKey string
	}

	Worker struct {
		Concurrency int
	}
}

func Load() (*Config, error) {
	cfg := &Config{}

	// server configuration
	cfg.Server.Env = utils.GetEnv("GO_ENV", "development")
	cfg.Server.Hostname = utils.GetEnv("SERVER_HOST", "localhost")
	cfg.Server.Port = utils.GetEnvInt("SERVER_PORT", 8080)

	// database configuration
	cfg.Db.DSN = utils.GetEnv("DB_DSN", "")

	// redis configuration
	cfg.Redis.Db = utils.GetEnvInt("REDIS_DB", 0)
	cfg.Redis.Addr = utils.GetEnv("REDIS_ADDR", "localhost:6379")
	cfg.Redis.Password = utils.GetEnv("REDIS_PASSWORD", "")

	// authentication configuration
	cfg.Auth.AccessSecret = utils.GetEnv("ACCESS_TOKEN_SECRET", "")
	cfg.Auth.RefreshSecret = utils.GetEnv("REFRESH_TOKEN_SECRET", "")

	// minio configuration
	cfg.MiniIO.AccessKey = utils.GetEnv("MINIO_ACCESS_KEY", "")
	cfg.MiniIO.Endpoint = utils.GetEnv("MINIO_ENDPOINT", "")
	cfg.MiniIO.UseSSL = utils.GetEnvBool("MINIO_SSL", false)
	cfg.MiniIO.SecretKey = utils.GetEnv("MINIO_SECRET_KEY", "")
	cfg.Auth.AccessTokenTTL = utils.GetEnvInt("ACCESS_TOKEN_TTL", 24)

	cfg.GoogleOauth.ClientID = utils.GetEnv("GOOGLE_CLIENT_ID", "")
	cfg.GoogleOauth.ClientSecret = utils.GetEnv("GOOGLE_CLIENT_SECRET", "")
	cfg.GoogleOauth.RedirectUrl = utils.GetEnv("GOOGLE_REDIRECT_URL", "")

	cfg.Aes.EncryptionKey = utils.GetEnv("ENCRYPTION_KEY", "")

	cfg.Worker.Concurrency = utils.GetEnvInt("CONCURRENCY_WORKERS", 4)

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.Auth.AccessSecret == "" {
		return errors.New("ACCESS_TOKEN_SECRET is required.")
	}

	if c.Auth.RefreshSecret == "" {
		return errors.New("REFRESH_TOKEN_SECRET is required.")
	}

	if c.Db.DSN == "" {
		return errors.New("DB_DSN is required.")
	}
	if c.Redis.Addr == "" {
		return errors.New("REDIS_ADDR is required.")
	}
	if c.Redis.Password == "" {
		return errors.New("REDIS_PASSWORD is required.")
	}

	if c.MiniIO.AccessKey == "" {
		return errors.New("MINIO_ACCESS_KEY is required.")
	}

	if c.MiniIO.SecretKey == "" {
		return errors.New("MINIO_SECRET_KEY is required.")
	}

	if c.GoogleOauth.ClientID == "" {
		return errors.New("GOOGLE_CLIENT_ID is required.")
	}

	if c.GoogleOauth.ClientSecret == "" {
		return errors.New("GOOGLE_CLIENT_SECRET is required.")
	}

	if c.GoogleOauth.RedirectUrl == "" {
		return errors.New("GOOGLE_REDIRECT_URL is required.")
	}

	if c.Aes.EncryptionKey == "" {
		return errors.New("ENCRYPTION_KEY is required")
	}

	return nil
}
