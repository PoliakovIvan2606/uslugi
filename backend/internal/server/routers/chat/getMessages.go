package chat

import (
	"net/http"
	models "notificate/internal/server/models/chat"
	"notificate/pkg/handler"
	"strconv"
)

type getMessageResponse struct {
	Messages []models.Message
}

func(router *ChatRouter) getMessages(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query()

    chatIdStr := query.Get("chatId")
    limitStr := query.Get("limit") 

	chatId, err := strconv.Atoi(chatIdStr)
	if err != nil {
		http.Error(w, "Ошибка валидации: "+err.Error(), http.StatusBadRequest)
        return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		http.Error(w, "Ошибка валидации: "+err.Error(), http.StatusBadRequest)
        return
	}

	messages, err := router.UC.GetMessages(r.Context(), chatId, limit)
	if err != nil {
		http.Error(w, "Ошибка usecase addMessage: "+err.Error(), http.StatusBadRequest)
        return
	}

	out := getMessageResponse{Messages: messages}
	handler.Response(w, out)
}