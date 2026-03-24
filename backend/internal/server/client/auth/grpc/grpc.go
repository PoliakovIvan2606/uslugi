package grpc

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	authv1 "github.com/PoliakovIvan2606/auth_proto/gen/go/auth"
	grpclog "github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/logging"
	grpcretry "github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/retry"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
)


type Client struct {
	api authv1.AuthClient
}

func New(ctx context.Context, addr string, timeout time.Duration, retryCount int) (*Client, error) {
	const op = "grpc.New"

	retryOpts := []grpcretry.CallOption{
		grpcretry.WithCodes(codes.NotFound, codes.Aborted, codes.DeadlineExceeded),
		grpcretry.WithMax(uint(retryCount)),
		grpcretry.WithPerRetryTimeout(timeout),
	}

	logOpts := []grpclog.Option{
		grpclog.WithLogOnEvents(grpclog.PayloadSent, grpclog.PayloadReceived),
	}

	cc, err := grpc.DialContext(ctx, addr, 
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithChainUnaryInterceptor(
			grpclog.UnaryClientInterceptor(InterseptorLogger(), logOpts...),
			grpcretry.UnaryClientInterceptor(retryOpts...),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return &Client{
		api: authv1.NewAuthClient(cc),
	}, nil
}

func InterseptorLogger() grpclog.Logger {
	return grpclog.LoggerFunc(func(ctx context.Context, lvl grpclog.Level, msg string, fields... any) {
		slog.Log(ctx, slog.Level(lvl), msg, fields...)
	})
}

func (c *Client) Login(ctx context.Context, emial, password string) (token string, err error) {
	const op = "grpc.Login"

	resp, err := c.api.Login(ctx, &authv1.LoginRequest{
		Email: emial,
		Password: password,
	})
	if err != nil {
		return "", fmt.Errorf("%s: %w", op, err)
	}

	return resp.Token, nil
}

func (c *Client) Register(ctx context.Context, emial, password string) (id int64, err error) {
	const op = "grpc.Register"

	resp, err := c.api.Register(ctx, &authv1.RegisterRequest{
		Email: emial,
		Password: password,
	})
	if err != nil {
		return 0, fmt.Errorf("%s: %w", op, err)
	}

	return resp.UserId, nil
}