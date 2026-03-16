package image

import (
	"context" // Добавлено
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RepositoryImage struct {
	Db *pgxpool.Pool
}

func NewRepositoryImage(Db *pgxpool.Pool) *RepositoryImage {
	return &RepositoryImage{
		Db: Db,
	}
}

const (
	StatusNew        = "new"
	StatusInProgress = "in_progress"
	StatusCreated    = "created"
)

func (rep *RepositoryImage) ExistsImage(ctx context.Context, ImageID int) (bool, error) {
	query := `SELECT EXISTS (SELECT id FROM service WHERE id = $1)`

	var exists bool
	err := rep.Db.QueryRow(ctx, query, ImageID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("query failed: %w", err)
	}

	return exists, nil
}

func (rep *RepositoryImage) UpdateImageStatus(ctx context.Context, ImageID int, Status string) error {
	query := `UPDATE generate_image SET status = $1 WHERE id = $2`

	if Status != StatusNew && Status != StatusInProgress && Status != StatusCreated {
		return fmt.Errorf("неправильный статус")
	}

	_, err := rep.Db.Exec(ctx, query, Status, ImageID)
	if err != nil {
		return fmt.Errorf("ошибка выполнения запроса UpdateImageStatus: %w", err)
	}

	return nil
}

func (rep *RepositoryImage) GetStatusImage(ctx context.Context, ServiceID int, Type string) (string, error) {
	query := `SELECT status FROM generate_image WHERE id = $1 AND type = $2`

	var status string
	err := rep.Db.QueryRow(ctx, query, ServiceID, Type).Scan(&status)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", fmt.Errorf("service not found")
		}
		return "", fmt.Errorf("query failed: %w", err)
	}

	return status, nil
}
