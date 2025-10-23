/**
 * Configuration for public endpoints that don't require authentication
 */
export const PUBLIC_ENDPOINTS = [
  '/auth/signup/general',
  '/auth/login',
  '/auth/refresh',
  '/verification/email/send-verification',
  '/verification/phone/send-verification',
  '/verification/verify-code',
  '/auth/recovery/id/email/send-verification',
  '/auth/recovery/id/phone/send-verification',
  '/auth/recovery/id/email',
  '/auth/recovery/id/phone',
  '/auth/recovery/password/email/send-verification',
  '/auth/recovery/password/phone/send-verification',
  '/auth/recovery/password/email',
  '/auth/recovery/password/phone',
  '/auth/recovery/password/reset',
  '/categories',
] as const;

/**
 * Special endpoint rules
 */
export const ENDPOINT_RULES = {
  // Only GET requests to /products (browsing) are public
  products: {
    publicMethods: ['get'],
    requiresAuth: ['post', 'put', 'delete', 'patch'],
  },
  // All stores endpoints require authentication
  stores: {
    requiresAuth: true,
  },
  // All address endpoints require authentication
  address: {
    requiresAuth: true,
  },
} as const;
