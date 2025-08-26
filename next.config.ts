import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Product detail
      {
        source: '/products/:id',
        destination: '/client/pages/products/:id',
      },
      // Products listing
      {
        source: '/products',
        destination: '/client/pages/products',
      },
      // Homepage
      {
        source: '/',
        destination: '/client/pages/homepage',
      },
      // Login
      {
        source: '/login',
        destination: '/client/pages/login',
      },
      // Join Membership
      {
        source: '/join-membership',
        destination: '/client/pages/join-membership',
      },
      // Reset Password
      {
        source: '/reset-password',
        destination: '/client/pages/reset-password',
      },
      // Find ID
      {
        source: '/find-id',
        destination: '/client/pages/find-id',
      },
      // MyPage
      {
        source: '/mypage',
        destination: '/client/pages/mypage',
      },
      // Contact
      {
        source: '/contact',
        destination: '/client/pages/contact',
      },
      // Shops
      {
        source: '/shops',
        destination: '/client/pages/shops',
      },
    ];
  },
};

export default nextConfig;
