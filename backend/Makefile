# Load and export .env variables
include .env
export $(shell sed 's/=.*//' .env)

server:
	go run cmd/server/main.go

generator:
	go run cmd/generator/main.go

genmock:
	mockgen -source=internal/usecases/service/usecase.go \
	-destination=internal/usecases/service/mock/mock_repository.go