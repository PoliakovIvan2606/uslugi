package service

import (
	"context"
	models "notificate/internal/server/models/service"

	"github.com/segmentio/kafka-go"
)


type RepositoryService interface {
	AddService(service models.AddServiceRequest) (int, error)
	AddStatusImage(ServiceID int, Status string) error
	GetAllListServices() (*[]models.GetService, error)
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

type SendMessageBroker struct {
	ServiceId int `json:"serviceId"`
	Text string `json:"text"`
}

func(UC *UseCaseService) GetAllListServices() (*[]models.GetService, error) {
	services, err := UC.repo.GetAllListServices()
	if err != nil {
		return nil, err
	}
	return services, nil
}
