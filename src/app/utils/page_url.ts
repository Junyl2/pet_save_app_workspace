// utils/page_url.ts
export const PAGE_URLS = {
  // Client pages
  HOME: '/client/pages/homepage',
  JOIN_MEMBERSHIP: '/client/join-membership',
  RESET_PASSWORD: '/client/reset-password',
  FIND_ID: '/client/find-id',
  LOGIN: '/client/login',

  // Products
  PRODUCTS: '/client/pages/products',
  PRODUCT_DETAIL: (id: number | string) => `/products/${id}`,

  //page to be added
  MYPAGE: '/client/mypage',
  CONTACT: '/client/contact',
  SHOPS: '/client/shops',
};
