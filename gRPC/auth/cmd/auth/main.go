package main

import (
	"auth/internal/app"
	"auth/internal/config"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

var (
	pathConfig = "config/config.yaml"
)

func main() {
	cfg, err := config.Init(pathConfig)
	if err != nil {
		slog.Error("%w", err)
		os.Exit(1)
	}
	fmt.Println(cfg)

	application := app.New(*cfg)

	go application.GRPCServer.MustRun()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	<- stop

	application.GRPCServer.Stop()
}