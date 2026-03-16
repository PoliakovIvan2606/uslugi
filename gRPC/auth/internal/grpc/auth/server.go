package auth

import (
	"context"

	authv1 "github.com/PoliakovIvan2606/auth_proto/gen/go/auth"
	"google.golang.org/grpc"
	"google.golang.org/grpc/status"
	"google.golang.org/grpc/codes"
)

type Auth interface {
	Login(ctx context.Context, email, password string) (token string, err error)
	Register(ctx context.Context, email, password string) (userId int64, err error)
}

type serverAPI struct {
	authv1.UnimplementedAuthServer
	auth Auth
}

func Register(gRPC *grpc.Server, auth Auth) {
	authv1.RegisterAuthServer(gRPC, &serverAPI{auth: auth})
}

func (s *serverAPI) Login(
	ctx context.Context,
	req *authv1.LoginRequest,
) (*authv1.LoginResponse, error) {
	if err := validateLogin(req); err != nil {
		return nil, err
	}

	token, err := s.auth.Login(ctx, req.GetEmail(), req.GetPassword())
	if err != nil {
		return nil, status.Error(codes.Internal, "Internal error")
	}

	return &authv1.LoginResponse{
		Token: token,
	}, nil
}

func validateLogin(req *authv1.LoginRequest) error {
	if req.GetEmail() == "" {
		return status.Error(codes.InvalidArgument, "Not valid email")
	}

	if req.GetPassword() == "" {
		return status.Error(codes.InvalidArgument, "Not valid password")
	}

	return nil
}

func (s *serverAPI) Register(
	ctx context.Context,
	req *authv1.RegisterRequest,
) (*authv1.RegisterResponse, error) {
	if err := validateRquest(req); err != nil {
		return nil, err
	}

	userId, err := s.auth.Register(ctx, req.GetEmail(), req.GetPassword())
	if err != nil {
		return nil, status.Error(codes.Internal, "Internal error")
	}

	return &authv1.RegisterResponse{
		UserId: userId,
	}, nil
}

func validateRquest(req *authv1.RegisterRequest) error {
	if req.GetEmail() == "" {
		return status.Error(codes.InvalidArgument, "Not valid email")
	}

	if req.GetPassword() == "" {
		return status.Error(codes.InvalidArgument, "Not valid password")
	}

	return nil
}