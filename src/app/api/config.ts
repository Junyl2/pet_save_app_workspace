/**
 * Production-ready baseURL configuration for API client
 * Automatically switches between development and production environments
 */
export const baseURL = (() => {
  // Server-side rendering (Next.js SSR or Node.js)
  if (typeof window === 'undefined') {
    return 'http://211.107.13.167:11309/api/pet-save';
  }

  const { hostname, protocol, host } = window.location;

  // Check if running on localhost or private IP ranges
  const isLocal =
    ['localhost', '127.0.0.1'].includes(hostname) ||
    hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./);

  // Check if hostname is a direct IP address
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

  // Use fixed development server for local/private IP environments
  if (isLocal || isIpAddress) {
    return 'http://211.107.13.167:11309/api/pet-save';
  }

  // Production: use current host with /api/pet-save path
  return `${protocol}//${host}/api/pet-save`;
})();
