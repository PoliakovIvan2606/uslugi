package generator

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func DownloadImagae(ctx context.Context, client *s3.Client, backet, key string) {
	out, err := client.GetObject(ctx, &s3.GetObjectInput{
        Bucket: aws.String(backet),
        Key:    aws.String(key),
    })
    if err != nil {
        log.Fatal("get:", err)
    }
    defer out.Body.Close()
	
    imageBytes, err := io.ReadAll(out.Body)
    if err != nil {
        log.Fatal("read:", err)
    }
    // Создаем папку если нет
    if err := os.MkdirAll("image", 0755); err != nil {
        fmt.Printf("ошибка создания папки: %w", err)
        // return fmt.Errorf("ошибка создания папки: %w", err)
    }

    // Имя файла с timestamp
    // filename := fmt.Sprintf("image_%s.jpeg", time.Now().Format("20060102_150405"))
    filepath := filepath.Join("../", key)
    
    // Сохраняем
    if err := os.WriteFile(filepath, imageBytes, 0644); err != nil {
		fmt.Printf("ошибка сохранения файла: %w", err)
        // return fmt.Errorf("ошибка сохранения файла: %w", err)
    }
    
    fmt.Printf("Изображение сохранено: %s\n", filepath)
}
