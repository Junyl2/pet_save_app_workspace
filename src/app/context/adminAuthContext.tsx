'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthService } from '@/app/api/services/client/auth/authService';
import {
  isTokenExpired,
  AUTH_ERROR_CODES,
  AuthError,
} from '@/app/utils/token-utils';
import { PAGE_URLS } from '@/app/utils/page_url';

interface AdminAuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    identifier: string,
    password: string,
    loginType?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthState: () => Promise<void>;
  clearAuthState: () => void;
  handleAuthInvalid: (error: AuthError) => void;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isLoggedIn: false,
  isLoading: false,
  error: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  clearError: () => {},
  checkAuthState: async () => {},
  clearAuthState: () => {},
  handleAuthInvalid: () => {},
});

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);
  const CHECK_INTERVAL = 2000;

  /** Clear admin auth state and redirect */
  const clearAuthState = useCallback(() => {
    console.log('🧹 Clearing admin auth state');
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminUserInfo');
    sessionStorage.clear();
    setIsLoggedIn(false);
    setError(null);
    router.replace('/admin/login');
  }, [router]);

  /** Handle invalid auth errors */
  const handleAuthInvalid = useCallback(
    (error: AuthError) => {
      console.warn('Admin auth invalid:', error.message);
      if (error.code === AUTH_ERROR_CODES.AUTH_INVALID) {
        clearAuthState();
      } else {
        clearAuthState();
      }
    },
    [clearAuthState]
  );

  /**
   * Core checkAuthState:
   * We trust backend token rotation; we only verify if the token is missing or malformed.
   */
  const checkAuthStateCore = useCallback(async () => {
    const token = localStorage.getItem('adminAuthToken');

    if (!token) {
      console.log('No admin token found');
      setIsLoggedIn(false);
      return;
    }

    const expired = isTokenExpired(token);

    if (expired === null) {
      console.warn(
        'Malformed admin token; keeping state until backend refresh'
      );
      setIsLoggedIn(true);
      return;
    }

    // If expired, backend will refresh automatically via header
    if (expired === true) {
      console.log('Admin token expired; backend will refresh on next request');
      setIsLoggedIn(true);
      return;
    }

    console.log('Admin token valid');
    setIsLoggedIn(true);
  }, []);

  /** Debounced version to prevent spam */
  const checkAuthState = useCallback(async () => {
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL) {
      console.log('Admin auth check skipped due to cooldown');
      return;
    }
    lastCheckRef.current = now;

    if (checkCooldownRef.current) clearTimeout(checkCooldownRef.current);
    checkCooldownRef.current = setTimeout(checkAuthStateCore, 100);
  }, [checkAuthStateCore]);

  /** Login */
  const login = useCallback(
    async (identifier: string, password: string, loginType = 'GENERAL') => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await AuthService.loginWithCredentials(
          identifier,
          password,
          loginType
        );

        if (error || !data) {
          setError(error ?? '로그인 실패');
          return { success: false, error };
        }

        const permissions = Array.isArray(data.data?.permissions)
          ? (data.data.permissions as string[])
          : [];

        if (!permissions.includes('ADMIN')) {
          toast.error('관리자 권한이 없습니다.');
          clearAuthState();
          return { success: false, error: '관리자 권한이 없습니다.' };
        }

        // Copy existing tokens as admin tokens for separation
        const authToken = localStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo');
        if (authToken) localStorage.setItem('adminAuthToken', authToken);
        if (userInfo) localStorage.setItem('adminUserInfo', userInfo);

        setIsLoggedIn(true);
        toast.success('관리자 로그인 성공');
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : '로그인 실패';
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [clearAuthState]
  );

  /** Logout */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      toast.success('로그아웃 되었습니다.');
    } catch {
      toast.error('로그아웃 중 문제가 발생했습니다.');
    } finally {
      clearAuthState();
      setIsLoading(false);
    }
  }, [clearAuthState]);

  /** Initial auth check & token update listener */
  useEffect(() => {
    checkAuthStateCore();

    const handleVisible = () => {
      if (!document.hidden) checkAuthState();
    };

    const handleTokenUpdate = (event: CustomEvent) => {
      const newToken = event.detail?.newToken;
      if (!newToken) return;

      console.log('Admin context detected token update:', {
        newToken: `${newToken.substring(0, 20)}...`,
      });

      // Sync admin token with latest access token
      localStorage.setItem('adminAuthToken', newToken);
      setIsLoggedIn(true);
    };

    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('tokenUpdated', handleTokenUpdate as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener(
        'tokenUpdated',
        handleTokenUpdate as EventListener
      );
      if (checkCooldownRef.current) clearTimeout(checkCooldownRef.current);
    };
  }, [checkAuthState, checkAuthStateCore]);

  return (
    <AdminAuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        error,
        login,
        logout,
        clearError: () => setError(null),
        checkAuthState,
        clearAuthState,
        handleAuthInvalid,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = React.useContext(AdminAuthContext);
  if (!ctx)
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
};
