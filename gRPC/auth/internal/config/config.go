package config

import (
	"time"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	GRPC GRPC `yaml:"gRPC"`
	Postgres Postgres `yaml:"postgres"`
	JWT JWT `yaml:"jwt"`
}

type GRPC struct {
	Port string `yaml:"port" env:"GRPC_PORT" env-default:":44044"` 
	Host string `yaml:"host" env:"GRPC_HOST" env-default:"localhost"` 
	Timeout time.Duration `yaml:"timeout" env:"GRPC_TIMEOUT" env-default:"10h"`
}

type Postgres struct {
	User string `yaml:"user" env:"DB_USER" env-default:"postgres"` 
	Pass string `yaml:"pass" env:"DB_PASS" env-default:"postgres"` 
	Host string `yaml:"host" env:"DB_HOST" env-default:"localhost"` 
	Port string `yaml:"port" env:"DB_PORT" env-default:"5432"` 
	NameDB string `yaml:"name_db" env:"DB_NAME" env-default:"postgres"` 
}

type JWT struct {
	Secret string `yaml:"secret" env:"JWT_SECRET"` 
	TokenTTL time.Duration `yaml:"token_ttl" env:"TOKEN_TTL" env-default:"1h"` 
}

func Init(path string) (*Config, error) {
	var cfg Config
    if err := cleanenv.ReadConfig(path, &cfg); err != nil {
        return nil, err
    }
    return &cfg, nil
}