import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [isSystemUser, setIsSystemUser] = useState(() => localStorage.getItem('isSystemUser') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const api = authApi();

  const hydrateUser = (user) => {
    localStorage.setItem('userId', user?._id || '');
    localStorage.setItem('userEmail', user?.email || '');
    localStorage.setItem('userName', user?.name || '');
    localStorage.setItem('isSystemUser', String(Boolean(user?.systemUser)));

    setUserId(user?._id || '');
    setUserEmail(user?.email || '');
    setUserName(user?.name || '');
    setIsSystemUser(Boolean(user?.systemUser));
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const syncSession = async () => {
      try {
        const data = await api.me();
        if (!cancelled) {
          hydrateUser(data.user || {});
        }
      } catch {
        if (!cancelled) {
          logout();
        }
      }
    };

    syncSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      hydrateUser(data.user || { email });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isSystemUser');
    setToken(null);
    setUserId('');
    setUserEmail('');
    setUserName('');
    setIsSystemUser(false);
  };

  const value = useMemo(
    () => ({
      token,
      userId,
      userEmail,
      userName,
      isSystemUser,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    }),
    [token, userId, userEmail, userName, isSystemUser, isLoading],
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
