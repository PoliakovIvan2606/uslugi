package grpcapp

import (
	"auth/internal/config"
	transportAuth "auth/internal/grpc/auth"
	serviceAuth "auth/internal/services/auth"
	"auth/internal/storage"
	"auth/pkg/db"
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
)


type App struct {
	port string
	gRPCServer *grpc.Server
	pgClient *pgxpool.Pool
}

func New(cfg config.Config) *App {
	gRPCServer := grpc.NewServer()

	// Иницилизировать хранилище
	pgDsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		cfg.Postgres.User,
		cfg.Postgres.Pass,
		cfg.Postgres.Host,
		cfg.Postgres.Port,
		cfg.Postgres.NameDB,
	)

	pgClient, err := db.NewClient(context.Background(), 5, 3*time.Second, pgDsn, false)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to initialize database: %v", err))
		os.Exit(1)
	}

	slog.Info("Conected DB")

	RepoAuth := storage.NewRepositoryAuth(pgClient)
	ServiceAuth := serviceAuth.New(RepoAuth, cfg.JWT)
	transportAuth.Register(gRPCServer, ServiceAuth)

	return &App{
		port: cfg.GRPC.Port,
		gRPCServer: gRPCServer,
		pgClient: pgClient,
	}
}

func (a *App) MustRun() {
	if err := a.Run(); err != nil {
		panic(err)
	}
}

func (a *App) Run() error {
	const op = "grpcapp.Run"
	
	l, err := net.Listen("tcp", a.port)
	if err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	slog.Info("starting GRPC server", slog.String("addr", l.Addr().String()))

	if err := a.gRPCServer.Serve(l); err != nil {
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}

func (a *App) Stop() {
	const op = "grpcapp.Stop"

	slog.Info("sotping GRPC server", slog.String("op", op))

	a.gRPCServer.GracefulStop()
	a.pgClient.Close()
}