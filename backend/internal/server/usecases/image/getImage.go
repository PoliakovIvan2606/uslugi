package image

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)


func(UC *UseCaseImage) GetImage(ctx context.Context, client *s3.Client, bucket, key string) ([]byte, error) {
	out, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if err == nil {
		defer out.Body.Close()

		data, err := io.ReadAll(out.Body)
		if err != nil {
			return nil, fmt.Errorf("s3 read: %w", err)
		}
		return data, nil
	}

	// Получаем локальный файл если произошла ошибка при получении через s3
	path := filepath.Clean(filepath.Join("..", key))
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("local read: %w", err)
	}

	return data, nil
}