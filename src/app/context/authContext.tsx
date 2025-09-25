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
  checkAuthState: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  isLoading: false,
  error: null,
  clearError: () => {},
  checkAuthState: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check login state on mount from localStorage with token validation
    const checkAuthState = async () => {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        // Check if token is expired
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const isExpired = payload.exp < currentTime;

          if (isExpired) {
            console.log('Auth token is expired, attempting refresh...');
            try {
              const refreshResponse = await AuthService.refreshToken();
              if (refreshResponse.data && !refreshResponse.error) {
                console.log('Token refreshed successfully on app startup');
                setIsLoggedIn(true);
              } else {
                console.log(
                  'Token refresh failed on app startup, clearing auth state'
                );
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userInfo');
                setIsLoggedIn(false);
              }
            } catch (error) {
              console.error('Token refresh error on app startup:', error);
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userInfo');
              setIsLoggedIn(false);
            }
          } else {
            console.log('Auth token is valid');
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthState();
  }, []);

  // Handle network reconnection and app visibility changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network reconnected, checking auth state...');
      checkAuthState();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('App became visible, checking auth state...');
        checkAuthState();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

      // Clear all authentication-related data
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('sellerId');
      sessionStorage.clear();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const checkAuthState = async () => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const isExpired = payload.exp < currentTime;

        if (isExpired) {
          console.log('Auth token is expired, attempting refresh...');
          try {
            const refreshResponse = await AuthService.refreshToken();
            if (refreshResponse.data && !refreshResponse.error) {
              console.log('Token refreshed successfully');
              setIsLoggedIn(true);
            } else {
              console.log('Token refresh failed, clearing auth state');
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userInfo');
              setIsLoggedIn(false);
            }
          } catch (error) {
            console.error('Token refresh error:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        isLoading,
        error,
        clearError,
        checkAuthState,
      }}
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
