package models

import (
	"errors"
)

var ErrEmptyField = errors.New("поле не должно быть нулевым")

type AddServiceRequest struct {
	Name string `json:"name"`
	ShortDescription string `json:"shortDescription"`
	AllDescription string `json:"allDescription"`
	Category string `json:"category"`
	Price int `json:"price"`
	NameSpecialist string `json:"nameSpecialist"`
	Experience int `json:"experience"` // опыт работы в годах
	Phone string `json:"phone"`
	Email string `json:"email"`
	Location string `json:"location"`
	GenerateImage bool `json:"generateImage"`
}

// TODO надо написать тесты
func(in *AddServiceRequest) Validate() error {
	if in.Name == "" || in.ShortDescription == "" || in.Category == "" || 
	in.Price == 0 || in.NameSpecialist == "" || in.Experience == 0 || 
	in.Phone == "" || in.Email == "" || in.Location == "" {
		return ErrEmptyField
	}
	return nil
}

type GetService struct {
	Id string `json:"id"`
	Name string `json:"name"`
	ShortDescription string `json:"shortDescription"`
	AllDescription string `json:"allDescription"`
	Category string `json:"category"`
	Price int `json:"price"`
	NameSpecialist string `json:"nameSpecialist"`
	Experience int `json:"experience"` // опыт работы в годах
	Phone string `json:"phone"`
	Email string `json:"email"`
	Location string `json:"location"`
}