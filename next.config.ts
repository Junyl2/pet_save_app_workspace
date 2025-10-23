import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '211.107.13.167',
        port: '11309',
        pathname: '/api/pet-save/files/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placedog.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: '/login',
        destination: '/client/login',
      },
      {
        source: '/filter',
        destination: '/client/pages/filter',
      },
      // Product detail
      {
        source: '/products/:id',
        destination: '/client/pages/products/:id',
      },
      //seller
      {
        source: '/seller-details/:id',
        destination: '/client/pages/seller-details/:id',
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
      //shopping cart
      {
        source: '/shopping-cart',
        destination: '/client/pages/shopping-cart',
      },
      {
        source: '/shopping-cart/delivery-payment',
        destination: '/client/pages/shopping-cart/delivery-payment',
      },
      //contact-us
      {
        source: '/contact-us',
        destination: '/client/pages/contact-us',
      },
      {
        source: '/inquiries/waiting-reply/:id',
        destination: '/client/pages/contact-us/waiting-reply/:id',
      },
      // Login
      {
        source: '/login',
        destination: '/client/pages/login',
      },

      // Join Membership
      {
        source: '/join-membership',
        destination: '/client/join-membership',
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
        destination: '/client/pages/my-page',
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
