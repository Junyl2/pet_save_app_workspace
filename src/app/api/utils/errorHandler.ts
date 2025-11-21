import { AxiosError } from 'axios';
import { apiLogger } from './logger';

/**
 * Extract error message from API response data
 */
function extractApiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const dataObj = data as {
    resultMsg?: unknown;
    message?: unknown;
    error?: unknown;
  };

  return (
    (typeof dataObj.resultMsg === 'string' && dataObj.resultMsg) ||
    (typeof dataObj.message === 'string' && dataObj.message) ||
    (typeof dataObj.error === 'string' && dataObj.error) ||
    undefined
  );
}

/**
 * Handle API errors and return a formatted error message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<unknown, unknown>;
    const resp = axiosError.response;

    // Log error details in development
    apiLogger.error('API Error Details', {
      status: resp?.status,
      statusText: resp?.statusText,
      data: resp?.data,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        data: axiosError.config?.data,
      },
    });

    // Extract error message
    const apiErrorMessage =
      extractApiErrorMessage(resp?.data) || resp?.statusText || error.message;

    // Format with status code if available
    const statusCode = resp?.status;
    return statusCode ? `${statusCode}: ${apiErrorMessage}` : apiErrorMessage;
  }

  // Handle non-Axios errors
  return error instanceof Error ? error.message : 'An unknown error occurred';
}

/**
 * Log detailed error information for debugging
 */
export function logDetailedError(
  method: string,
  error: unknown,
  axiosError?: AxiosError<unknown, unknown>
): void {
  if (!axiosError) return;

  const resp = axiosError.response;

  apiLogger.error(`API ${method} Error Details`, {
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

  if (resp?.data) {
    apiLogger.error(
      `API ${method} Response Data`,
      JSON.stringify(resp.data, null, 2)
    );
  }

  if (axiosError.config?.data) {
    apiLogger.error(
      `Request Data Sent`,
      JSON.stringify(axiosError.config.data, null, 2)
    );
  }
}
