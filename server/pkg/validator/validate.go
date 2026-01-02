package validator

import (
	"fmt"
	"strings"
	"sync"

	"github.com/go-playground/validator/v10"
)

var (
	validate *validator.Validate
	once     sync.Once
)

func Validator() *validator.Validate {
	once.Do(func() {
		validate = validator.New(validator.WithRequiredStructEnabled())
	})
	return validate
}

func MapValidationErrors(err error) map[string]string {
	errors := make(map[string]string)

	for _, e := range err.(validator.ValidationErrors) {
		field := strings.ToLower(e.Field())
		errors[field] = validationMessage(e)
	}
	return errors
}

func validationMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "field is required"
	case "email":
		return "invalid email address"
	case "min":
		return fmt.Sprintf("must be at least %s characters", e.Param())
	case "max":
		return fmt.Sprintf("must be at most %s characters", e.Param())
	case "url":
		return "must be a valid URL (e.g., https://api.exampl.com)"
	case "uuid":
		return "invalid UUID format"
	case "alphanum":
		return "must contain only letters and numbers"
	case "http_url":
		return "must be a valid HTTP/HTTPS URL"
	default:
		return fmt.Sprintf("failed to tag '%s'", e.Tag())
	}
}
