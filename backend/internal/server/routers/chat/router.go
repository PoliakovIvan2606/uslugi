package chat

import (
	"context"
	models "notificate/internal/server/models/chat"

	"github.com/gorilla/mux"
)

type UseCasaeChatRouter interface {
	AddMessage(ctx context.Context, in *models.Message) (int, error)
	AddChat(ctx context.Context, in *models.AddChat) (ChatId int, err error)
	GetMessages(ctx context.Context, chatId, limit int) (messages []models.Message, err error)
	GetChats(ctx context.Context, userId int) (chats []models.GetChats, err error)
}

type ChatRouter struct {
	UC UseCasaeChatRouter
}

func InitRouter(r *mux.Router, usecase UseCasaeChatRouter) {
	chatRouter := ChatRouter{UC: usecase}
	chat := r.PathPrefix("/chat").Subrouter()
	chat.HandleFunc("/addMessage", chatRouter.addMessage).Methods("POST")
	chat.HandleFunc("/addChat", chatRouter.addChat).Methods("POST")
	chat.HandleFunc("/getMessages", chatRouter.getMessages).Methods("GET")
	chat.HandleFunc("/getChats", chatRouter.getChats).Methods("GET")
}

