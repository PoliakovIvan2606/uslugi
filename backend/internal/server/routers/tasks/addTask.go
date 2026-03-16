package tasks

import (
	"encoding/json"
	"net/http"
	models "notificate/internal/server/models/task"
	"notificate/pkg/handler"
)

type AddTaskResponse struct {
	ServiceId int `json:"serviceId"`
}

func(roter *TaskRouter) addTask(w http.ResponseWriter, r *http.Request) {
	in := models.AddTaskRequest{}
	out := AddTaskResponse{}

    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
        http.Error(w, "Неверный JSON: "+err.Error(), http.StatusBadRequest)
        return
    }
	
	if err := in.Validate(); err != nil {
		http.Error(w, "Ошибка валидации: "+err.Error(), http.StatusBadRequest)
        return
	}

	ServiceId, err := roter.UC.AddTask(r.Context(), in)
	if err != nil {
		http.Error(w, "Ошибка добавления сервиса: "+err.Error(), http.StatusBadRequest)
        return
	}

	out.ServiceId = ServiceId
	handler.Response(w, out)
}