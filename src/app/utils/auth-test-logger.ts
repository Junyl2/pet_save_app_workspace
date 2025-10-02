/**
 * Comprehensive logging utility for testing offline-tolerant authentication scenarios
 */

export const AuthTestLogger = {
  /**
   * Log test scenario: Turn off Wi-Fi for 10+ minutes with expired access token but valid refresh token
   */
  logOfflineExpiredTokenScenario: () => {
    console.log('🧪 TEST SCENARIO: Offline with expired token');
    console.log('📋 Expected behavior:');
    console.log('  - App keeps isLoggedIn(true)');
    console.log('  - Tokens remain intact in localStorage');
    console.log('  - No logout occurs');
    console.log('  - User can continue using app offline');

    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('📊 Current state:', {
      hasAuthToken: !!token,
      hasRefreshToken: !!refreshToken,
      isOnline: navigator.onLine,
      tokenExpired: token
        ? (() => {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              return payload.exp < Date.now() / 1000;
            } catch {
              return 'invalid';
            }
          })()
        : 'none',
    });
  },

  /**
   * Log test scenario: Come back online after offline period
   */
  logOnlineAfterOfflineScenario: () => {
    console.log('🧪 TEST SCENARIO: Coming back online after offline period');
    console.log('📋 Expected behavior:');
    console.log('  - Single refresh attempt succeeds');
    console.log('  - No storage cleared');
    console.log('  - User remains logged in');
    console.log('  - New tokens are stored');

    console.log('📊 Network state changed:', {
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log test scenario: Refresh returns 401/403
   */
  logRefreshInvalidScenario: (error: unknown) => {
    console.log('🧪 TEST SCENARIO: Refresh token returns 401/403');
    console.log('📋 Expected behavior:');
    console.log('  - AuthProvider clears tokens');
    console.log('  - User is logged out');
    console.log('  - Redirect to login page');

    console.log('📊 Error details:', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log test scenario: Network error anywhere
   */
  logNetworkErrorScenario: (error: unknown, context: string) => {
    console.log(`🧪 TEST SCENARIO: Network error in ${context}`);
    console.log('📋 Expected behavior:');
    console.log('  - No logout occurs');
    console.log('  - No storage cleared');
    console.log('  - User remains logged in');
    console.log('  - Error is handled gracefully');

    console.log('📊 Network error details:', {
      context,
      error: error instanceof Error ? error.message : String(error),
      isOnline: navigator.onLine,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log current auth state for debugging
   */
  logCurrentAuthState: () => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    console.log('📊 Current Auth State:', {
      isOnline: navigator.onLine,
      hasAuthToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      tokenExpiry: token
        ? (() => {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const expiry = new Date(payload.exp * 1000);
              const now = new Date();
              return {
                expiresAt: expiry.toISOString(),
                isExpired: payload.exp < now.getTime() / 1000,
                timeUntilExpiry: expiry.getTime() - now.getTime(),
              };
            } catch {
              return 'invalid';
            }
          })()
        : 'none',
      refreshTokenExpiry: refreshToken
        ? (() => {
            try {
              const payload = JSON.parse(atob(refreshToken.split('.')[1]));
              const expiry = new Date(payload.exp * 1000);
              const now = new Date();
              return {
                expiresAt: expiry.toISOString(),
                isExpired: payload.exp < now.getTime() / 1000,
                timeUntilExpiry: expiry.getTime() - now.getTime(),
              };
            } catch {
              return 'invalid';
            }
          })()
        : 'none',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log token refresh attempt
   */
  logTokenRefreshAttempt: (context: string) => {
    console.log(`🔄 Token refresh attempt from: ${context}`);
    console.log('📊 Pre-refresh state:', {
      isOnline: navigator.onLine,
      hasRefreshToken: !!localStorage.getItem('refreshToken'),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log token refresh result
   */
  logTokenRefreshResult: (success: boolean, error?: unknown) => {
    console.log(`🔄 Token refresh result: ${success ? 'SUCCESS' : 'FAILED'}`);
    if (!success && error) {
      console.log('📊 Refresh error:', {
        error: error instanceof Error ? error.message : String(error),
        isNetworkError:
          error instanceof Error && error.message.includes('Network Error'),
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Global function for easy access in console
if (typeof window !== 'undefined') {
  (window as { authTestLogger?: typeof AuthTestLogger }).authTestLogger =
    AuthTestLogger;
  console.log('🧪 Auth test logger available as window.authTestLogger');
}
