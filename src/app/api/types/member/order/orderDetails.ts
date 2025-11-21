// app/api/types/member/order/orderDetails.ts

/**
 * Order status enum based on API specification
 */
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_STARTED'
  | 'DELIVERED'
  | 'PICKUP_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

/**
 * Sort field options for order history
 */
export type OrderSortBy = 'createdAt' | 'totalAmount' | 'status' | 'usedPoints';

/**
 * Sort direction options
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Query parameters for getting order history
 */
export interface OrderHistoryQueryParams {
  keyword?: string;
  status?: OrderStatus;
  shippingOption?: 'DELIVERY' | 'PICKUP';
  dateStart?: string; // YYYY-MM-DD format
  dateEnd?: string; // YYYY-MM-DD format
  page?: number;
  size?: number;
  sortBy?: OrderSortBy;
  direction?: SortDirection;
  onlyReviewable?: boolean;
}

/**
 * Customer information
 */
export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * Delivery information
 */
export interface Delivery {
  deliveryId: string;
  courierName: string;
  trackingNumber: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryNotes: string | null;
  currentStatus: string;
  message: string;
  lastUpdated: string;
}

/**
 * Order item from API
 */
export interface OrderItemResponse {
  orderItemId: string;
  orderStoreId: string;
  orderId: string;
  orderNumber: string;
  orderTotalAmount: number;
  shippingOption: 'DELIVERY' | 'PICKUP';
  paymentMethod: string;
  status: OrderStatus;
  storeId: string;
  storeName: string;
  customer: Customer;
  productId: string;
  productName: string;
  productImageUrl: string;
  productCategory: string[];
  productExpiryDate: string;
  quantity: number;
  price: number;
  subtotal: number;
  appliedDiscountAmount: number;
  totalAmount: number;
  delivery: Delivery;
  deliveryFee: number;
  storeAddress: string;
  storePhoneNumber: string;
  createdAt: string;
  returnStatus?: string;
}

/**
 * Pagination info
 */
export interface PageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Order history response data
 */
export interface OrderHistoryResponse {
  content: OrderItemResponse[];
  pageInfo: PageInfo;
}

/**
 * API response wrapper
 */
export interface OrderHistoryApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: OrderHistoryResponse;
  errorId?: string;
}

/**
 * Single order item response (GET /orders/items/{orderItemId})
 */
export interface SingleOrderItemApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: OrderItemResponse;
  errorId?: string;
}

/**
 * Delete order history response
 * DELETE /api/pet-save/order-histories/orders/{orderId}
 */
export interface DeleteOrderHistoryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown>;
  errorId?: string;
}
