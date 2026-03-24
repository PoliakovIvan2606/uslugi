package jwt

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrNotValidToken = errors.New("Token not valid")
	ErrUnexpectedSignMethod = errors.New("unexpected signing method")
)


func ValidateToken(tokenString string, secret string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrNotValidToken
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	// Проверяем валидность (срок действия exp и подпись)
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrNotValidToken
}
