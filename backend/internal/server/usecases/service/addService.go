package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	models "notificate/internal/server/models/service"
	imageRepo "notificate/internal/server/repository/image"

	"github.com/segmentio/kafka-go"
)

func(UC *UseCaseService) AddService(service models.AddServiceRequest) (int, error) {
	ServiceId, err := UC.repo.AddService(service)
	if err != nil {
		return 0, err
	}

	// TODO надо прокинуть переменные подумать как правильно
	if err = UC.repo.AddStatusImage(ServiceId, imageRepo.StatusNew); err != nil {
		return 0, fmt.Errorf("ошибка добавления картинки в БД: %w", err)
	}
	
	if service.GenerateImage {
		msg, err := json.Marshal(SendMessageBroker{
			ServiceId: ServiceId,
			Text: service.ShortDescription,
		})
		if err != nil {
			return 0, fmt.Errorf("ошибка создания сообщения в kafka AddService: %w", err)
		}

		// TODO пробросить контекст в в UC
		err = UC.wMB.WriteMessages(context.Background(),
			kafka.Message{Value: msg},
		)

		if err != nil {
			return 0, fmt.Errorf("ошибка отправки сообщения в kafka AddService: %w", err)
		}

		slog.Info("Сообщение отправлено", "ImageId", ServiceId)
	}

	return ServiceId, nil
}