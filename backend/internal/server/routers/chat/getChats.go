package chat

import (
	"net/http"
	"notificate/internal/server/middleware"
	"notificate/pkg/handler"
)

func(router *ChatRouter) getChats(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middleware.KeyUid).(int)
	if !ok {
		http.Error(w, "Ошибка авторизации", http.StatusBadRequest)
        return
	}

	out, err := router.UC.GetChats(r.Context(), userId)
	if err != nil {
		http.Error(w, "Ошибка usecase addMessage: "+err.Error(), http.StatusBadRequest)
        return
	}

	handler.Response(w, out)
}