package chat

import (
	"net/http"
	"notificate/internal/server/middleware"
	models "notificate/internal/server/models/chat"
	"notificate/pkg/handler"
	"strconv"
)

type AddChatResponse struct {
	ChatId int `json:"chat_id"`
}

func (router *ChatRouter) addChat(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
    userIdStr := query.Get("userId") 

	
	userId1, err := strconv.Atoi(userIdStr)
	if err != nil {
		http.Error(w, "Неверный формат UserId1", http.StatusBadRequest)
		return
	}

	userId2, ok := r.Context().Value(middleware.KeyUid).(int)
	if !ok {
		http.Error(w, "Пользователь не авторизован", http.StatusUnauthorized)
		return
	}

	in := models.AddChat{
		UserId1: userId1,
		UserId2: userId2,
	}

	chatId, err := router.UC.AddChat(r.Context(), &in)
	if err != nil {
		http.Error(w, "Ошибка создания чата: "+err.Error(), http.StatusInternalServerError)
		return
	}

	out := AddChatResponse{ChatId: chatId}
	handler.Response(w, out)
}
