'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/app/api/services/client/auth/authService';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (
    identifier: string,
    password: string,
    loginType?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  isLoading: false,
  error: null,
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check login state on mount from localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (
    identifier: string,
    password: string,
    loginType: string = 'GENERAL'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.loginWithCredentials(
        identifier,
        password,
        loginType
      );

      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }

      if (response.data) {
        setIsLoggedIn(true);
        return { success: true };
      }

      return { success: false, error: 'Login failed - no data received' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the real logout API
      await AuthService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state regardless of API call result
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, isLoading, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
