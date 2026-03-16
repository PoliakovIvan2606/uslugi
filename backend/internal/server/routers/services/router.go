package services

import (
	"context"
	models "notificate/internal/server/models/service"

	"github.com/gorilla/mux"
)

type UseCaseService interface {
	AddService(ctx context.Context, service models.AddServiceRequest) (int, error)
	GetAllListServices(ctx context.Context) ([]models.GetService, error)
}


type ServiceRouter struct {
	UC UseCaseService
}

func InitRouter(r *mux.Router, UC UseCaseService) {
	serviceRouter := ServiceRouter{UC: UC}
	chat := r.PathPrefix("/service").Subrouter()
	chat.HandleFunc("/addService", serviceRouter.addService).Methods("POST")
	chat.HandleFunc("/getListService", serviceRouter.getListService).Methods("GET")
}