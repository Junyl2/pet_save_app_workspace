import { PUBLIC_ENDPOINTS } from '../config/publicEndpoints';
import { apiLogger } from './logger';

/**
 * Check if an endpoint is public (doesn't require authentication)
 * Uses an allowlist approach - only explicitly listed endpoints are public
 */
export function isPublicEndpoint(
  url: string | undefined,
  method?: string
): boolean {
  if (!url) return false;

  const normalizedMethod = (method || 'GET').toLowerCase();

  // Special handling for products endpoints
  // Only GET requests to /products (browsing) are public
  if (url.startsWith('/products')) {
    const isGetRequest = normalizedMethod === 'get';
    const isProductsBrowsing =
      isGetRequest && (url === '/products' || url.startsWith('/products?'));

    apiLogger.logEndpointClassification({
      url,
      method: method || 'GET',
      isPublic: isProductsBrowsing,
      reason: isProductsBrowsing
        ? 'Public product browsing'
        : 'Protected product endpoint',
    });

    return isProductsBrowsing;
  }

  // Stores endpoints require authentication
  if (url.startsWith('/stores')) {
    apiLogger.logEndpointClassification({
      url,
      method: method || 'GET',
      isPublic: false,
      reason: 'Stores endpoints require authentication',
    });
    return false;
  }

  // Address endpoints require authentication
  if (url.startsWith('/address')) {
    apiLogger.logEndpointClassification({
      url,
      method: method || 'GET',
      isPublic: false,
      reason: 'Address endpoints require authentication',
    });
    return false;
  }

  // Check if URL starts with any public endpoint
  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => url.startsWith(endpoint));

  apiLogger.logEndpointClassification({
    url,
    method: method || 'GET',
    isPublic,
    reason: isPublic ? 'Public endpoint' : 'Protected endpoint (requires auth)',
    withCredentials: !isPublic,
  });

  return isPublic;
}
