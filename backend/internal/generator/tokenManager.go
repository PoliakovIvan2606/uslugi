package generator

import (
	"context"
	"log/slog"
	"os/exec"
	"strings"
	"sync"
	"time"
)

type TokenManager struct {
	mu    sync.RWMutex
	token string
}

func NewTokenManager(ctx context.Context) (*TokenManager, error) {
	tm := &TokenManager{}

	// получаем токен при старте
	if err := tm.updateToken(); err != nil {
		return nil, err
	}

	// автообновление
	go tm.run(ctx)

	return tm, nil
}

func (t *TokenManager) run(ctx context.Context) {
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := t.updateToken(); err != nil {
				slog.Error("token update failed", "error", err)
			}
		case <-ctx.Done():
			return
		}
	}
}

func (t *TokenManager) updateToken() error {
	cmd := exec.Command("yc", "iam", "create-token")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return err
	}
	s := string(out)
	token := strings.TrimSpace(s[:len(s)-1])

	t.mu.Lock()
	t.token = token
	t.mu.Unlock()

	slog.Info("token updated")
	return nil
}

func (t *TokenManager) Get() string {
	t.mu.RLock()
	defer t.mu.RUnlock()
	return t.token
}