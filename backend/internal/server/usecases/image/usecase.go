package image

import (
	"context"

	"github.com/segmentio/kafka-go"
)


type RepositoryImage interface {
	ExistsImage(ServiceID int) (bool, error)
	UpdateImageStatus(ServiceID int, Status string) error
	GetStatusImage(ServiceID int) (string, error)
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

func(UC *UseCaseImage) GetStatusImage(ServiceID int) (string, error) {
	status, err := UC.repo.GetStatusImage(ServiceID)
	if err != nil {
		return "", nil
	}

	return status, nil
}
