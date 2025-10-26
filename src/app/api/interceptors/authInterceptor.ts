import { InternalAxiosRequestConfig } from 'axios';
import { isTokenExpired as safeIsTokenExpired } from '@/app/utils/token-utils';
import { isPublicEndpoint } from '../utils/endpointClassifier';
import { getFromLocalStorage } from '../utils/storageUtils';
import { ensureAxiosHeaders, getHeader } from '../utils/headerUtils';
import { apiLogger } from '../utils/logger';

/**
 * Check if a JWT token is expired (legacy function for backward compatibility)
 * @deprecated Use safeIsTokenExpired from token-utils instead
 */
const isTokenExpired = (token: string): boolean => {
  const result = safeIsTokenExpired(token);
  return result === true; // Return true only if definitely expired
};

/**
 * Request interceptor: Inject Authorization header if token exists
 */
export async function authRequestInterceptor(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
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

  // Debug logging
  apiLogger.logRequest({
    method: config.method,
    url: config.url,
    isFormData: config.data instanceof FormData,
    contentType:
      getHeader(headers, 'Content-Type') ?? getHeader(headers, 'content-type'),
    withCredentials: config.withCredentials,
    hasAuth: typeof getHeader(headers, 'Authorization') === 'string',
  });

  // Log final request configuration
  const authPreview = getHeader(headers, 'Authorization');
  apiLogger.logRequestInterceptor({
    url: config.url,
    method: config.method?.toUpperCase() || 'GET',
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
    apiLogger.logPublicEndpointSuccess(
      'Public endpoint - auth headers removed, withCredentials=false'
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
        apiLogger.warn(
          'Auth token is expired, attempting proactive refresh...'
        );
        try {
          const { AuthService } = await import(
            '../services/client/auth/authService'
          );
          const refreshResponse = await AuthService.refreshToken();
          if (refreshResponse.data && !refreshResponse.error) {
            const newToken = getFromLocalStorage('authToken');
            if (newToken) {
              headers.set('Authorization', `Bearer ${newToken}`);
              apiLogger.logTokenRefresh(
                'Token refreshed proactively, using new token'
              );
            } else {
              headers.set('Authorization', `Bearer ${token}`);
              apiLogger.warn(
                'Token refresh succeeded but new token not found, using old token'
              );
            }
          } else {
            headers.set('Authorization', `Bearer ${token}`);
            apiLogger.warn('Proactive refresh failed, using old token (will retry on 401)');
          }
        } catch (err) {
          apiLogger.error('Proactive token refresh error', err);
          headers.set('Authorization', `Bearer ${token}`);
          apiLogger.warn('Proactive refresh error, using old token (will retry on 401)');
        }
      } else if (isTokenExpired(token) && !navigator.onLine) {
        // Use expired token for offline requests
        headers.set('Authorization', `Bearer ${token}`);
        apiLogger.warn('Using expired token for offline request');
      } else {
        headers.set('Authorization', `Bearer ${token}`);
        apiLogger.logProtectedEndpointSuccess('Protected endpoint - auth token attached');
      }
    } else {
      apiLogger.logAuthFailure('Protected endpoint - no auth token available');
    }
  }

  // write back normalized headers
  config.headers = headers;
  return config;
}

/**
 * Request error handler
 */
export function authRequestErrorHandler(error: unknown): Promise<never> {
  apiLogger.error('Request interceptor error', error);
  return Promise.reject(error);
}
