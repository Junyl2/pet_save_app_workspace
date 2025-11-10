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
 * Check if a JWT token is expired
 */
const isTokenExpired = (token: string): boolean => {
  const result = safeIsTokenExpired(token);
  return result === true; // Return true only if definitely expired
};

/**
 * Clean up corrupted localStorage data on app start
 * This prevents issues from old/corrupted tokens
 */
const cleanupCorruptedAuthData = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // If we have a refresh token but no auth token, clear everything
    if (refreshToken && !token) {
      console.log(
        '🧹 Cleaning up corrupted auth data: refresh token without auth token'
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
    if (token && safeIsTokenExpired(token) === null) {
      console.log('🧹 Cleaning up corrupted auth data: malformed token');
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
    console.warn('⚠️ Error during auth data cleanup:', error);
  }
};

// Run cleanup on module load
cleanupCorruptedAuthData();

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
  ];

  // Category endpoints:
  // Only the root /categories (list) is public.
  // Anything deeper, like /categories/{id}, requires auth.
  if (url.startsWith('/categories')) {
    const isGetRequest = !method || method.toLowerCase() === 'get';
    const isRootList = url === '/categories' || url.startsWith('/categories?');
    const isDetail = /^\/categories\/[0-9a-fA-F-]+$/.test(url);

    const isPublic = isGetRequest && isRootList;
    console.log('🔍 Category endpoint classification:', {
      url,
      method: method || 'GET',
      isGetRequest,
      isRootList,
      isDetail,
      isPublic,
    });
    return isPublic;
  }

  // Special handling for products endpoints
  // Only GET requests to /products (browsing) are public
  // POST, PUT, DELETE, PATCH requests to /products require authentication
  // Replace your current products block with this:
  if (url.startsWith('/products')) {
    const isGetRequest = !method || method.toLowerCase() === 'get';

    // Option B (tighter): explicitly list public subpaths
    const isProductsBrowsing =
      isGetRequest &&
      (url === '/products' ||
        url.startsWith('/products?') ||
        url.startsWith('/products/search') ||
        /^\/products\/\d+/.test(url)); // numeric id detail

    console.log('🔍 Products endpoint classification:', {
      url,
      method: method || 'GET',
      isGetRequest,
      isProductsBrowsing,
      isPublic: isProductsBrowsing,
    });

    return isProductsBrowsing;
  }

  // Stores endpoints require authentication
  if (url.startsWith('/stores')) {
    console.log('🔍 Stores endpoint classification:', {
      url,
      method: method || 'GET',
      isPublic: false,
      reason: 'Stores endpoints require authentication',
    });
    return false;
  }

  // Address endpoints require authentication
  if (url.startsWith('/address')) {
    console.log('🔍 Address endpoint classification:', {
      url,
      method: method || 'GET',
      isPublic: false,
      reason: 'Address endpoints require authentication',
    });
    return false;
  }

  // Check if URL starts with any public endpoint
  const isPublic = publicEndpoints.some((endpoint) => url.startsWith(endpoint));

  // Comprehensive logging for debugging
  console.log(' Endpoint classification:', {
    url,
    method: method || 'GET',
    isPublic,
    reason: isPublic ? 'Public endpoint' : 'Protected endpoint (requires auth)',
    withCredentials: !isPublic, // Protected endpoints should use credentials
  });

  return isPublic;
};

/**
 * Request deduplication cache
 * Prevents multiple identical requests from being sent simultaneously
 */
interface PendingRequest {
  promise: Promise<AxiosResponse>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_DEDUP_WINDOW = 1000; // 1 second window for deduplication

/**
 * Generate a unique key for request deduplication
 */
const getRequestKey = (method: string, url: string, data?: unknown): string => {
  const methodUpper = method.toUpperCase();
  const dataStr = data ? JSON.stringify(data) : '';
  return `${methodUpper}:${url}:${dataStr}`;
};

/**
 * Clean up stale pending requests
 */
const cleanupStaleRequests = (): void => {
  const now = Date.now();
  for (const [key, request] of pendingRequests.entries()) {
    if (now - request.timestamp > REQUEST_DEDUP_WINDOW * 2) {
      pendingRequests.delete(key);
    }
  }
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
  (config) => {
    const token = getFromLocalStorage('authToken');
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
    console.log(' Request interceptor:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      isPublic,
      hasToken: !!token,
      tokenExpired: token ? isTokenExpired(token) : 'No token',
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
        ' Public endpoint - auth headers removed, withCredentials=false'
      );
    } else {
      // For protected endpoints, ensure credentials are enabled
      config.withCredentials = true;

      if (token) {
        // Always use the current token - backend will provide new tokens in response headers
        headers.set('Authorization', `Bearer ${token}`);
        console.log('Protected endpoint - auth token attached');

        // Log token status for debugging
        const tokenExpired = isTokenExpired(token);
        if (tokenExpired === true) {
          console.log(
            ' Token is expired, but backend will provide new token in response'
          );
        } else if (tokenExpired === null) {
          console.log(
            ' Token format invalid, but backend will provide new token in response'
          );
        } else {
          console.log('Token is valid');
        }
      } else {
        console.log(' Protected endpoint - no auth token available');
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

// Note: Refresh token logic removed - backend provides new tokens in response headers

// Response interceptor: Handle responses and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log all response headers for debugging
    console.groupCollapsed(`📦 [Axios Response] ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.groupEnd();

    // Check if backend sent a new access token in various possible header formats
    const newAccessToken =
      response.headers['new-access-token'] ||
      response.headers['authorization'] ||
      response.headers['x-access-token'] ||
      response.headers['New-Access-Token'] ||
      response.headers['Authorization'] ||
      response.headers['X-Access-Token'];

    if (newAccessToken) {
      // Save the new token to localStorage
      try {
        const oldToken = localStorage.getItem('authToken');
        localStorage.setItem('authToken', newAccessToken);

        // Dispatch a custom event to notify other parts of the app about the token update
        if (typeof window !== 'undefined') {
          const tokenUpdateEvent = new CustomEvent('tokenUpdated', {
            detail: { newToken: newAccessToken, oldToken },
          });
          window.dispatchEvent(tokenUpdateEvent);
        }
      } catch (err) {
        console.warn(' Failed to save new token:', err);
      }
    }

    // Keep original blob handling
    if (response.config.responseType === 'blob') {
      return response;
    }

    return response;
  },

  async (error: AxiosError) => {
    // Handle network errors (no response.status)
    if (!error.response) {
      console.log('Network error detected (no response):', {
        url: error.config?.url,
        message: error.message,
        code: error.code,
      });

      // For network errors, return the original error without modification
      return Promise.reject(error);
    }

    // Handle 401/403 authentication errors
    if (error.response.status === 401 || error.response.status === 403) {
      const isPublic = isPublicEndpoint(
        error.config?.url,
        error.config?.method
      );
      const isLoginEndpoint =
        error.config?.url?.includes('/auth/login') ?? false;

      console.log(' Authentication error detected:', {
        status: error.response.status,
        url: error.config?.url,
        isPublic,
        isLoginEndpoint,
        hasAuthToken: !!getFromLocalStorage('authToken'),
        authTokenExpired: getFromLocalStorage('authToken')
          ? isTokenExpired(getFromLocalStorage('authToken')!)
          : 'No token',
      });

      // For public endpoints and login endpoints, return original error
      if (isPublic || isLoginEndpoint) {
        // For public endpoints, ensure failures don't affect auth state
        if (isPublic) {
          console.log(' Public endpoint error - not affecting auth state');
        }

        return Promise.reject(error);
      }

      // For protected endpoints with 401/403, redirect to login
      // The backend should have provided a new token in response headers
      // If we're still getting 401/403, the session is invalid
      console.log(' Authentication failed - redirecting to login');

      // Redirect to login page directly
      if (typeof window !== 'undefined') {
        window.location.href = '/client/login';
      }

      const authError = new AuthError(
        AUTH_ERROR_CODES.AUTH_INVALID,
        'Authentication failed',
        error
      );
      return Promise.reject(authError);
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
    // Clean up stale requests periodically
    cleanupStaleRequests();

    // Generate request key for deduplication
    const requestKey = getRequestKey('GET', url);

    // Check if there's a pending identical request
    const pendingRequest = pendingRequests.get(requestKey);
    if (pendingRequest) {
      const age = Date.now() - pendingRequest.timestamp;
      if (age < REQUEST_DEDUP_WINDOW) {
        console.log(`🔄 Request deduplicated: GET ${url}`);
        try {
          // Wait for the existing request and return its result
          const response = await pendingRequest.promise;
          return {
            data: response.data as T,
            error: undefined,
          };
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : 'An unknown error occurred';
          return { data: null, error: message };
        }
      } else {
        // Request is stale, remove it
        pendingRequests.delete(requestKey);
      }
    }

    // Create new request
    try {
      const requestPromise = axiosInstance.get<T>(url);
      pendingRequests.set(requestKey, {
        promise: requestPromise as Promise<AxiosResponse>,
        timestamp: Date.now(),
      });

      const response = await requestPromise;

      // Clean up after request completes
      pendingRequests.delete(requestKey);

      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      // Clean up on error
      pendingRequests.delete(requestKey);

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
