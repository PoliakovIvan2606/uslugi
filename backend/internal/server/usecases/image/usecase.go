package image

import (
	"context"

	"github.com/segmentio/kafka-go"
)


type RepositoryImage interface {
	ExistsImage(ctx context.Context, ServiceID int) (bool, error)
	UpdateImageStatus(ctx context.Context, ServiceID int, Status string) error
	GetStatusImage(ctx context.Context, ServiceID int, Type string) (string, error)
}

type KafkaWriter interface {
	WriteMessages(ctx context.Context, msgs ...kafka.Message) error
}

type UseCaseImage struct {
	repo RepositoryImage
	wMB KafkaWriter
}

func NewUseCaseImage(repo RepositoryImage, wMB KafkaWriter) *UseCaseImage {
	return &UseCaseImage{repo: repo, wMB: wMB}
}

func(UC *UseCaseImage) GetStatusImage(ctx context.Context, ServiceID int, Type string) (string, error) {
	status, err := UC.repo.GetStatusImage(ctx, ServiceID, Type)
	if err != nil {
		return "", nil
	}

	return status, nil
}
