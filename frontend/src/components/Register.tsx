import { useState } from 'react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { api } from '../utils/api';

interface RegisterProps {
  onRegister: (email: string, userId: string) => void;
  onSwitchToLogin: () => void;
  onCancel: () => void;
}

export function Register({ onRegister, onSwitchToLogin, onCancel }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (password.length < 4) {
      setError('Пароль должен содержать минимум 4 символа');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.register(email, password);
      
      if (response.UserId) {
        // After registration, automatically login
        const loginResponse = await api.login(email, password);
        
        if (loginResponse.Token) {
          onRegister(email, response.UserId);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Ошибка регистрации. Попробуйте другой email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2">Регистрация</h2>
          <p className="text-gray-600">Создайте аккаунт для размещения объявлений</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Пароль *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Минимум 4 символа</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Подтвердите пароль *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:underline"
            >
              Войти
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Продолжить без регистрации
          </button>
        </div>
      </div>
    </div>
  );
}