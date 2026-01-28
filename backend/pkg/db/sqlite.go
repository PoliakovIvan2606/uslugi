package db

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

func NewConnectSqliteDB(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", path)
    if err != nil {
        return nil, fmt.Errorf("ошибка подключения к БД: %w", err)
    }

    
    // Проверяем подключение
    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("ошибка ping: %w", err)
    }
	return db, nil
}