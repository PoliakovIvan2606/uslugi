package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"notificate/internal/config"
	"notificate/internal/generator"
	imageRepo "notificate/internal/server/repository/image"
	"notificate/pkg/db"
	"notificate/pkg/kafka"
	"notificate/pkg/s3"
)

type GetMessageBroker struct {
	TypePhoto string `json:"typePhoto"`
	ServiceId int `json:"serviceId"`
	Text string `json:"text"`
}

var (
	pathConfig = "configs/config.yaml"
)

func main() {
	ctx := context.Background()

	slog.Info("Получение токена")
	tokenManager, err := generator.NewTokenManager(ctx)
	if err != nil {
		slog.Error("token init failed", "error", err)
		return
	}

	cfg, err := config.Init(pathConfig)
	if err != nil {
		slog.Error("получение конфига", "error", err)
	}

	r := kafka.NewReader()
	defer r.Close()
	slog.Info("Подключение к брокеру сообщений consumer")
	
	// работа с запросами создаём клиента через которого будем делать запросы
	clientHttp := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns: 100,
		},
	}
	
	clientS3 := s3.NewS3Client(ctx, cfg.S3.Host, cfg.S3.Port, cfg.S3.Region)
	slog.Info("Подключение к s3")

	connectDB, err := db.NewConnectSqliteDB(cfg.DB.Path)
	if err != nil {
		slog.Error("подключение к БД", "error", err)
	}
	slog.Info("Подключение к БД")

	repo := imageRepo.NewRepositoryImage(connectDB)
	

	fmt.Println("Start generate image")

	for {
		m, err := r.ReadMessage(ctx)
		if err != nil {
			break
		}
		
		fmt.Printf("Получено сообщение: %s, Offser: %d, Parittion: %d\n ", string(m.Value), m.Offset, m.Partition)
		var getMsg GetMessageBroker
		err = json.Unmarshal(m.Value, &getMsg)
		if err != nil {
			fmt.Println(err)
		}

		fmt.Println(getMsg.Text)

		// отправка сообщения inProcessing
		repo.UpdateImageStatus(getMsg.ServiceId, imageRepo.StatusInProgress)

		// генерируем картинку
		operationID := generator.GenerateImage(clientHttp, tokenManager.Get(), getMsg.Text)

		// получаем картинку
		dataImage := generator.GetImage(clientHttp, operationID, tokenManager.Get())

		time.Sleep(5 * time.Second)

		filePath := filepath.Join(getMsg.TypePhoto, strconv.Itoa(getMsg.ServiceId) + ".jpeg")

		// добавление в s3
		generator.UploadImageToS3(
			ctx, 
			clientS3, 
			dataImage, 
			"image", 
			filePath,
		)

		// добавление файла локально для доплнительной проверки он получает файл из s3
		generator.DownloadImagae(
			ctx, 
			clientS3, 
			"image", 
			"image/"+filePath,
		)
		
		// отправка сообщения created
		repo.UpdateImageStatus(getMsg.ServiceId, imageRepo.StatusCreated)
	}
}