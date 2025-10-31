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
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isLoggedIn: false,
  isLoading: false,
  error: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  clearError: () => {},
  checkAuthState: async () => {},
});

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const clearAdminAuthState = useCallback(() => {
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUserInfo');
    sessionStorage.clear();
    setIsLoggedIn(false);
    setError(null);
    router.replace('/admin/login');
  }, [router]);

  const handleUnauthorized = useCallback(
    (err: unknown) => {
      console.error('Admin unauthorized:', err);
      if (
        err instanceof AuthError &&
        err.code === AUTH_ERROR_CODES.AUTH_INVALID
      ) {
        clearAdminAuthState();
      } else {
        clearAdminAuthState();
      }
    },
    [clearAdminAuthState]
  );

  const checkAuthState = useCallback(async () => {
    if (cooldownRef.current) return;
    cooldownRef.current = setTimeout(() => {
      cooldownRef.current = null;
    }, 2000);

    try {
      const token = localStorage.getItem('adminAuthToken');
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (!token || !refreshToken) {
        clearAdminAuthState();
        return;
      }

      const expired = isTokenExpired(token);
      if (expired === true || expired === null) {
        const res = await AuthService.refreshToken();
        if (res.error || !res.data) {
          clearAdminAuthState();
          return;
        }
      }

      setIsLoggedIn(true);
    } catch (err) {
      handleUnauthorized(err);
    }
  }, [clearAdminAuthState, handleUnauthorized]);

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
          clearAdminAuthState();
          return { success: false, error: '관리자 권한이 없습니다.' };
        }

        const authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userInfo = localStorage.getItem('userInfo');
        if (authToken) localStorage.setItem('adminAuthToken', authToken);
        if (refreshToken)
          localStorage.setItem('adminRefreshToken', refreshToken);
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
    [clearAdminAuthState]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      toast.success('로그아웃 되었습니다.');
    } catch (err) {
      toast.error('로그아웃 중 문제가 발생했습니다.');
    } finally {
      clearAdminAuthState();
      setIsLoading(false);
    }
  }, [clearAdminAuthState]);

  useEffect(() => {
    checkAuthState();
    const onVisible = () => {
      if (!document.hidden) checkAuthState();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [checkAuthState]);

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
