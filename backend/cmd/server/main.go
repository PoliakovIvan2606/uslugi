package main

import (
	"log/slog"
	"notificate/internal/config"
	"notificate/internal/server"
	"notificate/pkg/handler"
	"os"
)

var (
	pathConfig = "configs/config.yaml"
)

func main() {
	cfg, err := config.Init(pathConfig)
	if err != nil {
		slog.Error("получение конфига", "error", err)
	}

	handler.CreateDirImage([]string{"../image", "../image/service", "../image/task"})

	if err := internal.Run(cfg); err != nil {
		slog.Error("ошибка запуска сервера", "error", err)
		os.Exit(1)
	}
}