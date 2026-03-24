package image

import (
	"context"
	"fmt"
	models "notificate/internal/server/models/chat"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RepositoryChat struct {
	Db *pgxpool.Pool
}

func NewRepositoryChat(Db *pgxpool.Pool) *RepositoryChat {
	return &RepositoryChat{
		Db: Db,
	}
}


func(repo *RepositoryChat) AddMessage(ctx context.Context, in *models.Message) (MessageId int, err error) {
	const op = "repository.chat.AddMessage"

	query := `INSERT INTO messages (chat_id, user_id, message, sent_at) VALUES ($1, $2, $3, $4) RETURNING id`

	err = repo.Db.QueryRow(ctx, query, in.ChatId, in.UserId, in.Message, in.SentAt).Scan(&MessageId)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return MessageId, nil
}



func (repo *RepositoryChat) AddChat(ctx context.Context, in *models.AddChat) (ChatId int, err error) {
	const op = "repository.chat.AddChat"

	query := `INSERT INTO chats (user_id1, user_id2) VALUES ($1, $2) RETURNING id`

	err = repo.Db.QueryRow(ctx, query, in.UserId1, in.UserId2).Scan(&ChatId)
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return ChatId, nil
}

func (repo *RepositoryChat) GetMessages(ctx context.Context, chatId, limit int) ([]models.Message, error) {
    const op = "repository.chat.GetMessages"

    query := `SELECT chat_id, user_id, message, sent_at 
              FROM messages 
              WHERE chat_id = $1 
              ORDER BY sent_at DESC 
              LIMIT $2`

    rows, err := repo.Db.Query(ctx, query, chatId, limit)
    if err != nil {
        return nil, fmt.Errorf("%s: %w", op, err)
    }
    defer rows.Close()

    var messages []models.Message
    for rows.Next() {
        var msg models.Message
        err := rows.Scan(&msg.ChatId, &msg.UserId, &msg.Message, &msg.SentAt)
        if err != nil {
            return nil, fmt.Errorf("%s scan: %w", op, err)
        }
        messages = append(messages, msg)
    }

    if err = rows.Err(); err != nil {
        return nil, fmt.Errorf("%s rows: %w", op, err)
    }

    return messages, nil
}

