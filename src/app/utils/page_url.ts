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
  BLOCK_LISTS: '/client/pages/my-page/block-list',
  MEMBER_INFO_PASSWORD: '/client/pages/my-page/member-information/password', // mypage - password change page
  MEMBER_INFO_DELIVERY_ADDRESS:
    '/client/pages/my-page/member-information/delivery-address', // mypage - delivery address page
  MYPAGE_POINTS: '/client/pages/my-page/points', // mypage - points page
  POINTS_HISTORY: '/client/pages/my-page/points/history', // mypage - points history page
  POINTS_GUIDE: '/client/pages/my-page/points/guide', // mypage - points guide page
  ORDER_HISTORY: '/client/pages/my-page/order-history', // mypage - order history page
  TERMS_CONDITIONS: '/client/pages/my-page/terms-and-conditions', // mypage - terms and conditions page
  REVIEWS: '/client/pages/my-page/reviews', // mypage - reviews page
  NOTIFICATION_SETTINGS: '/client/pages/my-page/notification-settings', // mypage - notification settings page
  STORE_INFO: '/client/pages/my-page/store-info', // mypage - store information page
  DELIVERY_ADDRESS_MANAGEMENT:
    '/client/pages/my-page/delivery-address-management',

  STEAMED_PRODUCTS: '/client/pages/my-page/steamed-products',

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
  ORDER_DETAILS: (orderItemId: string) =>
    `/client/pages/my-page/order-history/items/${orderItemId}`,
  ORDER_CANCEL: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/cancel`,
  ORDER_TRACKING: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/tracking`,

  ORDER_RETURN: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/tracking/return`,

  ORDER_EXCHANGE: (orderId: string) =>
    `/client/pages/my-page/order-history/${orderId}/tracking/exchange`,

  //delivery paments / shopping cart
  SHOPPING_CART: '/shopping-cart',
  DELIVERY_PAYMENT: '/client/pages/shopping-cart/delivery-payment',
  ORDER_CONFIRMATION:
    '/client/pages/shopping-cart/delivery-payment/order-confirmation',

  //Seller page
  SELLER_MYPAGE: '/client/seller/pages/my-page',
  SELLER_REGISTRATION: '/client/seller/pages/registration',
  BUSINESS_INFORMATION: '/client/seller/pages/my-page/business-information',
  BUSINESS_OPTIONS: '/client/seller/pages/my-page/business-information/business-options',
  SELLER_STORE_INFO: '/client/seller/pages/change-profile',
  REGISTER_PRODUCT: '/client/seller/pages/register-product',
  MY_REFFERAL_CODE: '/client/pages/my-page/referral-code',
};
