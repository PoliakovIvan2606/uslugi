package models

import (
	"errors"
	"fmt"
	"time"
)

var (
	ErrEmptyField = errors.New("поле не должно быть нулевым")
	ErrNotValidFiels = errors.New("Не правильное значение поля")
)

type Message struct {
	UserId int `json:"-"`
	ChatId int `json:"chatId"`
	Message string `json:"message"`
	SentAt time.Time `json:"sentAt"`
}

func(in *Message) Validate() error {
	if in.ChatId == 0 || in.Message == "" {
		return fmt.Errorf("%w: %w", in, ErrEmptyField)
	}
	return nil
}