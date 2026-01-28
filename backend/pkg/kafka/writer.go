package kafka

import "github.com/segmentio/kafka-go"

func NewWriter(host, port, topic string) *kafka.Writer {
	return kafka.NewWriter(kafka.WriterConfig{
		Brokers: []string{host + port},
		Topic:   topic,
	})
}