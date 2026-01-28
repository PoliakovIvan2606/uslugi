package services

import (
	"encoding/json"
	"net/http"
	models "notificate/internal/server/models/service"
	"notificate/pkg/handler"
)

type AddServiceResponse struct {
	ServiceId int `json:"serviceId"`
}

func(roter *ServiceRouter) addService(w http.ResponseWriter, r *http.Request) {
	in := models.AddServiceRequest{}
	out := AddServiceResponse{}

	// Парсим JSON из body в структуру
    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
        http.Error(w, "Неверный JSON: "+err.Error(), http.StatusBadRequest)
        return
    }
	
	if err := in.Validate(); err != nil {
		http.Error(w, "Ошибка валидации: "+err.Error(), http.StatusBadRequest)
        return
	}

	ServiceId, err := roter.UC.AddService(in)
	if err != nil {
		http.Error(w, "Ошибка добавления сервиса: "+err.Error(), http.StatusBadRequest)
        return
	}

	out.ServiceId = ServiceId
	handler.Response(w, out)
}