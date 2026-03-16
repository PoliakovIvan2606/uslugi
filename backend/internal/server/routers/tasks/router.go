package tasks

import (
	"context"
	models "notificate/internal/server/models/task"

	"github.com/gorilla/mux"
)

type UseCaseTask interface {
	AddTask(ctx context.Context, task models.AddTaskRequest) (int, error)
	GetAllListTasks(ctx context.Context) ([]models.GetTask, error)
}

type TaskRouter struct {
	UC UseCaseTask
}

func InitRouter(r *mux.Router, UC UseCaseTask) {
	taskRouter := TaskRouter{UC: UC}
	chat := r.PathPrefix("/task").Subrouter()
	chat.HandleFunc("/getListTask", taskRouter.getListTask).Methods("GET")
	chat.HandleFunc("/addTask", taskRouter.addTask).Methods("POST")
}