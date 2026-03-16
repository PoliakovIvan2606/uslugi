package task

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	models "notificate/internal/server/models/task"
	imageRepo "notificate/internal/server/repository/image"

	"github.com/segmentio/kafka-go"
)


type SendMessageBroker struct {
	TypePhoto string `json:"typePhoto"`
	TaskId int `json:"taskId"`
	Text string `json:"text"`
}

func(UC *UseCaseTask) AddTask(ctx context.Context, task models.AddTaskRequest) (int, error) {
	taskId, err := UC.repo.AddTask(ctx, task)
	if err != nil {
		return 0, err
	}


	if err = UC.repo.AddStatusImage(ctx, taskId, imageRepo.StatusNew, "task"); err != nil {
		return 0, fmt.Errorf("ошибка добавления картинки в БД: %w", err)
	}
	
	if task.GenerateImage {
		msg, err := json.Marshal(SendMessageBroker{
			TypePhoto: "task", 
			TaskId: taskId,
			Text: task.ShortDescription,
		})
		if err != nil {
			return 0, fmt.Errorf("ошибка создания сообщения в kafka AddTask: %w", err)
		}

		// TODO пробросить контекст в в UC
		err = UC.wMB.WriteMessages(context.Background(),
			kafka.Message{Value: msg},
		)

		if err != nil {
			return 0, fmt.Errorf("ошибка отправки сообщения в kafka AddTask: %w", err)
		}

		slog.Info("Сообщение отправлено", "ImageId", taskId)
	}

	return taskId, nil
}