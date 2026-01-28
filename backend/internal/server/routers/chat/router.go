package chat

import (
	models "notificate/internal/server/models/chat"

	"github.com/gorilla/mux"
)

type UseCasaeChatRouter interface {
	AddMessage(*models.AddMessageRequest) (int, error)
}

type ChatRouter struct {
	UC UseCasaeChatRouter
}

func InitRouter(r *mux.Router, usecase UseCasaeChatRouter) {
	chatRouter := ChatRouter{UC: usecase}
	chat := r.PathPrefix("/chat").Subrouter()
	chat.HandleFunc("/addMessage", chatRouter.addMessage).Methods("POST")
}

