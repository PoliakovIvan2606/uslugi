package auth

import (
	"auth/internal/config"
	"auth/internal/domains/models"
	"auth/pkg/jwt"
	"auth/internal/storage"
	"context"
	"errors"
	"fmt"
	"log/slog"

	"golang.org/x/crypto/bcrypt"
)

type UserRepo interface {
	SaveUser (ctx context.Context, email string, passHash []byte) (uid int64, err error)
	User (ctx context.Context, email string) (user models.User, err error)
}

type Auth struct{
	userRepo UserRepo
	cfg config.JWT
}

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists = errors.New("user exists")
)

func New(
	userRepo UserRepo,
	cfg config.JWT,
) *Auth {
	return &Auth{
		userRepo: userRepo,
		cfg: cfg,
	}
}

func (a *Auth) Login(ctx context.Context, email, password string) (token string, err error) {
	const op = "Auth.Login"

	slog.Info("Logining user")

	user, err := a.userRepo.User(ctx, email)
	if err != nil {
		if errors.Is(err, storage.ErrUserNotFound) {
			slog.Error("user not found", slog.String("err", err.Error()))

			return "", ErrInvalidCredentials
		}

		slog.Error("failed to get user", slog.String("err", err.Error()))
		
		return "", fmt.Errorf("%s: %w", op, err)
	}

	if err := bcrypt.CompareHashAndPassword(user.PassHash, []byte(password)); err != nil {
		slog.Error("invalid credentials", slog.String("err", err.Error()))

		return "", fmt.Errorf("%s: %w", op, ErrInvalidCredentials)
	}

	token, err = jwt.NewToken(user, a.cfg.Secret, a.cfg.TokenTTL)
	if err != nil {
		slog.Error("failed created token", slog.String("err", err.Error()))

		return "", fmt.Errorf("%s: %w", op, err)
	}

	slog.Info("User logined")

	return token, nil
}

func (a *Auth) Register(ctx context.Context, email, password string) (userId int64, err error) {
	const op = "auth.RegisterNewUser"

	slog.Info("Registring user")

	passHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		slog.Error("failed generate password", slog.String("err", err.Error()))

		return 0, fmt.Errorf("%s: %w", op, err)
	}

	id, err := a.userRepo.SaveUser(ctx, email, passHash)
	if err != nil {
		if errors.Is(err, storage.ErrUserExists) {
			slog.Error("user alredy exists", slog.String("err", err.Error()))

			return 0, fmt.Errorf("%s: %w", op, ErrUserExists)
		}
		slog.Error("failed sdd user", slog.String("err", err.Error()))

		return 0, fmt.Errorf("%s: %w", op, err)
	}

	slog.Info("user registred")

	return id, nil
}

