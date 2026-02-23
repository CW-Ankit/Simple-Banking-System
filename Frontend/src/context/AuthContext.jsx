import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [isSystemUser, setIsSystemUser] = useState(() => localStorage.getItem('isSystemUser') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const api = authApi();

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user?.email || email);
      localStorage.setItem('userName', data.user?.name || '');
      localStorage.setItem('isSystemUser', String(Boolean(data.user?.systemUser)));
      setToken(data.token);
      setUserEmail(data.user?.email || email);
      setUserName(data.user?.name || '');
      setIsSystemUser(Boolean(data.user?.systemUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isSystemUser');
    setToken(null);
    setUserEmail('');
    setUserName('');
    setIsSystemUser(false);
  };

  const value = useMemo(
    () => ({
      token,
      userEmail,
      userName,
      isSystemUser,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    }),
    [token, userEmail, userName, isSystemUser, isLoading],
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
