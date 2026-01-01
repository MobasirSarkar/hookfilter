package utils

import (
	"crypto/sha256"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(plain string) (string, error) {
	salt := bcrypt.DefaultCost

	hash, err := bcrypt.GenerateFromPassword([]byte(plain), salt)
	if err != nil {
		return "", err
	}

	return string(hash), err
}

func ComparePassword(plain string, hash string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	if err != nil {
		return false, err
	}
	return true, nil
}

func HashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}
