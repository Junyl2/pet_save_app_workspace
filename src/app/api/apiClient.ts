import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { baseURL } from './config';
import { PAGE_URLS } from '@/app/utils/page_url';

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
 * Clear all storage (localStorage, sessionStorage, and cookies)
 */
const clearAllStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear cookies by setting them to expire in the past
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
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

    // Don't add Authorization header for public endpoints
    const publicEndpoints = [
      '/auth/signup/general',
      '/auth/login',
      '/verification/email/send-verification',
      '/verification/verify-code',
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle responses and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return blob responses directly
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 401/403 authentication errors (but not for signup endpoint)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isSignupEndpoint = error.config?.url?.includes(
        '/auth/signup/general'
      );

      if (!isSignupEndpoint) {
        clearAllStorage();

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = PAGE_URLS.LOGIN;
        }
      }
    }

    // Always reject to propagate errors to callers
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

  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      console.log('API Request:', { url, data });
      const response = await axiosInstance.post<T>(url, data);
      console.log('API Response:', response.data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        console.error('API Error Details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            data: axiosError.config?.data,
            headers: axiosError.config?.headers,
          },
        });

        // Log the actual response data for debugging
        console.error(
          'API Response Data:',
          JSON.stringify(axiosError.response?.data, null, 2)
        );
        console.error(
          'Request Data Sent:',
          JSON.stringify(axiosError.config?.data, null, 2)
        );

        // Try to extract meaningful error message from API response
        const apiErrorMessage =
          axiosError.response?.data?.resultMsg || // Korean error message from API
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.statusText ||
          error.message;

        return { data: null, error: apiErrorMessage };
      }
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put<T>(url, data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.delete<T>(url);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },

  // Raw axios instance for advanced usage
  raw: axiosInstance,
};
