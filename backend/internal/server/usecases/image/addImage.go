package image

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	imageRepo "notificate/internal/server/repository/image"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)


func(UC *UseCaseImage) AddImage(ctx context.Context, client *s3.Client, data multipart.File, bucket, nameDir string, ServiceId int) error {
	exists, err := UC.repo.ExistsImage(ServiceId)
	if err != nil {
		return err
	}

	fileName := fmt.Sprintf("%d.jpeg", ServiceId)
	filePath := filepath.Join("image", nameDir, fileName)

	if exists {
		// 2. Отправляем в S3
		_, err := client.PutObject(ctx, &s3.PutObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(filePath),            // например "images/img1.png"
			Body:   data,
			ContentType: aws.String("image/jpeg"), // или "image/jpeg"
		})
		if err != nil {
			fmt.Println(err)
		}

		// 4. Генерируем уникальное имя файла и путь
		// Лучше использовать UUID или хэш, но для примера возьмем имя + расширение
		filePathLocal := filepath.Join("..", filePath)

		// 5. Создаем файл на диске
		dst, err := os.Create(filePathLocal)
		if err != nil {
			return fmt.Errorf("не удалось создать файл на сервере")
		}
		defer dst.Close()

		// 6. Копируем содержимое файла из запроса в новый файл
		_, err = io.Copy(dst, data)
		if err != nil {
			return fmt.Errorf("ошибка записи файла")
		}

		if err = UC.repo.UpdateImageStatus(ServiceId, imageRepo.StatusCreated); err != nil {
			return fmt.Errorf("ошибка добавления картинки в БД: %w", err)
		}
	} else {
		return fmt.Errorf("service не был найден")
	}

	return nil
}