import axios, { AxiosInstance, AxiosError } from 'axios';
import { baseURL } from './config';
import {
  authRequestInterceptor,
  authRequestErrorHandler,
} from './interceptors/authInterceptor';
import {
  responseSuccessHandler,
  responseErrorHandler,
} from './interceptors/errorInterceptor';
import { handleApiError, logDetailedError } from './utils/errorHandler';
import { apiLogger } from './utils/logger';

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
  authRequestInterceptor,
  authRequestErrorHandler
);

// Response interceptor: Handle responses and errors
axiosInstance.interceptors.response.use(
  responseSuccessHandler,
  (error) => responseErrorHandler(error, axiosInstance)
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
      const message = handleApiError(error);
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
      apiLogger.info('📤', 'API Request', { url, data });
      const response = await axiosInstance.post<T>(url, data);
      apiLogger.info('📥', 'API Response', response.data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError<unknown, unknown>;
        logDetailedError('POST', error, axiosError);
      }
      const message = handleApiError(error);
      return { data: null, error: message };
    }
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put<T>(url, data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message = handleApiError(error);
      return { data: null, error: message };
    }
  },

  patch: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.patch<T>(url, data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message = handleApiError(error);
      return { data: null, error: message };
    }
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      apiLogger.info('🗑️', 'API DELETE Request', { url });
      const response = await axiosInstance.delete<T>(url);
      apiLogger.info('📥', 'API DELETE Response', response.data);
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError<unknown, unknown>;
        logDetailedError('DELETE', error, axiosError);
      }
      const message = handleApiError(error);
      return { data: null, error: message };
    }
  },

  // Raw axios instance for advanced usage
  raw: axiosInstance,
};
