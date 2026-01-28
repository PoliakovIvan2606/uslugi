package image

import (
	"log"
	"net/http"
	"notificate/pkg/handler"
	"strconv"

	"github.com/gorilla/mux"
)

type GetImageResponse struct {
	Status string `json:"status"`
}

// добавить получение фото если произошла ошибка с получение через s3
func(router *ImageRouter) getImage(w http.ResponseWriter, r *http.Request) {
	// Извлекаем все переменные пути из запроса
    vars := mux.Vars(r)
    
    // Получаем значение по ключу, указанному в HandleFunc ("id")
    id := vars["id"]

	ServiceIdInt, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "ID должно состоять из цифр и быть не пустым", http.StatusBadRequest)
        return
	}

	status, err := router.UC.GetStatusImage(ServiceIdInt)
	if err != nil {
		http.Error(w, "Ошика получения Status: "+err.Error(), http.StatusBadRequest)
        return
	}
	
	if status == "created" {
		dataImage, err := router.UC.GetImage(r.Context(), router.s3, "image", "image/"+id+".jpeg")
		if err != nil {
			http.Error(w, "Ошика получения GetImage: "+err.Error(), http.StatusBadRequest)
			return
		}
	
	
		w.Header().Set("Content-Type", "image/jpeg")
		w.Header().Set("Content-Length", strconv.Itoa(len(dataImage)))
		_, err = w.Write(dataImage)
		if err != nil {
			log.Printf("Ошибка при отправке изображения: %v", err)
		}
	} else {
		out := GetImageResponse{Status: status}
		handler.Response(w, out)
	}
}

