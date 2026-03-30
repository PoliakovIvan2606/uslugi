package models

import (
	"errors"
	"fmt"
)

var ErrEmptyField = errors.New("поле не должно быть нулевым")

type AddTaskRequest struct {
	Name string `json:"name"`
	UserId int `json:"-"`
	ShortDescription string `json:"shortDescription"`
	AllDescription string `json:"allDescription"`
	Category string `json:"category"`
	Budget int `json:"budget"`
	NameCustomer string `json:"nameCustomer"`
	Deadline string `json:"deadline"`
	Phone string `json:"phone"`
	Email string `json:"email"`
	Location string `json:"location"`
	Requirements string `json:"requirements"`
	GenerateImage bool `json:"generateImage"`
}

// TODO надо написать тесты
func(in *AddTaskRequest) Validate() error {
	if in.Name == "" || in.ShortDescription == "" || in.Category == "" || 
	in.Budget == 0 || in.NameCustomer == "" || in.Deadline == "" ||
	in.Phone == "" || in.Email == "" || in.Location == "" || in.Requirements == "" {
		return fmt.Errorf("%s", in)
	}
	return nil
}

type GetTask struct {
	Id string `json:"id"`
	UserId int `json:"userId"`
	Title string `json:"title"`
	ShortDescription string `json:"shortDescription"`
	AllDescription string `json:"allDescription"`
	Category string `json:"category"`
	Budget int `json:"budget"`
	Author string `json:"author"`
	Date string `json:"date"`
	Deadline string `json:"deadline"`
	Phone string `json:"phone"`
	Email string `json:"email"`
	Location string `json:"location"`
	Requirements []string `json:"requirements"`
	GenerateImage bool `json:"generateImage"`
}