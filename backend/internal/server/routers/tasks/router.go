package tasks

import (
	"github.com/gorilla/mux"
)


type TaskRouter struct {

}

func InitRouter(r *mux.Router) {
	taskRouter := TaskRouter{}
	chat := r.PathPrefix("/task").Subrouter()
	chat.HandleFunc("/getListTask", taskRouter.getListTask).Methods("GET")
}

