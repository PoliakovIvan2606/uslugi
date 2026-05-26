package task

import (
	"context"
	models "notificate/internal/server/models/task"

	"github.com/segmentio/kafka-go"
)


type RepositoryTask interface {
	AddTask(ctx context.Context, s models.AddTaskRequest) (int, error)
	AddStatusImage(ctx context.Context, taskID int, Status, Type string) error
	GetAllListTasks(ctx context.Context) ([]models.GetTask, error)
	GetTasksByUserId(ctx context.Context, id int) ([]models.GetTask, error) 
}

type KafkaWriter interface {
	WriteMessages(ctx context.Context, msgs ...kafka.Message) error
}

type UseCaseTask struct {
	repo RepositoryTask
	wMB KafkaWriter
}

func NewUseCasetask(repo RepositoryTask, wMB KafkaWriter) *UseCaseTask {
	return &UseCaseTask{repo: repo, wMB: wMB}
}

func(UC *UseCaseTask) GetAllListTasks(ctx context.Context) ([]models.GetTask, error) {
	tasks, err := UC.repo.GetAllListTasks(ctx)
	if err != nil {
		return nil, err
	}
	return tasks, nil
}

func(UC *UseCaseTask) GetTasksByUserId(ctx context.Context, id int) ([]models.GetTask, error) {
	tasks, err := UC.repo.GetTasksByUserId(ctx, id)
	if err != nil {
		return nil, err
	}
	return tasks, nil
}