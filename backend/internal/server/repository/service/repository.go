package service

import (
	"database/sql"
	"errors"
	"fmt"
	models "notificate/internal/server/models/service"
	"notificate/pkg/handler"
)

type RepositoryService struct {
	Db *sql.DB
}



func NewRepositoryService(Db *sql.DB) *RepositoryService {
	return &RepositoryService{
		Db: Db,
	}
}

func(rep *RepositoryService) AddService(s models.AddServiceRequest) (int, error) {
	query := `INSERT INTO service
			(name, shortDescription, allDescription, category, 
			price, nameSpecialist, experience, phone, email, location) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id;
	`
 	
	res, err := rep.Db.Exec(query, 
		handler.NewSqlNullString(s.Name),
		handler.NewSqlNullString(s.ShortDescription),
		handler.NewSqlNullString(s.AllDescription),
		handler.NewSqlNullString(s.Category),
		handler.NewSqlNullInt64(s.Price),
		handler.NewSqlNullString(s.NameSpecialist),
		handler.NewSqlNullInt64(s.Experience),
		handler.NewSqlNullString(s.Phone),
		handler.NewSqlNullString(s.Email),
		handler.NewSqlNullString(s.Location),
	)
	if err != nil {
		return 0, fmt.Errorf("ошибка выполнения запроса AddService: %w", err)
	}

	ServiceIdInt64, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("ошибка получения id: %w", err)
	}
	
	return int(ServiceIdInt64), nil
}

func(rep *RepositoryService) AddStatusImage(ServiceID int, Status string) error {
	query := `INSERT INTO generate_image (id, status) VALUES (?, ?)`

	 	
	_, err := rep.Db.Exec(query, 
		handler.NewSqlNullInt64(ServiceID),
		Status,
	)
	if err != nil {
		return fmt.Errorf("ошибка выполнения запроса AddImage: %w", err)
	}
	
	return nil
}

func(repo *RepositoryService) GetAllListServices() (*[]models.GetService, error) {
	query := `SELECT id, name, shortDescription, allDescription, 
	category, price, nameSpecialist, experience, phone, email,
	location FROM service`

	var services []models.GetService
	rows, err := repo.Db.Query(query)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("нет полей %w", err)
		}
		return nil, fmt.Errorf("ошибка запроса %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var s models.GetService
		err := rows.Scan(
			&s.Id, &s.Name, &s.ShortDescription,
			&s.AllDescription, &s.Category, &s.Price,
			&s.NameSpecialist, &s.Experience, &s.Phone,
			&s.Email, &s.Location,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования %w", err)
		}
		services = append(services, s)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("ошибка после чтения строк: %w", err)
	}

	return &services, nil
}