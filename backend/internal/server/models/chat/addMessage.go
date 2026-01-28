package models

import "errors"

var ErrEmptyField = errors.New("поле не должно быть нулевым")

type AddMessageRequest struct {
	Uuid string `json:"uuid"`
	UserId int `json:"userId"`
	ChatId int `json:"chatId"`
	Message string `json:"message"`
	ReplyTo int `json:"replyTo"`
}

func(in *AddMessageRequest) Validate() error {
	if in.Uuid == "" || in.UserId == 0 || in.ChatId == 0 || in.Message == "" {
		return ErrEmptyField
	}
	return nil
}