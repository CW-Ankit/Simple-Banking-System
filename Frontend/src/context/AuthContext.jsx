import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
<<<<<<< HEAD
=======
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [isSystemUser, setIsSystemUser] = useState(() => localStorage.getItem('isSystemUser') === 'true');
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  const [isLoading, setIsLoading] = useState(false);
  const api = authApi();

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
<<<<<<< HEAD
      localStorage.setItem('userEmail', email);
      setToken(data.token);
      setUserEmail(email);
=======
      localStorage.setItem('userEmail', data.user?.email || email);
      localStorage.setItem('userName', data.user?.name || '');
      localStorage.setItem('isSystemUser', String(Boolean(data.user?.systemUser)));
      setToken(data.token);
      setUserEmail(data.user?.email || email);
      setUserName(data.user?.name || '');
      setIsSystemUser(Boolean(data.user?.systemUser));
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
<<<<<<< HEAD
    setToken(null);
    setUserEmail('');
=======
    localStorage.removeItem('userName');
    localStorage.removeItem('isSystemUser');
    setToken(null);
    setUserEmail('');
    setUserName('');
    setIsSystemUser(false);
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
  };

  const value = useMemo(
    () => ({
      token,
      userEmail,
<<<<<<< HEAD
=======
      userName,
      isSystemUser,
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    }),
<<<<<<< HEAD
    [token, userEmail, isLoading],
=======
    [token, userEmail, userName, isSystemUser, isLoading],
>>>>>>> c1a4beb3d2eda78b35b34ac0d2f992b54be6aecc
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
