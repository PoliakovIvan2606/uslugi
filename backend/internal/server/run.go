package internal

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"notificate/internal/config"
	"notificate/internal/server/client/auth/grpc"
	"notificate/internal/server/middleware"
	routerChat "notificate/internal/server/routers/chat"
	imageRouter "notificate/internal/server/routers/image"
	usecaseChat "notificate/internal/server/usecases/chat"
	imageUC "notificate/internal/server/usecases/image"
	"os"
	"time"

	imageRepo "notificate/internal/server/repository/image"
	serviceRepo "notificate/internal/server/repository/service"
	chatRepo "notificate/internal/server/repository/chat"
	taskRepo "notificate/internal/server/repository/task"
	routerAuth "notificate/internal/server/routers/auth"
	routerServices "notificate/internal/server/routers/services"
	routerTask "notificate/internal/server/routers/tasks"
	serviceUC "notificate/internal/server/usecases/service"
	taskUC "notificate/internal/server/usecases/task"

	"notificate/pkg/db"
	"notificate/pkg/kafka"
	"notificate/pkg/s3"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)


func Run(cfg *config.Config) error {
	ctx := context.Background()

	// подключение к БД
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
	defer pgClient.Close()

	// брокер сообщений
	wMB := kafka.NewWriter(cfg.Kafka.Host, cfg.Kafka.Port, cfg.Kafka.Topic)
	slog.Info("Подключение к брокеру сообщений")

	// s3 клиент
	clientS3 := s3.NewS3Client(ctx, cfg.S3.Host, cfg.S3.Port, cfg.S3.Region)
	slog.Info("Подключение к s3")
	
	// роутер
	r := mux.NewRouter()

	// auth
	gRPCClient, err := grpc.New(ctx, "localhost:44044", 4*time.Second, 5)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to conected gRPC: %v", err))
		os.Exit(1)
	}
	slog.Info("Contected gRPC")

	routerAuth.InitRouter(r, *gRPCClient)

	api := r.PathPrefix("/").Subrouter() 
	
	api.Use(func(next http.Handler) http.Handler {
		return middleware.AuthMiddleware(next, cfg.JWT)
	})

	// фотографии
	ImageRepo := imageRepo.NewRepositoryImage(pgClient)
	ImageUC := imageUC.NewUseCaseImage(ImageRepo, wMB)
	imageRouter.InitRouter(api, ImageUC, clientS3)

	// услуги
	ServiceRepo := serviceRepo.NewRepositoryService(pgClient)
	ServiceUC := serviceUC.NewUseCaseService(ServiceRepo, wMB)
	routerServices.InitRouter(api, ServiceUC)

	// задачи
	TaskRepo := taskRepo.NewRepositoryTask(pgClient)
	TaskUC := taskUC.NewUseCasetask(TaskRepo, wMB)
	routerTask.InitRouter(api, TaskUC)

	// чат
	repoChat := chatRepo.NewRepositoryChat(pgClient)
	useCaseChat := usecaseChat.NewUseCase(repoChat)
	routerChat.InitRouter(api, useCaseChat)
	

	// cors
	c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:80"}, // фронт
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
        AllowedHeaders:   []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
    })

	handler := c.Handler(r)

	slog.Info("старт сервера", "port", cfg.Server.Port)
	if err := http.ListenAndServe(cfg.Server.Host + cfg.Server.Port, handler); err != nil {
		return err
	}
	return nil
}