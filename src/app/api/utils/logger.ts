/**
 * API Logger utility with environment-based logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

class ApiLogger {
  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;
    // Only log debug/info/warn in development
    return isDevelopment;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(`[API Debug] ${message}`, data);
    }
  }

  info(emoji: string, message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      console.log(`${emoji} ${message}`, data);
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, data);
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, error);
    }
  }

  // Specialized logging methods
  logRequest(config: {
    method?: string;
    url?: string;
    isFormData: boolean;
    contentType?: string;
    withCredentials?: boolean;
    hasAuth: boolean;
  }): void {
    this.debug('API Request', config);
  }

  logRequestInterceptor(data: {
    url?: string;
    method?: string;
    isPublic: boolean;
    hasToken: boolean;
    hasRefreshToken: boolean;
    tokenExpired: boolean | string;
    refreshTokenExpired: boolean | string;
    withCredentials?: boolean;
    authorizationHeader: string;
  }): void {
    this.info('🚀', 'Request interceptor', data);
  }

  logEndpointClassification(data: {
    url: string;
    method: string;
    isPublic: boolean;
    reason: string;
    withCredentials?: boolean;
  }): void {
    this.info('🔍', 'Endpoint classification', data);
  }

  logAuthError(data: {
    status: number;
    url?: string;
    isPublic: boolean;
    isRefreshEndpoint: boolean;
    isLoginEndpoint: boolean;
    hasAuthToken: boolean;
    hasRefreshToken: boolean;
    authTokenExpired: boolean | string;
    refreshTokenExpired: boolean | string;
  }): void {
    this.info('🔐', 'Authentication error detected', data);
  }

  logNetworkError(data: { url?: string; message: string; code?: string }): void {
    this.info('🌐', 'Network error detected (no response)', data);
  }

  logTokenRefresh(message: string): void {
    this.info('🔄', message, undefined);
  }

  logPublicEndpointSuccess(message: string): void {
    this.info('✅', message, undefined);
  }

  logProtectedEndpointSuccess(message: string): void {
    this.info('✅', message, undefined);
  }

  logAuthFailure(message: string): void {
    this.info('❌', message, undefined);
  }

  logRefreshSignal(message: string): void {
    this.info('🚨', message, undefined);
  }
}

export const apiLogger = new ApiLogger();
