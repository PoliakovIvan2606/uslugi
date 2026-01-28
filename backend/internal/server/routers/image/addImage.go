package image

import (
	"net/http"
	"notificate/pkg/handler"
	"strconv"

	"github.com/gorilla/mux"
)


type AddImageResponse struct {
	Status string `json:"status"`
}

func(router *ImageRouter) addImage(w http.ResponseWriter, r *http.Request) {
	out := AddImageResponse{}

	// Извлекаем все переменные пути из запроса
    vars := mux.Vars(r)

    // Получаем значение по ключу, указанному в HandleFunc ("id")
    ServiceID := vars["id"]
	typeImage := vars["type"]

	ServiceIDInt, err := strconv.Atoi(ServiceID)
	if err != nil {
		http.Error(w, "Ошибка фалидации: id не должно быть пустым и содержать символы", http.StatusBadRequest)
		return
	}

	// 2. Разбираем multipart/form-data
	// MaxMemory: сколько памяти использовать для буфера перед записью во временный файл
	err = r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Ошибка парсинга формы", http.StatusBadRequest)
		return
	}

	// 3. Получаем файл из формы по имени поля (например, "photo")
	file, _, err := r.FormFile("photo") // "photo" - имя поля в HTML-форме
	if err != nil {
		http.Error(w, "Ошибка получения файла", http.StatusBadRequest)
		return
	}
	defer file.Close() // Важно закрыть файл после использования

	if err := router.UC.AddImage(r.Context(), router.s3, file, "image", typeImage, ServiceIDInt); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	out.Status = "ok"
	handler.Response(w, out)
}

