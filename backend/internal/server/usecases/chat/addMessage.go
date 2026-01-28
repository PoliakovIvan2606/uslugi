package chat

import (
	"database/sql"
	models "notificate/internal/server/models/chat"
)

type UseCaseAddMessage struct {
	Db *sql.DB
}

func NewUseCase(connectDB *sql.DB) *UseCaseAddMessage {
	return &UseCaseAddMessage{Db: connectDB}
}

func(uc *UseCaseAddMessage) AddMessage(in *models.AddMessageRequest) (int, error) {
	var res int
	err := uc.Db.QueryRow("SELECT 2").Scan(&res)
	if err != nil {
		return 0, err
	}
	return res, nil
}