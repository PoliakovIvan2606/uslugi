package generator

import (
	"bytes"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func UploadImageToS3(ctx context.Context, client *s3.Client, data *[]byte, bucket, filePath string) {	
    // 2. Отправляем в S3
    _, err := client.PutObject(ctx, &s3.PutObjectInput{
        Bucket: aws.String(bucket),
        Key:    aws.String("image/"+filePath),            // например "images/img1.png"
        Body:   bytes.NewReader(*data),
        ContentType: aws.String("image/jpeg"), // или "image/jpeg"
    })
	if err != nil {
		fmt.Println(err)
	}
}