/**
 * Authentication debugging utility
 * Use this in browser console to check auth state
 */

export const debugAuthState = () => {
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
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
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
    } catch (error) {
      console.log('  - Auth Token: Invalid format');
    }
  }

  if (refreshToken) {
    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
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
    } catch (error) {
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
    } catch (error) {
      console.log('  - User Info: Invalid JSON');
    }
  }

  if (user) {
    try {
      const parsed = JSON.parse(user);
      console.log('  - User Context Data:', parsed);
    } catch (error) {
      console.log('  - User Context: Invalid JSON');
    }
  }

  console.log('================================');
};

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
}
