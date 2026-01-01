package auth

import "errors"

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrInvalidCreds      = errors.New("Invalid Credentials")

	UniqueConstCode = "23505"

	ErrInvalidToken = errors.New("Token is invalid")
)
