import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import {
  AUTH_ERROR_CODES,
  AuthError,
  isTokenExpired as safeIsTokenExpired,
} from '@/app/utils/token-utils';
import { AuthTestLogger } from '@/app/utils/auth-test-logger';
import { isPublicEndpoint } from '../utils/endpointClassifier';
import { getFromLocalStorage } from '../utils/storageUtils';
import { ensureAxiosHeaders } from '../utils/headerUtils';
import { apiLogger } from '../utils/logger';

/**
 * Check if a JWT token is expired
 */
const isTokenExpired = (token: string): boolean => {
  const result = safeIsTokenExpired(token);
  return result === true;
};

// Track refresh token attempts to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

/**
 * Response success handler
 */
export function responseSuccessHandler(response: AxiosResponse): AxiosResponse {
  // Return blob responses directly
  if (response.config.responseType === 'blob') {
    return response;
  }
  return response;
}

/**
 * Response error handler with token refresh logic
 */
export async function responseErrorHandler(
  error: AxiosError,
  axiosInstance: AxiosInstance
): Promise<AxiosResponse | never> {
  const originalRequest = error.config;

  // Handle network errors (no response.status)
  if (!error.response) {
    apiLogger.logNetworkError({
      url: error.config?.url,
      message: error.message,
      code: error.code,
    });

    AuthTestLogger.logNetworkErrorScenario(error, 'API request');
    return Promise.reject(error);
  }

  // Handle 401/403 authentication errors
  if (error.response.status === 401 || error.response.status === 403) {
    const isPublic = isPublicEndpoint(
      error.config?.url,
      error.config?.method
    );
    const isRefreshEndpoint =
      error.config?.url?.includes('/auth/refresh') ?? false;
    const isLoginEndpoint =
      error.config?.url?.includes('/auth/login') ?? false;

    apiLogger.logAuthError({
      status: error.response.status,
      url: error.config?.url,
      isPublic,
      isRefreshEndpoint,
      isLoginEndpoint,
      hasAuthToken: !!getFromLocalStorage('authToken'),
      hasRefreshToken: !!getFromLocalStorage('refreshToken'),
      authTokenExpired: getFromLocalStorage('authToken')
        ? isTokenExpired(getFromLocalStorage('authToken')!)
        : 'No token',
      refreshTokenExpired: getFromLocalStorage('refreshToken')
        ? isTokenExpired(getFromLocalStorage('refreshToken')!)
        : 'No refresh token',
    });

    // For public endpoints, login, and refresh endpoints, return original error
    if (isPublic || isRefreshEndpoint || isLoginEndpoint) {
      // If refresh endpoint returns 401/403, signal auth invalid
      if (isRefreshEndpoint) {
        apiLogger.logRefreshSignal(
          'Refresh endpoint returned 401/403 - signaling auth invalid'
        );
        const authError = new AuthError(
          AUTH_ERROR_CODES.AUTH_INVALID,
          'Refresh token is invalid',
          error
        );
        return Promise.reject(authError);
      }

      // For public endpoints, ensure failures don't affect auth state
      if (isPublic) {
        apiLogger.info(
          '🌐',
          'Public endpoint error - not affecting auth state',
          undefined
        );
      }

      return Promise.reject(error);
    }

    const refreshToken = getFromLocalStorage('refreshToken');
    if (refreshToken && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              const hdrs = ensureAxiosHeaders(originalRequest.headers);
              if (typeof token === 'string') {
                hdrs.set('Authorization', `Bearer ${token}`);
              }
              originalRequest.headers = hdrs;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { AuthService } = await import(
          '../services/client/auth/authService'
        );

        apiLogger.logTokenRefresh('Attempting token refresh...');
        AuthTestLogger.logTokenRefreshAttempt('API interceptor');
        const refreshResponse = await AuthService.refreshToken();

        if (refreshResponse.data && !refreshResponse.error) {
          apiLogger.logTokenRefresh(
            'Token refresh successful, retrying original request'
          );
          AuthTestLogger.logTokenRefreshResult(true);

          // Update the authorization header with the new token
          const newToken = getFromLocalStorage('authToken');
          if (newToken) {
            const hdrs = ensureAxiosHeaders(originalRequest.headers);
            hdrs.set('Authorization', `Bearer ${newToken}`);
            originalRequest.headers = hdrs;
          }

          // Process queued requests
          processQueue(null, newToken ?? null);

          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          apiLogger.error('Token refresh failed', refreshResponse.error);
          AuthTestLogger.logTokenRefreshResult(false, refreshResponse.error);
          processQueue(error, null);

          // Signal auth invalid instead of clearing storage
          const authError = new AuthError(
            AUTH_ERROR_CODES.AUTH_INVALID,
            'Token refresh failed',
            refreshResponse.error
          );
          return Promise.reject(authError);
        }
      } catch (refreshError) {
        apiLogger.error('Token refresh error', refreshError);
        AuthTestLogger.logTokenRefreshResult(false, refreshError);
        processQueue(refreshError, null);

        // Check if it's a network error or auth error
        if (
          refreshError instanceof Error &&
          refreshError.message.includes('Network Error')
        ) {
          apiLogger.info(
            '🌐',
            'Network error during token refresh - keeping auth state',
            undefined
          );
          AuthTestLogger.logNetworkErrorScenario(
            refreshError,
            'token refresh'
          );
          // Return original error for network issues
          return Promise.reject(error);
        } else if (refreshError instanceof AuthError) {
          // If refresh returned auth invalid, propagate that
          return Promise.reject(refreshError);
        } else {
          // Other errors during refresh
          const authError = new AuthError(
            AUTH_ERROR_CODES.TOKEN_REFRESH_FAILED,
            'Token refresh failed with unknown error',
            refreshError
          );
          return Promise.reject(authError);
        }
      } finally {
        isRefreshing = false;
      }
    } else {
      // No refresh token available or already retried
      apiLogger.logRefreshSignal(
        'No refresh token available or already retried - redirecting to login'
      );

      // Redirect to login page directly
      if (typeof window !== 'undefined') {
        window.location.href = '/client/login';
      }

      const authError = new AuthError(
        AUTH_ERROR_CODES.AUTH_INVALID,
        'No refresh token available',
        error
      );
      return Promise.reject(authError);
    }
  }

  // For all other errors, return the original error
  return Promise.reject(error);
}
