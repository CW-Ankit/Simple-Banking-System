import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [isLoading, setIsLoading] = useState(false);
  const api = authApi();

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
      setToken(data.token);
      setUserEmail(email);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail('');
  };

  const value = useMemo(
    () => ({
      token,
      userEmail,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    }),
    [token, userEmail, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
