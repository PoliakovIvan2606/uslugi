package db

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PgConfig struct {
	username string
	password string
	host     string
	port     string
	database string
}

// NewClient creates new postgres client. Hi hpu are you doing
func NewClient(
	ctx context.Context,
	maxAttempts int,
	maxDelay time.Duration,
	dsn string,
	binary bool,
) (pool *pgxpool.Pool, err error) {
	pgxCfg, parseConfigErr := pgxpool.ParseConfig(dsn)
	if parseConfigErr != nil {
		log.Printf("Unable to parse config: %v\n", parseConfigErr)
		return nil, parseConfigErr
	}

	if binary {
		pgxCfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeCacheDescribe
	}

	pool, parseConfigErr = pgxpool.NewWithConfig(ctx, pgxCfg)
	if parseConfigErr != nil {
		log.Printf("Failed to parse PostgreSQL configuration due to error: %v\n", parseConfigErr)
		return nil, parseConfigErr
	}

	err = DoWithAttempts(func() error {
		pingErr := pool.Ping(ctx)
		if pingErr != nil {
			log.Printf("Failed to connect to postgres due to error %v... Going to do the next attempt\n", pingErr)
			return pingErr
		}

		return nil
	}, maxAttempts, maxDelay)
	if err != nil {
		log.Fatal("All attempts are exceeded. Unable to connect to PostgreSQL")
	}

	return pool, nil
}

func DoWithAttempts(fn func() error, maxAttempts int, delay time.Duration) error {
	var err error

	for maxAttempts > 0 {
		if err = fn(); err != nil {
			time.Sleep(delay)
			maxAttempts--

			continue
		}

		return nil
	}

	return err
}

func (c *PgConfig) ConnStringFromCfg() string {
	url := strings.Builder{}
	url.WriteString("postgresql://")
	url.WriteString(c.username)
	url.WriteString(":")
	url.WriteString(c.password)
	url.WriteString("@")
	url.WriteString(c.host)
	url.WriteString(":")
	url.WriteString(c.port)
	url.WriteString("/")
	url.WriteString(c.database)

	return url.String()
}