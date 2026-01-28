package generator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type CreateImageResponse struct {
	ID        		string `json:"id"`
	Description     string   `json:"description,omitempty"`
	CreatedAt       *string   `json:"createdAt,omitempty"`
	CreatedBy       string   `json:"createdBy,omitempty"`
	ModifiedAt      *string   `json:"modifiedAt,omitempty"`
	Done      		bool   `json:"done"`
	Metadata      	*string   `json:"metadata,omitempty"`
}

func GenerateImage(client *http.Client, token string, textBroker string) string {
	data := CreateData(textBroker)
	

    jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("POST запрос на создание картинки")
	req, err := http.NewRequest(
		"POST", 
		"https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync", 
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		fmt.Println(err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer " + token)
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
	}
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}
    fmt.Println(string(body))
	
	
	// Парсим ID операции
	var opResp CreateImageResponse
	if err := json.Unmarshal(body, &opResp); err != nil {
		log.Fatal("Ошибка парсинга ID:", err)
	}
	
	if opResp.ID == "" {
		log.Fatal("ID операции не найден")
	}
	
	fmt.Println("ID операции: ", opResp.ID)
	return opResp.ID
}