'use client';

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { AuthService } from '@/app/api/services/client/auth/authService';
import {
  isTokenExpired,
  AUTH_ERROR_CODES,
  AuthError,
} from '@/app/utils/token-utils';
import { PAGE_URLS } from '@/app/utils/page_url';
import { AuthTestLogger } from '@/app/utils/auth-test-logger';

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
  clearAuthState: () => void;
  handleAuthInvalid: (error: AuthError) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  isLoading: false,
  error: null,
  clearError: () => {},
  checkAuthState: async () => {},
  clearAuthState: () => {},
  handleAuthInvalid: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cooldown/debounce for checkAuthState calls
  const checkAuthStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckAuthStateRef = useRef<number>(0);
  const CHECK_AUTH_STATE_COOLDOWN = 2000; // 2 seconds cooldown

  /**
   * Centralized function to clear auth state and redirect to login
   * This is the ONLY place where tokens should be cleared
   */
  const clearAuthState = useCallback(() => {
    console.log('🚨 Clearing auth state - redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites'); // Clear favorites on auth state clear
    setIsLoggedIn(false);
    setError(null);

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = PAGE_URLS.LOGIN;
    }
  }, []);

  /**
   * Handle auth invalid signals from API calls
   * This is the ONLY place that should clear auth state
   */
  const handleAuthInvalid = useCallback(
    (error: AuthError) => {
      console.log('🚨 Auth invalid signal received:', error.message);
      AuthTestLogger.logRefreshInvalidScenario(error);
      clearAuthState();
    },
    [clearAuthState]
  );

  /**
   * Core checkAuthState function with safe token parsing
   */
  const checkAuthStateCore = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
      // Use safe token parsing
      const tokenExpired = isTokenExpired(token);

      if (tokenExpired === null) {
        // Token is malformed - treat as possibly expired but don't clear
        console.log('⚠️ Token format invalid, treating as possibly expired');
        if (navigator.onLine) {
          try {
            const refreshResponse = await AuthService.refreshToken();
            if (refreshResponse.data && !refreshResponse.error) {
              console.log('✅ Token refreshed successfully after format check');
              setIsLoggedIn(true);
            } else {
              console.log('❌ Token refresh failed after format check');
              // Don't clear tokens here - let AuthProvider handle auth invalid signals
            }
          } catch (error) {
            console.error('❌ Token refresh error after format check:', error);
            if (
              error instanceof AuthError &&
              error.code === AUTH_ERROR_CODES.AUTH_INVALID
            ) {
              handleAuthInvalid(error);
            } else {
              // Network or other errors - keep auth state
              console.log(
                '🌐 Network/other error during token refresh, keeping auth state'
              );
              setIsLoggedIn(true);
            }
          }
        } else {
          console.log('🌐 Offline with malformed token, keeping auth state');
          setIsLoggedIn(true);
        }
      } else if (tokenExpired === true) {
        // Token is definitely expired
        if (navigator.onLine) {
          console.log('🔄 Token expired, attempting refresh...');
          try {
            const refreshResponse = await AuthService.refreshToken();
            if (refreshResponse.data && !refreshResponse.error) {
              console.log('✅ Token refreshed successfully');
              setIsLoggedIn(true);
            } else {
              console.log('❌ Token refresh failed');
              // Don't clear tokens here - let AuthProvider handle auth invalid signals
            }
          } catch (error) {
            console.error('❌ Token refresh error:', error);
            if (
              error instanceof AuthError &&
              error.code === AUTH_ERROR_CODES.AUTH_INVALID
            ) {
              handleAuthInvalid(error);
            } else {
              // Network or other errors - keep auth state
              console.log(
                '🌐 Network/other error during token refresh, keeping auth state'
              );
              setIsLoggedIn(true);
            }
          }
        } else {
          console.log(
            '🌐 Token expired but offline, keeping auth state for offline use'
          );
          AuthTestLogger.logOfflineExpiredTokenScenario();
          setIsLoggedIn(true);
        }
      } else {
        // Token is valid
        console.log('✅ Token is valid');
        setIsLoggedIn(true);
      }
    } else {
      console.log('❌ No tokens found');
      setIsLoggedIn(false);
    }
  }, [handleAuthInvalid]);

  /**
   * Debounced checkAuthState function with cooldown
   */
  const debouncedCheckAuthState = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckAuthStateRef.current;

    if (timeSinceLastCheck < CHECK_AUTH_STATE_COOLDOWN) {
      console.log(
        `⏳ CheckAuthState cooldown active (${
          CHECK_AUTH_STATE_COOLDOWN - timeSinceLastCheck
        }ms remaining)`
      );
      return;
    }

    lastCheckAuthStateRef.current = now;

    // Clear any existing timeout
    if (checkAuthStateTimeoutRef.current) {
      clearTimeout(checkAuthStateTimeoutRef.current);
    }

    // Set new timeout
    checkAuthStateTimeoutRef.current = setTimeout(async () => {
      await checkAuthStateCore();
    }, 100); // Small delay to batch rapid calls
  }, [checkAuthStateCore]);

  useEffect(() => {
    // Initial auth state check on mount
    checkAuthStateCore();
  }, [checkAuthStateCore]);

  // Handle network reconnection and app visibility changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network reconnected, checking auth state...');
      AuthTestLogger.logOnlineAfterOfflineScenario();
      debouncedCheckAuthState();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ App became visible, checking auth state...');
        debouncedCheckAuthState();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Clean up timeout on unmount
      if (checkAuthStateTimeoutRef.current) {
        clearTimeout(checkAuthStateTimeoutRef.current);
      }
    };
  }, [debouncedCheckAuthState]);

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
      localStorage.removeItem('favorites'); // Clear favorites on logout
      sessionStorage.clear();
    }
  };

  const clearError = () => {
    setError(null);
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
        checkAuthState: debouncedCheckAuthState,
        clearAuthState,
        handleAuthInvalid,
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
