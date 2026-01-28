package s3

import (
	"context"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	configS3 "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)



func NewS3Client(ctx context.Context, host, port, region string) *s3.Client {
    endpoint := "http://" + host + port // MinIO / другое S3-совместимое хранилище

    // Статические ключи (как в MinIO: minioadmin / minioadmin)
    cfg, err := configS3.LoadDefaultConfig(
        ctx,
        configS3.WithRegion(region),
        configS3.WithCredentialsProvider(
            credentials.NewStaticCredentialsProvider("minioadmin", "minioadmin", ""),
        ),
    )
    if err != nil {
        log.Fatal(err)
    }
	

    return s3.NewFromConfig(cfg, func(o *s3.Options) {
        o.BaseEndpoint = aws.String(endpoint)
        o.UsePathStyle = true          // важно для MinIO и многих S3-совместимых
        o.HTTPClient = &http.Client{}  // можно оставить по умолчанию
    })
}