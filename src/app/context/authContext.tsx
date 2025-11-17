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
  /*   AUTH_ERROR_CODES, */
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

  // Clean up corrupted localStorage data on app start
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // If we have a refresh token but no auth token, clear everything
      if (refreshToken && !token) {
        console.log(
          '🧹 AuthProvider: Cleaning up corrupted auth data (refresh token without auth token)'
        );
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('sellerId');
        localStorage.removeItem('favorites');
      }

      // If we have a malformed token, clear it
      if (token && isTokenExpired(token) === null) {
        console.log(
          '🧹 AuthProvider: Cleaning up corrupted auth data (malformed token)'
        );
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('user');
        localStorage.removeItem('userName');
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('sellerId');
        localStorage.removeItem('favorites');
      }
    } catch (error) {
      console.warn('AuthProvider: Error during auth data cleanup:', error);
    }
  }, []); // Run once on mount

  // Cooldown/debounce for checkAuthState calls
  const checkAuthStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckAuthStateRef = useRef<number>(0);
  const CHECK_AUTH_STATE_COOLDOWN = 2000; // 2 seconds cooldown

  /**
   * Centralized function to clear auth state and redirect to login
   * This is the ONLY place where tokens should be cleared
   */
  const clearAuthState = useCallback(() => {
    console.log(' Clearing auth state - redirecting to login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites'); // Clear favorites on auth state clear
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUserInfo');
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
      console.log(' Auth invalid signal received:', error.message);
      AuthTestLogger.logRefreshInvalidScenario(error);
      clearAuthState();
    },
    [clearAuthState]
  );

  /**
   * Core checkAuthState function - simplified to only check for access token
   * Backend provides new tokens in response headers, no refresh token needed
   */
  const checkAuthStateCore = useCallback(async () => {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Use safe token parsing
      const tokenExpired = isTokenExpired(token);

      if (tokenExpired === null) {
        // Token is malformed - keep auth state, backend will provide new token
        console.log(
          ' Token format invalid, but backend will provide new token'
        );
        setIsLoggedIn(true);
      } else if (tokenExpired === true) {
        // Token is expired - keep auth state, backend will provide new token
        console.log(
          ' Token expired, but backend will provide new token in next request'
        );
        setIsLoggedIn(true);
      } else {
        // Token is valid
        console.log(' Token is valid');
        setIsLoggedIn(true);
      }
    } else {
      console.log('No access token found');
      setIsLoggedIn(false);
    }
  }, []);

  /**
   * Debounced checkAuthState function with cooldown
   */
  const debouncedCheckAuthState = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckAuthStateRef.current;

    if (timeSinceLastCheck < CHECK_AUTH_STATE_COOLDOWN) {
      console.log(
        ` CheckAuthState cooldown active (${
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

  // Handle network reconnection, app visibility changes, and token updates
  useEffect(() => {
    const handleOnline = () => {
      console.log(' Network reconnected, checking auth state...');
      AuthTestLogger.logOnlineAfterOfflineScenario();
      debouncedCheckAuthState();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log(' App became visible, checking auth state...');
        debouncedCheckAuthState();
      }
    };

    const handleTokenUpdate = (event: CustomEvent) => {
      console.log(' Token update event received in AuthContext:', {
        newToken: event.detail?.newToken
          ? `${event.detail.newToken.substring(0, 20)}...`
          : 'None',
        oldToken: event.detail?.oldToken
          ? `${event.detail.oldToken.substring(0, 20)}...`
          : 'None',
        tokenChanged: event.detail?.newToken !== event.detail?.oldToken,
      });

      // Update the logged-in state since we have a fresh token
      if (event.detail?.newToken) {
        console.log(' New token received, updating auth state');
        setIsLoggedIn(true);
        setError(null);

        // Optionally trigger a quick auth state check to validate the new token
        setTimeout(() => {
          console.log(' Validating new token...');
          debouncedCheckAuthState();
        }, 100);
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('tokenUpdated', handleTokenUpdate as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(
        'tokenUpdated',
        handleTokenUpdate as EventListener
      );

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
      localStorage.removeItem('userInfo');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('sellerId');
      localStorage.removeItem('favorites');
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('adminAuthToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUserInfo');

      // Remove all seller profile keys (seller:profile:*)
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('seller:profile:')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }

      sessionStorage.clear();
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Debug function to clear all auth data
  const clearAllAuthData = () => {
    console.log('🧹 Clearing all authentication data...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('sellerId');
    localStorage.removeItem('favorites');
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUserInfo');
    sessionStorage.clear();
    setIsLoggedIn(false);
    setError(null);
    console.log(' All authentication data cleared');
  };

  // Debug function to inspect localStorage
  const inspectAuthData = () => {
    console.log(' Current authentication data:');
    console.log(
      '  - authToken:',
      localStorage.getItem('authToken')
        ? `${localStorage.getItem('authToken')?.substring(0, 20)}...`
        : 'None'
    );
    console.log(
      '  - refreshToken:',
      localStorage.getItem('refreshToken')
        ? `${localStorage.getItem('refreshToken')?.substring(0, 20)}...`
        : 'None'
    );
    console.log(
      '  - userInfo:',
      localStorage.getItem('userInfo') ? 'Present' : 'None'
    );
    console.log('  - user:', localStorage.getItem('user') ? 'Present' : 'None');
    console.log('  - isLoggedIn:', isLoggedIn);
    console.log('  - error:', error);

    // Check if token is expired
    const token = localStorage.getItem('authToken');
    if (token) {
      const tokenExpired = isTokenExpired(token);
      console.log('  - tokenExpired:', tokenExpired);
    }
  };

  // Make debug functions available globally
  if (typeof window !== 'undefined') {
    (
      window as {
        clearAllAuthData?: () => void;
        inspectAuthData?: () => void;
      }
    ).clearAllAuthData = clearAllAuthData;
    (
      window as {
        clearAllAuthData?: () => void;
        inspectAuthData?: () => void;
      }
    ).inspectAuthData = inspectAuthData;
  }

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
