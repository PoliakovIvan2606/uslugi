package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
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