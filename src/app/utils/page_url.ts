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

  //delivery paments / shopping cart
  SHOPPING_CART: '/shopping-cart',
  DELIVERY_PAYMENT: '/client/pages/shopping-cart/delivery-payment',
  ORDER_CONFIRMATION:
    '/client/pages/shopping-cart/delivery-payment/order-confirmation',
};
