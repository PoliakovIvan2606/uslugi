package service

import (
	"context"
	"fmt"

	models "notificate/internal/server/models/service"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RepositoryService struct {
	Db *pgxpool.Pool
}

func NewRepositoryService(Db *pgxpool.Pool) *RepositoryService {

	return &RepositoryService{
		Db: Db,
	}
}

func (rep *RepositoryService) AddService(ctx context.Context, s models.AddServiceRequest) (int, error) {
	query := `INSERT INTO service
			(name, short_description, all_description, category, 
			price, name_specialist, experience, phone, email, location) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`

	var id int
	
	err := rep.Db.QueryRow(ctx, query,
		s.Name,
		s.ShortDescription,
		s.AllDescription,
		s.Category,
		s.Price,
		s.NameSpecialist,
		s.Experience,
		s.Phone,
		s.Email,
		s.Location,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("ошибка выполнения запроса AddService: %w", err)
	}

	return id, nil
}

func (rep *RepositoryService) AddStatusImage(ctx context.Context, ServiceID int, Status, Type string) error {
	query := `INSERT INTO generate_image (id, status, type) VALUES ($1, $2, $3)`

	_, err := rep.Db.Exec(ctx, query, ServiceID, Status, Type)
	if err != nil {
		return fmt.Errorf("ошибка выполнения запроса AddImage: %w", err)
	}

	return nil
}

func (repo *RepositoryService) GetAllListServices(ctx context.Context) ([]models.GetService, error) {
	query := `SELECT id, name, short_description, all_description, 
	category, price, name_specialist, experience, phone, email,
	location FROM service`

	rows, err := repo.Db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса %w", err)
	}
	defer rows.Close()

	var services []models.GetService
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

	return services, nil
}
