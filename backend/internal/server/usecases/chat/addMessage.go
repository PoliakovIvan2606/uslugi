package chat

import (
	models "notificate/internal/server/models/chat"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UseCaseAddMessage struct {
	Db *pgxpool.Pool
}

func NewUseCase(Db *pgxpool.Pool) *UseCaseAddMessage {
	return &UseCaseAddMessage{Db: Db}
}

func(uc *UseCaseAddMessage) AddMessage(in *models.AddMessageRequest) (int, error) {
	// var res int
	// err := uc.Db.QueryRow("SELECT 2").Scan(&res)
	// if err != nil {
	// 	return 0, err
	// }
	return 0, nil
}