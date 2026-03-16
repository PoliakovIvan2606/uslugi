package task

import (
	"context"
	"fmt"
	models "notificate/internal/server/models/task"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RepositoryTask struct {
	Db *pgxpool.Pool
}

func NewRepositoryTask(Db *pgxpool.Pool) *RepositoryTask {
	return &RepositoryTask{
		Db: Db,
	}
}


func (rep *RepositoryTask) AddTask(ctx context.Context, s models.AddTaskRequest) (int, error) {
	query := `INSERT INTO tasks
			(title, short_description, all_description, category, budget,
			author, deadline, phone, email, location, requirements) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`

	var id int

	err := rep.Db.QueryRow(ctx, query,
		s.NameCustomer,
		s.ShortDescription,
		s.AllDescription,
		s.Category,
		s.Budget,
		s.NameCustomer,
		s.Deadline,
		s.Phone,
		s.Email,
		s.Location,
		strings.Split(s.Requirements, "\n"),
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("ошибка выполнения запроса Addtask: %w", err)
	}

	return id, nil
}

func (rep *RepositoryTask) AddStatusImage(ctx context.Context, taskID int, Status, Type string) error {
	query := `INSERT INTO generate_image (id, status, type) VALUES ($1, $2, $3)`

	_, err := rep.Db.Exec(ctx, query, taskID, Status, Type)
	if err != nil {
		return fmt.Errorf("ошибка выполнения запроса AddImage: %w", err)
	}

	return nil
}

func (repo *RepositoryTask) GetAllListTasks(ctx context.Context) ([]models.GetTask, error) {
	query := `SELECT id, title, short_description, all_description, 
    category, budget, author, date::TEXT, deadline::TEXT, phone, email,
    location, requirements FROM tasks`

	rows, err := repo.Db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("ошибка запроса %w", err)
	}
	defer rows.Close()

	var tasks []models.GetTask
	for rows.Next() {
		var s models.GetTask

		err := rows.Scan(
			&s.Id, &s.Title, &s.ShortDescription,
			&s.AllDescription, &s.Category, &s.Budget,
			&s.Author, &s.Date, &s.Deadline, &s.Phone,
			&s.Email, &s.Location, &s.Requirements,
		)
		if err != nil {
			return nil, fmt.Errorf("ошибка сканирования %w", err)
		}
		tasks = append(tasks, s)
	}

	return tasks, nil
}
