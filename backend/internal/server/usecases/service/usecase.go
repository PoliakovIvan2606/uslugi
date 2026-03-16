package service

import (
	"context"
	models "notificate/internal/server/models/service"

	"github.com/segmentio/kafka-go"
)


type RepositoryService interface {
	AddService(ctx context.Context, service models.AddServiceRequest) (int, error)
	AddStatusImage(ctx context.Context, ServiceID int, Status, Type string) error
	GetAllListServices(ctx context.Context) ([]models.GetService, error)
}

type KafkaWriter interface {
	WriteMessages(ctx context.Context, msgs ...kafka.Message) error
}

type UseCaseService struct {
	repo RepositoryService
	wMB KafkaWriter
}

func NewUseCaseService(repo RepositoryService, wMB KafkaWriter) *UseCaseService {
	return &UseCaseService{repo: repo, wMB: wMB}
}

func(UC *UseCaseService) GetAllListServices(ctx context.Context) ([]models.GetService, error) {
	services, err := UC.repo.GetAllListServices(ctx)
	if err != nil {
		return nil, err
	}
	return services, nil
}
