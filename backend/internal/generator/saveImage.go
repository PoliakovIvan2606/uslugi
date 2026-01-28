package generator

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

func SaveImage(base64Image, folderPath string) error {
    // Декодируем base64
    imageBytes, err := base64.StdEncoding.DecodeString(base64Image)
    if err != nil {
        return fmt.Errorf("ошибка декодирования base64: %w", err)
    }
    
    // Создаем папку если нет
    if err := os.MkdirAll(folderPath, 0755); err != nil {
        return fmt.Errorf("ошибка создания папки: %w", err)
    }
    
    // Имя файла с timestamp
    filename := fmt.Sprintf("image_%s.jpeg", time.Now().Format("20060102_150405"))
    filepath := filepath.Join(folderPath, filename)
    
    // Сохраняем
    if err := os.WriteFile(filepath, imageBytes, 0644); err != nil {
        return fmt.Errorf("ошибка сохранения файла: %w", err)
    }
    
    fmt.Printf("Изображение сохранено: %s\n", filepath)
    return nil
}
