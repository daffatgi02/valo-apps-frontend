// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, UserSession } from '@/lib/api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  login: (callbackUrl: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchAccount: (userId: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('valorant_token');
      if (storedToken) {
        apiService.setToken(storedToken);
        setToken(storedToken);
        await loadProfile();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        handleAuthError();
      }
    } catch (error) {
      handleAuthError();
    }
  };

  const handleAuthError = () => {
    setUser(null);
    setToken(null);
    apiService.clearToken();
  };

  const login = async (callbackUrl: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.processCallback(callbackUrl);
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        
        setToken(newToken);
        setUser(userData);
        apiService.setToken(newToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleAuthError();
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    
    try {
      await apiService.refreshData();
      await loadProfile();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const switchAccount = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.switchAccount(userId);
      
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        
        setToken(newToken);
        setUser(userData);
        apiService.setToken(newToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Switch account error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshProfile,
        switchAccount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}