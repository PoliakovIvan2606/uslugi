package handler

import (
	"database/sql"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
)

func Response(w http.ResponseWriter, out interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}

func NewSqlNullString(str string) sql.NullString {
	if len(str) == 0 {
		return sql.NullString{}
	}

	return sql.NullString{String: str, Valid: true}
}

func NewSqlNullInt64(num int) sql.NullInt64 {
	if num == 0 {
		return sql.NullInt64{}
	}

	return sql.NullInt64{Int64: int64(num), Valid: true}
}

func CreateDirImage(dirs []string) {
	for _, dir := range dirs {
		createDir(dir)
	}
}

func createDir(dir string) {
	err := os.MkdirAll(dir, 0755)
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
}