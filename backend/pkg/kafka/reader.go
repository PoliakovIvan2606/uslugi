package kafka

import "github.com/segmentio/kafka-go"

func NewReader() *kafka.Reader {
	return kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		GroupID: "my-group",
		// Partition: partitionInt,
		Topic:   "test",
	})
}