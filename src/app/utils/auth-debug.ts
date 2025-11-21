/**
 * Authentication debugging utility
 * Use this in browser console to check auth state
 */

type JwtPayload = {
  exp: number;
  [key: string]: unknown;
};

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
};

export const debugAuthState = (): void => {
  if (typeof window === 'undefined') {
    console.log('This function can only be used in the browser');
    return;
  }

  const authToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userInfo = localStorage.getItem('userInfo');
  const user = localStorage.getItem('user');

  console.log('🔍 Authentication State Debug:');
  console.log('================================');

  // Check tokens
  console.log('📋 Tokens:');
  console.log('  - Auth Token:', authToken ? 'Present' : 'Missing');
  console.log('  - Refresh Token:', refreshToken ? 'Present' : 'Missing');

  if (authToken) {
    const payload = parseJwt(authToken);
    if (payload && typeof payload.exp === 'number') {
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      const timeUntilExpiry = payload.exp - currentTime;

      console.log('  - Auth Token Expired:', isExpired);
      console.log(
        '  - Time until expiry:',
        Math.round(timeUntilExpiry),
        'seconds'
      );
      console.log(
        '  - Expires at:',
        new Date(payload.exp * 1000).toLocaleString()
      );
    } else {
      console.log('  - Auth Token: Invalid format');
    }
  }

  if (refreshToken) {
    const payload = parseJwt(refreshToken);
    if (payload && typeof payload.exp === 'number') {
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      const timeUntilExpiry = payload.exp - currentTime;

      console.log('  - Refresh Token Expired:', isExpired);
      console.log(
        '  - Time until expiry:',
        Math.round(timeUntilExpiry),
        'seconds'
      );
      console.log(
        '  - Expires at:',
        new Date(payload.exp * 1000).toLocaleString()
      );
    } else {
      console.log('  - Refresh Token: Invalid format');
    }
  }

  // Check user data
  console.log('👤 User Data:');
  console.log('  - User Info:', userInfo ? 'Present' : 'Missing');
  console.log('  - User Context:', user ? 'Present' : 'Missing');

  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      console.log('  - User Info Data:', parsed);
    } catch {
      console.log('  - User Info: Invalid JSON');
    }
  }

  if (user) {
    try {
      const parsed = JSON.parse(user);
      console.log('  - User Context Data:', parsed);
    } catch {
      console.log('  - User Context: Invalid JSON');
    }
  }

  console.log('================================');
};

// Make it available globally for easy access
declare global {
  interface Window {
    debugAuthState: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.debugAuthState = debugAuthState;
}
