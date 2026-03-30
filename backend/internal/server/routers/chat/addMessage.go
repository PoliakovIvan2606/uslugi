package chat

import (
	"encoding/json"
	"net/http"
	"notificate/internal/server/middleware"
	models "notificate/internal/server/models/chat"
	"notificate/pkg/handler"
)

type addMessageResponse struct {
	MassageId int `json:"messageId"`
}

func(router *ChatRouter) addMessage(w http.ResponseWriter, r *http.Request) {
	in := models.Message{}

	// Парсим JSON из body в структуру
    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
        http.Error(w, "Неверный JSON: "+err.Error(), http.StatusBadRequest)
        return
    }

	if err := in.Validate(); err != nil {
		http.Error(w, "Ошибка валидации: "+err.Error(), http.StatusBadRequest)
        return
	}
		
	userId, ok := r.Context().Value(middleware.KeyUid).(int)
	if !ok {
		http.Error(w, "Ошибка авторизации", http.StatusBadRequest)
        return
	}
	in.UserId = userId

	messageId, err := router.UC.AddMessage(r.Context(), &in)
	if err != nil {
		http.Error(w, "Ошибка usecase addMessage: "+err.Error(), http.StatusBadRequest)
        return
	}

	out := addMessageResponse{MassageId: messageId}
	handler.Response(w, out)
}