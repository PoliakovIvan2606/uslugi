package image

import (
	"database/sql"
	"fmt"
)

type RepositoryImage struct {
	Db *sql.DB
}



func NewRepositoryImage(Db *sql.DB) *RepositoryImage {
	return &RepositoryImage{
		Db: Db,
	}
}

const (
	StatusNew = "new"
	StatusInProgress = "in_progress"
	StatusCreated = "created"
)


func(rep *RepositoryImage) ExistsImage(ImageID int) (bool, error) {
	query := `SELECT EXISTS (SELECT id FROM service WHERE id = ?)`

	Exists := false
	err := rep.Db.QueryRow(query, ImageID).Scan(&Exists)
	if err != nil {
		// ошибки
		return false, fmt.Errorf("query failed: %w", err)
	}
	// Status теперь содержит значение из БД

    if err != nil {
        return false, fmt.Errorf("ошибка выполнения запроса ExistsImage: %w", err)
    }

	return Exists, nil
}

func (rep *RepositoryImage) UpdateImageStatus(ImageID int, Status string) error {
    query := `UPDATE generate_image SET status = ? WHERE id = ?`
    
	if Status != StatusNew && Status != StatusInProgress && Status != StatusCreated {
		return fmt.Errorf("неправильный статус")
	}


    _, err := rep.Db.Exec(query, 
        Status,
        ImageID,
    )
    if err != nil {
        return fmt.Errorf("ошибка выполнения запроса UpdateImageStatus: %w", err)
    }
    
    return nil
}

func(rep *RepositoryImage) GetStatusImage(ServiceID int) (string, error) {
	query := `SELECT status FROM generate_image WHERE id = ?`

	var Status string
	err := rep.Db.QueryRow(query, ServiceID).Scan(&Status)
	if err != nil {
		if err == sql.ErrNoRows {
			// Строка не найдена, обработайте как нужно (например, Status = "" или возврат ошибки)
			return "", fmt.Errorf("service not found: %w", err)
		}
		// Другие ошибки (SQL, подключение и т.д.)
		return "", fmt.Errorf("query failed: %w", err)
	}
	// Status теперь содержит значение из БД

    if err != nil {
        return "", fmt.Errorf("ошибка выполнения запроса GetStatusImage: %w", err)
    }

	return Status, nil
}