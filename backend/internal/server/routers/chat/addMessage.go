package chat

import (
	"encoding/json"
	"net/http"
	models "notificate/internal/server/models/chat"
	"notificate/pkg/handler"
)

type addMessageResponse struct {
	MassageId int `json:"messageId"`
}

func(router *ChatRouter) addMessage(w http.ResponseWriter, r *http.Request) {
	in := models.AddMessageRequest{}

	// Парсим JSON из body в структуру
    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
        http.Error(w, "Неверный JSON: "+err.Error(), http.StatusBadRequest)
        return
    }

	if err := in.Validate(); err != nil {
		http.Error(w, "Ошибка валидации: "+err.Error(), http.StatusBadRequest)
        return
	}

	messageId, err := router.UC.AddMessage(&in)
	if err != nil {
		http.Error(w, "Ошибка usecase addMessage: "+err.Error(), http.StatusBadRequest)
        return
	}

	out := addMessageResponse{MassageId: messageId}
	handler.Response(w, out)
}