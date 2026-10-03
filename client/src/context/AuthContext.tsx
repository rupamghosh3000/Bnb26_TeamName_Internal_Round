import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PaperAccount {
  startingCash: number;
  cashBalance: number;
}

interface AuthContextType {
  user: User | null;
  account: PaperAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<PaperAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('stockpulse_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.auth.me();
      setUser(data.user);
      setAccount(data.account);
    } catch (err) {
      api.clearToken();
      setUser(null);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
      setAccount(null);
    };

    window.addEventListener('stockpulse_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('stockpulse_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    api.setToken(res.token);
    setUser(res.user);
    setAccount(res.account);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    api.setToken(res.token);
    setUser(res.user);
    setAccount(res.account);
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setAccount(null);
  };

  const refreshAccount = async () => {
    try {
      const data = await api.auth.me();
      setAccount(data.account);
    } catch {
      // Ignore refresh error
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account,
        loading,
        login,
        register,
        logout,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
