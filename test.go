package main

import (
	"context"
	"log/slog"
)

func main() {
	slog.Log(context.Background(), slog.LevelInfo, "Hi")
}