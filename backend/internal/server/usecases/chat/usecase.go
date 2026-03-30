package chat

import (
	"context"
	models "notificate/internal/server/models/chat"
)

type RepositoryChat interface {
	AddChat(ctx context.Context, in *models.AddChat) (ChatId int, err error)
	AddMessage(ctx context.Context, in *models.Message) (MessageId int, err error)
	GetMessages(ctx context.Context, chatId, limit int) (messages []models.Message, err error)
	GetChats(ctx context.Context, userId int) (chats []models.GetChats, err error)
}

type UseCaseChat struct {
	repo RepositoryChat
}

func NewUseCase(repo RepositoryChat) *UseCaseChat {
	return &UseCaseChat{repo: repo}
}

func(uc *UseCaseChat) AddChat(ctx context.Context, in *models.AddChat) (ChatId int, err error) {
	ChatId, err = uc.repo.AddChat(ctx, in)
	if err != nil {
		return 0, err
	}
	return ChatId, err
}

func(uc *UseCaseChat) AddMessage(ctx context.Context, in *models.Message) (MessageId int, err error) {
	MessageId, err = uc.repo.AddMessage(ctx, in)
	if err != nil {
		return 0, err
	}
	return MessageId, err
}

func(uc *UseCaseChat) GetMessages(ctx context.Context, chatId, limit int) (messages []models.Message, err error) {
	messages, err = uc.repo.GetMessages(ctx, chatId, limit)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func(uc *UseCaseChat) GetChats(ctx context.Context, userId int) (chats []models.GetChats, err error) {
	chats, err = uc.repo.GetChats(ctx, userId)
	if err != nil {
		return nil, err
	}

	return chats, nil
}
