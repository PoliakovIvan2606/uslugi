package models

import (
	"errors"
	"time"
)

var ErrEmptyField = errors.New("поле не должно быть нулевым")

type Message struct {
	UserId int `json:"userId"`
	ChatId int `json:"chatId"`
	Message string `json:"message"`
	SentAt time.Time `json:"sentAt"`
}

func(in *Message) Validate() error {
	if in.UserId == 0 || in.ChatId == 0 || in.Message == "" {
		return ErrEmptyField
	}
	return nil
}