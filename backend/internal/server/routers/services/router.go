package services

import (
	"database/sql"
	models "notificate/internal/server/models/service"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gorilla/mux"
	"github.com/segmentio/kafka-go"
)

type UseCaseService interface {
	AddService(service models.AddServiceRequest) (int, error)
	GetAllListServices() (*[]models.GetService, error)
}


type ServiceRouter struct {
	UC UseCaseService
	wMB *kafka.Writer
	s3 *s3.Client
	Db *sql.DB
}

func InitRouter(r *mux.Router, UC UseCaseService, wMB *kafka.Writer, s3 *s3.Client, Db *sql.DB) {
	serviceRouter := ServiceRouter{UC: UC, wMB: wMB, s3: s3, Db: Db}
	chat := r.PathPrefix("/service").Subrouter()
	chat.HandleFunc("/addService", serviceRouter.addService).Methods("POST")
	chat.HandleFunc("/getListService", serviceRouter.getListService).Methods("GET")
}