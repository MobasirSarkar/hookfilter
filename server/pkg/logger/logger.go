package logger

import (
	"github.com/MobasirSarkar/hookfilter/pkg/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger struct {
	*zap.SugaredLogger
}

// NewLogger initialize a new Zap logger
// based on environment it switch to console or json
func NewLogger(cfg *config.Config) *Logger {
	goenv := cfg.Server.Env

	var config zap.Config

	if goenv == "production" {
		config = zap.NewProductionConfig()
		config.Encoding = "json"
		config.EncoderConfig.TimeKey = "ts"
	} else {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	log, err := config.Build()
	if err != nil {
		panic("[LOGGER] failed to initialize -> " + err.Error())
	}

	return &Logger{
		log.Sugar(),
	}
}
