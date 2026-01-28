package internal

import (
	"context"
	"log/slog"
	"net/http"
	"notificate/internal/config"
	routerChat "notificate/internal/server/routers/chat"
	imageRouter "notificate/internal/server/routers/image"
	usecaseChat "notificate/internal/server/usecases/chat"
	imageUC "notificate/internal/server/usecases/image"

	imageRepo "notificate/internal/server/repository/image"
	serviceRepo "notificate/internal/server/repository/service"
	routerServices "notificate/internal/server/routers/services"
	serviceUC "notificate/internal/server/usecases/service"

	routerTasks "notificate/internal/server/routers/tasks"

	"notificate/pkg/db"
	"notificate/pkg/kafka"
	"notificate/pkg/s3"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)


func Run(cfg *config.Config) error {
	ctx := context.Background()

	// подключение к БД
	connectDB, err := db.NewConnectSqliteDB(cfg.DB.Path)
	if err != nil {
		return err
	}
	slog.Info("Подключение к SQLite")


	// брокер сообщений
	wMB := kafka.NewWriter(cfg.Kafka.Host, cfg.Kafka.Port, cfg.Kafka.Topic)
	slog.Info("Подключение к брокеру сообщений")

	// s3 клиент
	clientS3 := s3.NewS3Client(ctx, cfg.S3.Host, cfg.S3.Port, cfg.S3.Region)
	slog.Info("Подключение к s3")
	
	// роутер
	r := mux.NewRouter()

	// фотографии
	ImageRepo := imageRepo.NewRepositoryImage(connectDB)
	ImageUC := imageUC.NewUseCaseImage(ImageRepo, wMB)
	imageRouter.InitRouter(r, ImageUC, wMB, clientS3, connectDB)

	// услуги
	ServiceRepo := serviceRepo.NewRepositoryService(connectDB)
	ServiceUC := serviceUC.NewUseCaseService(ServiceRepo, wMB)
	routerServices.InitRouter(r, ServiceUC, wMB, clientS3, connectDB)

	// задачи
	routerTasks.InitRouter(r)
	

	// чат
	useCaseChat := usecaseChat.NewUseCase(connectDB)
	routerChat.InitRouter(r, useCaseChat)

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