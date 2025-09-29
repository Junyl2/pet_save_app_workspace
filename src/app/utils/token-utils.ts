/**
 * Safe base64url decode helper for JWT tokens
 * Returns null if decode fails, never throws
 */
export function safeBase64UrlDecode(str: string): string | null {
  try {
    // Add padding if needed
    const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
    // Replace URL-safe characters
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  } catch {
    return null;
  }
}

/**
 * Safely parse JWT payload without throwing
 * Returns null if token is invalid or expired
 */
export function safeParseJwtPayload(
  token: string
): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadStr = safeBase64UrlDecode(parts[1]);
    if (!payloadStr) return null;

    return JSON.parse(payloadStr);
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 * Returns true if expired, false if valid, null if invalid format
 */
export function isTokenExpired(token: string): boolean | null {
  const payload = safeParseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;

  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
}

/**
 * Custom error codes for authentication
 */
export const AUTH_ERROR_CODES = {
  AUTH_INVALID: 'AUTH_INVALID',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
