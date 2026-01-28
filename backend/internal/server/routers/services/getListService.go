package services

import (
	"net/http"
	"notificate/pkg/handler"
)


type GetServiceResponse struct {
	Id string `json:"id"`
	Title string `json:"title"`
	Description string `json:"description"`
	FullDescription string `json:"fullDescription"`
	Category string `json:"category"`
	Price int `json:"price"`
	Author string `json:"author"`
	Experience int `json:"experience"` // опыт работы в годах
	Phone string `json:"phone"`
	Email string `json:"email"`
	Location string `json:"location"`
}

func(router *ServiceRouter) getListService(w http.ResponseWriter, r *http.Request) {	
	services, err := router.UC.GetAllListServices()
	if err != nil {
		http.Error(w, "ошибка получения списка service"+err.Error(), http.StatusBadRequest)
	}

	out := []GetServiceResponse{}
	for _, service := range *services {
		outService := GetServiceResponse{}
		outService.Id = service.Id
		outService.Title = service.Name
		outService.Description = service.ShortDescription
		outService.FullDescription = service.AllDescription
		outService.Category = service.Category
		outService.Price = service.Price
		outService.Author = service.NameSpecialist
		outService.Experience = service.Experience
		outService.Phone = service.Phone
		outService.Email = service.Email
		outService.Location = service.Location

		out = append(out, outService)
	}
	
	handler.Response(w, out)
}