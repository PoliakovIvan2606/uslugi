package image

import (
	"context"
	"database/sql"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gorilla/mux"
	"github.com/segmentio/kafka-go"
)

type UseCaseImage interface {
	AddImage(ctx context.Context, client *s3.Client, data multipart.File, bucket, nameImage string, ImageId int) error
	GetImage(ctx context.Context, client *s3.Client, bucket, key string) ([]byte, error)
	GetStatusImage(ServiceID int) (string, error)
}


type ImageRouter struct {
	UC UseCaseImage
	wMB *kafka.Writer
	s3 *s3.Client
	Db *sql.DB
}

func InitRouter(r *mux.Router, UC UseCaseImage, wMB *kafka.Writer, s3 *s3.Client, Db *sql.DB) {
	ImageRouter := ImageRouter{UC: UC, wMB: wMB, s3: s3, Db: Db}
	chat := r.PathPrefix("/image").Subrouter()
	chat.HandleFunc("/{type:service|task}/{id:[0-9]+}", ImageRouter.getImage).Methods("GET")
	chat.HandleFunc("/{type:service|task}/{id:[0-9]+}", ImageRouter.addImage).Methods("POST")
}