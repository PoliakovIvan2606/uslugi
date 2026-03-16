package config

import "github.com/ilyakaznacheev/cleanenv"

type Config struct {
	Server   Server   `yaml:"server"`
	Postgres Postgres `yaml:"postgres"`
	Kafka    Kafka    `yaml:"kafka"`
	S3       S3       `yaml:"s3"`
}

type Server struct {
	Port string `yaml:"port" env:"SERVER_PORT" env-default:"8081"`
	Host string `yaml:"host" env:"SERVER_HOST" env-default:"localhost"`
}

type Postgres struct {
	User   string `yaml:"user" env:"DB_USER" env-default:"postgres"`
	Pass   string `yaml:"pass" env:"DB_PASS" env-default:"postgres"`
	Host   string `yaml:"host" env:"DB_HOST" env-default:"localhost"`
	Port   string `yaml:"port" env:"DB_PORT" env-default:"5432"`
	NameDB string `yaml:"name_db" env:"DB_NAME" env-default:"postgres"`
}

type S3 struct {
	Port   string `yaml:"port" env:"S3_ORT" env-default:"9000"`
	Host   string `yaml:"host" env:"S3_HOST" env-default:"localhost"`
	Region string `yaml:"region" env:"S3_REGION" env-default:"us-east-1"`
}

type Kafka struct {
	Port  string `yaml:"port" env:"KAFKA_PORT" env-default:"9092"`
	Host  string `yaml:"host" env:"KAFKA_HOST" env-default:"localhost"`
	Topic string `yaml:"topic" env:"KAFKA_TOPIC" env-default:"test"`
}

func Init(path string) (*Config, error) {
	var cfg Config
	if err := cleanenv.ReadConfig(path, &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

