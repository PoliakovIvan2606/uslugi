package service

// import (
// 	"context"
// 	"encoding/json"
// 	models "notificate/internal/server/models/service"
// 	serviceRepo "notificate/internal/server/repository/service"
// 	mock_service "notificate/internal/server/usecases/service/mock"
// 	"testing"

// 	"github.com/segmentio/kafka-go"
// 	"github.com/stretchr/testify/require"
// 	"go.uber.org/mock/gomock"
// )

// func TestAddService(t *testing.T) {
// 	ServiceId := 1
// 	service := models.AddServiceRequest{
// 		Name:             "name",
// 		ShortDescription: "ShortDescription",
// 		AllDescription:   "allDescription",
// 		Category:         "category",
// 		Price:            100,
// 		NameSpecialist:   "Ivan",
// 		Experience:       10,
// 		Phone:            "89664519856",
// 		Email: "poliakov@mail.ru",
// 		Location:      "Moscow",
// 		GenerateImage: true,
// 	}

// 	ctl := gomock.NewController(t)
// 	defer ctl.Finish()

// 	mockRepo := mock_service.NewMockRepositoryService(ctl)
// 	mockRepo.EXPECT().AddService(service).Return(ServiceId, nil)
// 	mockRepo.EXPECT().AddImage(ServiceId, serviceRepo.StatusNew).Return(nil)

// 	mockKafka := mock_service.NewMockKafkaWriter(ctl)
// 	msg, _ := json.Marshal(SendMessageBroker{
// 			ServiceId: ServiceId,
// 			Text: service.ShortDescription,
// 	})
// 	mockKafka.EXPECT().WriteMessages(context.Background(), kafka.Message{Value: msg})
	

// 	UC := NewUseCaseService(mockRepo, mockKafka)

// 	resServiceId, err := UC.AddService(service)

// 	require.NoError(t, err)
// 	require.Equal(t, resServiceId, ServiceId)
// }

// func TestAddServiceError(t *testing.T) {
// 	require.NoError(t, nil)
// }