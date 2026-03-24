package middleware

import (
	"context"
	"net/http"
	"notificate/internal/config"
	"notificate/pkg/jwt"
	"strings"
)

var (
	KeyEmail = "email"
	KeyUid = "uid"
)

func AuthMiddleware(next http.Handler, cfg config.JWT) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
            if authHeader == "" {
                http.Error(w, "Отсутствует токен", http.StatusUnauthorized)
                return
            }
			
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			claims, err := jwt.ValidateToken(tokenStr, cfg.Secret)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			uid, ok := claims[KeyUid].(float64)
			if !ok {
				// На всякий случай проверяем, вдруг он уже int (зависит от либы)
				uidInt, okInt := claims[KeyUid].(int)
				if !okInt {
					http.Error(w, "Некорректный формат UID в токене", http.StatusUnauthorized)
					return
				}
				uid = float64(uidInt)
			}

			// 2. Кладем в контекст уже ЧИСТЫЙ int
			ctx := context.WithValue(r.Context(), KeyEmail, claims[KeyEmail])
			ctx = context.WithValue(ctx, KeyUid, int(uid)) 
						
			next.ServeHTTP(w, r.WithContext(ctx))
    })
}