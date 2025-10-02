import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
} from 'axios';
import { baseURL } from './config';
import {
  AUTH_ERROR_CODES,
  AuthError,
  isTokenExpired as safeIsTokenExpired,
} from '@/app/utils/token-utils';
import { AuthTestLogger } from '@/app/utils/auth-test-logger';

// Extend AxiosRequestConfig to include _retry property
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

/**
 * Safe localStorage access for SSR environments
 */
const getFromLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Check if a JWT token is expired (legacy function for backward compatibility)
 * @deprecated Use safeIsTokenExpired from token-utils instead
 */
const isTokenExpired = (token: string): boolean => {
  const result = safeIsTokenExpired(token);
  return result === true; // Return true only if definitely expired
};

/**
 * Make sure headers are an AxiosHeaders instance so we can use set/get/delete safely.
 */
const ensureAxiosHeaders = (
  headers: AxiosRequestConfig['headers']
): AxiosHeaders => {
  if (headers instanceof AxiosHeaders) {
    return headers;
  }
  // Convert to a plain object that AxiosHeaders.from can handle
  const plainHeaders = headers as Record<string, string> | undefined;
  return AxiosHeaders.from(plainHeaders ?? {});
};

/**
 * Get a header in a case-insensitive way (returns undefined if missing)
 */
const getHeader = (headers: AxiosHeaders, key: string): string | undefined => {
  const v = headers.get(key);
  return typeof v === 'string' ? v : undefined;
};

/**
 * Check if an endpoint is public (doesn't require authentication)
 * Uses an allowlist approach - only explicitly listed endpoints are public
 */
const isPublicEndpoint = (
  url: string | undefined,
  method?: string
): boolean => {
  if (!url) return false;

  // Strict allowlist of public endpoints
  const publicEndpoints = [
    '/auth/signup/general',
    '/auth/login',
    '/auth/refresh',
    '/verification/email/send-verification',
    '/verification/phone/send-verification',
    '/verification/verify-code',
    '/auth/recovery/id/email/send-verification',
    '/auth/recovery/id/phone/send-verification',
    '/auth/recovery/id/email',
    '/auth/recovery/id/phone',
    '/auth/recovery/password/email/send-verification',
    '/auth/recovery/password/phone/send-verification',
    '/auth/recovery/password/email',
    '/auth/recovery/password/phone',
    '/auth/recovery/password/reset',
    '/address/search',
    '/address/search/zip-code',
    '/categories',
    '/stores', // Only for browsing, not user-specific operations
  ];

  // Special handling for products endpoints
  // Only GET requests to /products (browsing) are public
  // POST, PUT, DELETE, PATCH requests to /products require authentication
  if (url.startsWith('/products')) {
    const isGetRequest = !method || method.toLowerCase() === 'get';
    const isProductsBrowsing =
      isGetRequest && (url === '/products' || url.startsWith('/products?'));

    console.log('🔍 Products endpoint classification:', {
      url,
      method: method || 'GET',
      isGetRequest,
      isProductsBrowsing,
      isPublic: isProductsBrowsing,
    });

    return isProductsBrowsing;
  }

  // Check if URL starts with any public endpoint
  const isPublic = publicEndpoints.some((endpoint) => url.startsWith(endpoint));

  // Comprehensive logging for debugging
  console.log('🔍 Endpoint classification:', {
    url,
    method: method || 'GET',
    isPublic,
    reason: isPublic ? 'Public endpoint' : 'Protected endpoint (requires auth)',
    withCredentials: !isPublic, // Protected endpoints should use credentials
  });

  return isPublic;
};

/**
 * Production-ready Axios instance with interceptors
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject Authorization header if token exists
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getFromLocalStorage('authToken');
    const refreshToken = getFromLocalStorage('refreshToken');
    const isPublic = isPublicEndpoint(config.url, config.method);

    // Normalize headers to AxiosHeaders for type-safe ops
    const headers = ensureAxiosHeaders(config.headers);

    // Handle Content-Type based on data type
    if (config.data instanceof FormData) {
      // Let browser set proper multipart boundary
      headers.delete('Content-Type');
    } else {
      // JSON only if not FormData AND no explicit content-type already given
      const hasContentType =
        headers.has('Content-Type') || headers.has('content-type');
      if (!hasContentType) {
        headers.set('Content-Type', 'application/json');
      }
    }

    // Debug logging (masked token)
    console.debug('apiClient →', {
      method: config.method,
      url: config.url,
      isFormData: config.data instanceof FormData,
      contentType:
        getHeader(headers, 'Content-Type') ??
        getHeader(headers, 'content-type'),
      withCredentials: config.withCredentials,
      hasAuth: typeof getHeader(headers, 'Authorization') === 'string',
    });

    // Log final request configuration
    const authPreview = getHeader(headers, 'Authorization');
    console.log('🚀 Request interceptor:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      isPublic,
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      tokenExpired: token ? isTokenExpired(token) : 'No token',
      refreshTokenExpired: refreshToken
        ? isTokenExpired(refreshToken)
        : 'No refresh token',
      withCredentials: config.withCredentials,
      authorizationHeader:
        authPreview && typeof authPreview === 'string'
          ? `${authPreview.substring(0, 20)}...`
          : 'None',
    });

    if (isPublic) {
      // For public endpoints, explicitly remove any existing Authorization header
      headers.delete('Authorization');
      config.withCredentials = false;
      console.log(
        '✅ Public endpoint - auth headers removed, withCredentials=false'
      );
    } else {
      // For protected endpoints, ensure credentials are enabled
      config.withCredentials = true;

      if (token) {
        // Check if token is expired and try to refresh proactively (only if online)
        if (
          isTokenExpired(token) &&
          refreshToken &&
          !isTokenExpired(refreshToken) &&
          navigator.onLine
        ) {
          console.log(
            '⚠️ Auth token is expired, attempting proactive refresh...'
          );
          try {
            const { AuthService } = await import(
              './services/client/auth/authService'
            );
            const refreshResponse = await AuthService.refreshToken();
            if (refreshResponse.data && !refreshResponse.error) {
              const newToken = getFromLocalStorage('authToken');
              if (newToken) {
                headers.set('Authorization', `Bearer ${newToken}`);
                console.log('✅ Token refreshed proactively, using new token');
              } else {
                headers.set('Authorization', `Bearer ${token}`);
                console.log(
                  '⚠️ Token refresh succeeded but new token not found, using old token'
                );
              }
            } else {
              headers.set('Authorization', `Bearer ${token}`);
              console.log(
                '⚠️ Proactive refresh failed, using old token (will retry on 401)'
              );
            }
          } catch (err) {
            console.error('Proactive token refresh error:', err);
            headers.set('Authorization', `Bearer ${token}`);
            console.log(
              '⚠️ Proactive refresh error, using old token (will retry on 401)'
            );
          }
        } else if (isTokenExpired(token) && !navigator.onLine) {
          // Use expired token for offline requests
          headers.set('Authorization', `Bearer ${token}`);
          console.log('⚠️ Using expired token for offline request');
        } else {
          headers.set('Authorization', `Bearer ${token}`);
          console.log('✅ Protected endpoint - auth token attached');
        }
      } else {
        console.log('❌ Protected endpoint - no auth token available');
      }
    }

    // write back normalized headers
    config.headers = headers;
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

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

// Response interceptor: Handle responses and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return blob responses directly
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle network errors (no response.status)
    if (!error.response) {
      console.log('🌐 Network error detected (no response):', {
        url: error.config?.url,
        message: error.message,
        code: error.code,
      });

      AuthTestLogger.logNetworkErrorScenario(error, 'API request');

      // For network errors, return the original error without modification
      // AuthProvider will handle offline scenarios
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

      console.log('🔐 Authentication error detected:', {
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
          console.log(
            '🚨 Refresh endpoint returned 401/403 - signaling auth invalid'
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
          console.log('🌐 Public endpoint error - not affecting auth state');
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
            './services/client/auth/authService'
          );

          console.log('🔄 Attempting token refresh...');
          AuthTestLogger.logTokenRefreshAttempt('API interceptor');
          const refreshResponse = await AuthService.refreshToken();

          if (refreshResponse.data && !refreshResponse.error) {
            console.log(
              '✅ Token refresh successful, retrying original request'
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
            console.error('❌ Token refresh failed:', refreshResponse.error);
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
          console.error('❌ Token refresh error:', refreshError);
          AuthTestLogger.logTokenRefreshResult(false, refreshError);
          processQueue(refreshError, null);

          // Check if it's a network error or auth error
          if (
            refreshError instanceof Error &&
            refreshError.message.includes('Network Error')
          ) {
            console.log(
              '🌐 Network error during token refresh - keeping auth state'
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
        console.log(
          '🚨 No refresh token available or already retried - redirecting to login'
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
);

/**
 * Production-ready API client with Axios
 */
export const apiClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get<T>(url);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  // File download with blob response
  getFile: async (
    url: string,
    options?: {
      disposition?: string;
      type?: string;
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<Blob>> => {
    try {
      const response = await axiosInstance.get(url, {
        responseType: 'blob',
        params: {
          disposition: options?.disposition ?? 'inline',
          type: options?.type ?? 'original',
        },
        headers: options?.headers ?? {},
      });
      return { data: response.data as Blob, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File download failed';
      return { data: null, error: message };
    }
  },

  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      console.log('API Request:', { url, data });
      const response = await axiosInstance.post<T>(url, data);
      console.log('API Response:', response.data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError<unknown, unknown>;
        const resp = axiosError.response;

        console.error('API Error Details:', {
          status: resp?.status,
          statusText: resp?.statusText,
          data: resp?.data,
          headers: resp?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            data: axiosError.config?.data,
            headers: axiosError.config?.headers,
          },
        });

        console.error(
          'API Response Data:',
          JSON.stringify(resp?.data, null, 2)
        );
        console.error(
          'Request Data Sent:',
          JSON.stringify(axiosError.config?.data, null, 2)
        );

        let apiErrorMessage: string | undefined;
        const dataObj =
          resp?.data && typeof resp.data === 'object'
            ? (resp.data as {
                resultMsg?: unknown;
                message?: unknown;
                error?: unknown;
              })
            : undefined;

        if (dataObj) {
          apiErrorMessage =
            (typeof dataObj.resultMsg === 'string' && dataObj.resultMsg) ||
            (typeof dataObj.message === 'string' && dataObj.message) ||
            (typeof dataObj.error === 'string' && dataObj.error) ||
            undefined;
        }

        apiErrorMessage = apiErrorMessage || resp?.statusText || error.message;

        const statusCode = resp?.status;
        const finalErrorMessage = statusCode
          ? `${statusCode}: ${apiErrorMessage}`
          : apiErrorMessage;

        return { data: null, error: finalErrorMessage };
      }
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put<T>(url, data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  patch: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.patch<T>(url, data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      console.log('API DELETE Request:', { url });
      const response = await axiosInstance.delete<T>(url);
      console.log('API DELETE Response:', response.data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError<unknown, unknown>;
        const resp = axiosError.response;

        console.error('API DELETE Error Details:', {
          status: resp?.status,
          statusText: resp?.statusText,
          data: resp?.data,
          headers: resp?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            headers: axiosError.config?.headers,
          },
        });

        console.error(
          'API DELETE Response Data:',
          JSON.stringify(resp?.data, null, 2)
        );

        let apiErrorMessage: string | undefined;
        const dataObj =
          resp?.data && typeof resp.data === 'object'
            ? (resp.data as {
                resultMsg?: unknown;
                message?: unknown;
                error?: unknown;
              })
            : undefined;

        if (dataObj) {
          apiErrorMessage =
            (typeof dataObj.resultMsg === 'string' && dataObj.resultMsg) ||
            (typeof dataObj.message === 'string' && dataObj.message) ||
            (typeof dataObj.error === 'string' && dataObj.error) ||
            undefined;
        }

        apiErrorMessage = apiErrorMessage || resp?.statusText || error.message;

        const statusCode = resp?.status;
        const finalErrorMessage = statusCode
          ? `${statusCode}: ${apiErrorMessage}`
          : apiErrorMessage;

        return { data: null, error: finalErrorMessage };
      }
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  // Raw axios instance for advanced usage
  raw: axiosInstance,
};
