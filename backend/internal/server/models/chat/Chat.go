package models

type AddChat struct {
	UserId1 int `json:"-"`
	UserId2 int `json:"userId"`
	ChatId int `json:"chatId"`
	Type string `json:"type"`
}

func (in *AddChat) Validate() error {
	if in.UserId2 == 0 || in.ChatId == 0 {
		return ErrEmptyField
	}
	if in.Type != "service" && in.Type != "task" {
		return ErrNotValidFiels
	}
	return nil
}

type GetChats struct {
	ChatId int `json:"chatId"`
	Email string `json:"email"`
}

