package storage

import (
	"auth/internal/domains/models"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrUserExists = errors.New("user alredy exists")
	ErrUserNotFound = errors.New("user not found")
)

type RepositoryAuth struct {
	Db *pgxpool.Pool
}

func NewRepositoryAuth(Db *pgxpool.Pool) *RepositoryAuth {
	return &RepositoryAuth{
		Db: Db,
	}
}


func (r *RepositoryAuth) SaveUser (ctx context.Context, email string, passHash []byte) (uid int64, err error) {
	const op = "Repository.SaveUser"

	query := `INSERT INTO users (email, pass_hash) VALUES ($1, $2) RETURNING id`
	var id int64
	
	err = r.Db.QueryRow(ctx, query, email, passHash).Scan(&id)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				return 0, fmt.Errorf("%s: %w", op, ErrUserExists)
			}
		}
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return id, nil
}

func (r *RepositoryAuth) User (ctx context.Context, email string) (user models.User, err error) {
	const op = "Repository.User"

	query := `SELECT id, email, pass_hash FROM users WHERE email = $1`

	err = r.Db.QueryRow(ctx, query, email).Scan(&user.Id, &user.Email, &user.PassHash)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.User{}, fmt.Errorf("%s: %w", op, ErrUserNotFound)
		}
		return models.User{}, fmt.Errorf("%s: %w", op, err)
	}

	return user, nil
}