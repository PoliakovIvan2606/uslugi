package generator

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type GetImageResponse struct {
	CreateImageResponse
	Response ImageResponse `json:"response"`
}

type ImageResponse struct {
    Type        string `json:"@type"`
    Image       string `json:"image"`        // ← ваш base64 "asdasda"
    ModelVersion string `json:"modelVersion"`
}

func GetImage(client *http.Client, operationID string, token string) *[]byte {
    url := fmt.Sprintf("https://llm.api.cloud.yandex.net/operations/%s", operationID)
	
    
    for {
        // Запрос и парсинг...
        req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			fmt.Println(err)
		}
        req.Header.Set("Authorization", "Bearer " + token)
        resp, err := client.Do(req)
		if err != nil {
			fmt.Println(err)
		}
        defer resp.Body.Close()
        
        body, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Println(err)
		}
        var getResp GetImageResponse
        json.Unmarshal(body, &getResp)
        
        // Проверяем условие выхода
        if getResp.Done && getResp.Response.Image != "" {
			data, err := base64.StdEncoding.DecodeString(getResp.Response.Image)
			if err != nil {
				fmt.Println(err)
			}
			return &data
            // SaveImage(getResp.Response.Image, "image")
            // fmt.Println("✅ Готово!")
            // return
        }
        
        // Ждем и повторяем
        fmt.Printf("Ожидание... (осталось: %s)\n", operationID)
        time.Sleep(2 * time.Second)
    }
}
