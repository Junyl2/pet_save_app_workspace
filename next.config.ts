import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'i.pravatar.cc',
      'placekitten.com',
      'placedog.net',
      'cdn.pixabay.com',
      'images.pexels.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/client/login',
      },
      // Product detail
      {
        source: '/products/:id',
        destination: '/client/pages/products/:id',
      },
      //contact product
      {
        source: '/contact-product',
        destination: '/client/pages/products/contact-product',
      },
      //customer reviews
      {
        source: '/customer-reviews',
        destination: '/client/pages/customer-reviews',
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
