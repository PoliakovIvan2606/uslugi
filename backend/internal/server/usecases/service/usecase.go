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
	GetServiceByUserId(ctx context.Context, id int) ([]models.GetService, error)
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

func (UC *UseCaseService) AddService(ctx context.Context, service models.AddServiceRequest) (int, error) {
    // 1. Сохраняем в репозиторий
    id, err := UC.repo.AddService(ctx, service)
    if err != nil {
        return 0, err
    }

    // 2. Пример логики с Kafka (если необходимо)
    // err = UC.wMB.WriteMessages(ctx, kafka.Message{...})

    return id, nil
}

func (UC *UseCaseService) GetServiceByUserId(ctx context.Context, id int) ([]models.GetService, error) {
	services, err := UC.repo.GetServiceByUserId(ctx, id)
	if err != nil {
		return nil, err
	}
	return services, nil
}