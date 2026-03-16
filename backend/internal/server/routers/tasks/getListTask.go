package tasks

import (
	"net/http"
	"notificate/pkg/handler"
)

type GetTaskResponse struct {
	Id string `json:"id"`
	Title string `json:"title"`
	Description string `json:"description"`
	FullDescription string `json:"fullDescription"`
	Category string `json:"category"`
	Budget int `json:"budget"`
	Author string `json:"author"`
	Date string `json:"date"`
	Deadline string `json:"deadline"`
	Phone string `json:"phone"`
	Email string `json:"email"`
	Location string `json:"location"`
	Requirements []string `json:"requirements"`
}

func(router *TaskRouter) getListTask(w http.ResponseWriter, r *http.Request) {	
	tasks, err := router.UC.GetAllListTasks(r.Context())
	if err != nil {
		http.Error(w, "ошибка получения списка task"+err.Error(), http.StatusBadRequest)
	}

	out := []GetTaskResponse{}
	for _, task := range tasks {
		outtask := GetTaskResponse{}
		outtask.Id = task.Id
		outtask.Title = task.Title
		outtask.Description = task.ShortDescription
		outtask.FullDescription = task.AllDescription
		outtask.Category = task.Category
		outtask.Budget = task.Budget
		outtask.Author = task.Author
		outtask.Date = task.Date
		outtask.Deadline = task.Deadline
		outtask.Phone = task.Phone
		outtask.Email = task.Email
		outtask.Location = task.Location

		out = append(out, outtask)
	}
	
	handler.Response(w, out)
}