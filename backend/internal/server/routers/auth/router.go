package auth

import (
	"encoding/json"
	"net/http"
	"notificate/internal/server/client/auth/grpc"
	"notificate/pkg/handler"
	"strconv"

	"github.com/gorilla/mux"
)

type AuthRouter struct {
	grpc grpc.Client
}

func InitRouter(r *mux.Router, grpc grpc.Client) {
	authRouter := AuthRouter{grpc: grpc}
	chat := r.PathPrefix("/auth").Subrouter()
	chat.HandleFunc("/login", authRouter.Login).Methods("POST")
	chat.HandleFunc("/register", authRouter.Register).Methods("POST")
}

type LoginRequest struct {
	Email string
	Password string
}


type LogonResponse struct {
	Token string
}

func (rout *AuthRouter) Login(w http.ResponseWriter, r *http.Request) {
	const op = "AuthRouter.Login"

	in := LoginRequest{}
	out := LogonResponse{}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "Неверный JSON: "+err.Error(), http.StatusBadRequest)
        return
	}

	token, err := rout.grpc.Login(r.Context(), in.Email, in.Password)
	if err != nil {
		http.Error(w, "Ошибка автоизации: "+err.Error(), http.StatusBadRequest)
        return
	}

	out.Token = token
	handler.Response(w, out)
}	

type RegisterRequest struct {
	Email string
	Password string
}


type RegisterResponse struct {
	UserId string
}

func (rout *AuthRouter) Register(w http.ResponseWriter, r *http.Request) {
	const op = "AuthRouter.Register"

	in := RegisterRequest{}
	out := RegisterResponse{}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "Неверный JSON: "+err.Error(), http.StatusBadRequest)
        return
	}

	userId, err := rout.grpc.Register(r.Context(), in.Email, in.Password)
	if err != nil {
		http.Error(w, "Ошибка автоизации: "+err.Error(), http.StatusBadRequest)
        return
	}

	out.UserId = strconv.Itoa(int(userId))
	handler.Response(w, out)
}	