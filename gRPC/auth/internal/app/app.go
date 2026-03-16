package app

import (
	grpcapp "auth/internal/app/grpc"
	"auth/internal/config"
	"time"
)

type App struct {
	port string
	tokenTTL time.Duration
	GRPCServer *grpcapp.App
}

func New(
	cfg config.Config,
) *App {
	
	grpcApp := grpcapp.New(cfg)

	return &App{
		port: cfg.GRPC.Port,
		tokenTTL: cfg.JWT.TokenTTL,
		GRPCServer: grpcApp,
	}
}

