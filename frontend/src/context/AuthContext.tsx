import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { User, LoginRequest, RegisterRequest, Role } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  quickLogin: (role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER') => Promise<void>;
  isAdmin: boolean;
  isLibrarian: boolean;
  isMember: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to verify token', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      // Auto login after registration
      await login({ usernameOrEmail: data.username, password: data.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const quickLogin = async (targetRole: 'ADMIN' | 'LIBRARIAN' | 'MEMBER') => {
    let credentials: LoginRequest;
    if (targetRole === 'ADMIN') {
      credentials = { usernameOrEmail: 'admin', password: 'Admin@123' };
    } else if (targetRole === 'LIBRARIAN') {
      credentials = { usernameOrEmail: 'librarian1', password: 'Lib@123' };
    } else {
      credentials = { usernameOrEmail: 'member1', password: 'Mem@123' };
    }
    await login(credentials);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isLibrarian = user?.role === 'ROLE_LIBRARIAN' || user?.role === 'ROLE_ADMIN';
  const isMember = user?.role === 'ROLE_MEMBER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        isAdmin,
        isLibrarian,
        isMember,
        refreshProfile,
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
