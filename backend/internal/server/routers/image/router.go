package image

import (
	"context"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gorilla/mux"
)

type UseCaseImage interface {
	AddImage(ctx context.Context, client *s3.Client, data multipart.File, bucket, nameImage string, ImageId int) error
	GetImage(ctx context.Context, client *s3.Client, bucket, key string) ([]byte, error)
	GetStatusImage(ctx context.Context, ServiceID int, Type string) (string, error)
}


type ImageRouter struct {
	UC UseCaseImage
	s3 *s3.Client
}

func InitRouter(r *mux.Router, UC UseCaseImage, s3 *s3.Client) {
	ImageRouter := ImageRouter{UC: UC, s3: s3}
	chat := r.PathPrefix("/image").Subrouter()
	chat.HandleFunc("/{type:service|task}/{id:[0-9]+}", ImageRouter.getImage).Methods("GET")
	chat.HandleFunc("/{type:service|task}/{id:[0-9]+}", ImageRouter.addImage).Methods("POST")
}