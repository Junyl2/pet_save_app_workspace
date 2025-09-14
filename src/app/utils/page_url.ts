export const PAGE_URLS = {
  // Main pages
  HOME: '/client/pages/homepage',
  CONTACT: '/contact-us',
  SHOPS: '/shops',
  MYPAGE: '/client/pages/my-page',

  //auth
  JOIN_MEMBERSHIP: '/client/join-membership',
  RESET_PASSWORD: '/client/reset-password',
  FIND_ID: '/client/find-id',
  LOGIN: '/client/login',

  // Products
  PRODUCTS: '/client/pages/products',
  PRODUCT_DETAIL: (id: number | string) => `/products/${id}`,
  CONTACT_PRODUCT: '/client/pages/products/contact-product',

  // withdrawal
  MYPAGE_WITHDRAWAL: '/client/pages/my-page/withdrawal',

  // Notifications
  NOTIFICATIONS: '/client/pages/notifications',

  // My Page sections
  MEMBER_INFORMATION: '/client/pages/my-page/member-information', // mypage - member information page
  MEMBER_INFO_PASSWORD: '/client/pages/my-page/member-information/password', // mypage - password change page
  MYPAGE_POINTS: '/client/pages/my-page/points', // mypage - points page
  POINTS_HISTORY: '/client/pages/my-page/points/history', // mypage - points history page
  POINTS_GUIDE: '/client/pages/my-page/points/guide', // mypage - points guide page
  ORDER_HISTORY: '/client/pages/my-page/order-history', // mypage - order history page
  TERMS_CONDITIONS: '/client/pages/my-page/terms-and-conditions', // mypage - terms and conditions page

  STEAMED_PRODUCTS: '/client/pages/my-page/steamed-products',
  NOTIFICATION_SETTINGS: '/client/pages/my-page/notification-settings', // mypage - notification settings page
  NOTICE_PAGE: '/client/pages/my-page/notice-list',
  NOTICE_DETAIL: (noticeId: string) =>
    `/client/pages/my-page/notice-list/${noticeId}`,

  // Terms and Conditions
  TERMS_AND_CONDITIONS: '/client/pages/my-page/terms-and-conditions',
  TERMS_SERVICE: '/client/pages/my-page/terms-and-conditions/service-terms',
  TERMS_PRIVACY: '/client/pages/my-page/terms-and-conditions/privacy-policy',
  TERMS_FINANCIAL: '/client/pages/my-page/terms-and-conditions/location-terms',
  TERMS_REFUND: '/client/pages/my-page/terms-and-conditions/marketing-policy',
  TERMS_LOCATION: '/client/pages/my-page/terms-and-conditions/location-service',
  TERMS_MARKETING:
    '/client/pages/my-page/terms-and-conditions/marketing-consent',

  //Order history sub pages
  ORDER_DETAILS: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}`,
  ORDER_CANCEL: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/cancel`,
  ORDER_TRACKING: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/tracking`,

  ORDER_REFUND: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/tracking/refund`,

  ORDER_EXCHANGE: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/tracking/exchange`,

  //delivery paments / shopping cart
  SHOPPING_CART: '/shopping-cart',
  DELIVERY_PAYMENT: '/client/pages/shopping-cart/delivery-payment',
  ORDER_CONFIRMATION:
    '/client/pages/shopping-cart/delivery-payment/order-confirmation',
};
