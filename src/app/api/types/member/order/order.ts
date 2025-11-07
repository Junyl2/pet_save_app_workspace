export type ShippingOption = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'BANK' | 'CARD' | 'EASY_PAY';
export type ReceiptType = 'TAX_INVOICE' | 'CASH_RECEIPT';
export type IssuanceType = 'TAX_INVOICE_ISSUANCE' | 'CASH_RECEIPT_ISSUANCE';

export interface PaymentDetails {
  method: PaymentMethod;
  bankName?: string;
  depositorName?: string;
  receiptType?: ReceiptType;
  issuanceType?: IssuanceType;
  issueNumber?: string;
  businessNumber?: string;
  businessName?: string;
  representativeName?: string;
  businessAddress?: string;
  businessType?: string;
  businessCategory?: string;
  businessEmail?: string;
}

export interface DirectOrderRequest {
  productId: string;
  quantity: number;
  shippingOption: ShippingOption;
  deliveryAddress?: string;
  usePointsAmount?: number;
  paymentDetails: PaymentDetails;
}

export interface DirectOrderResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId?: string;
}

export interface CheckoutRequest {
  cartItemIds: string[];
  shippingOption: ShippingOption;
  deliveryAddress?: string;
  usePointsAmount?: number;
  paymentDetails: PaymentDetails;
}

export interface CheckoutResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId?: string;
}

/** ────────────────  NEW TYPES FOR ADMIN ORDER SEARCH ──────────────── **/

export type OrderGeneralStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_STARTED'
  | 'DELIVERED'
  | 'PICKUP_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface SearchOrdersParams {
  orderId?: string;
  orderNumber?: string;
  keyword?: string;
  generalStatus?: OrderGeneralStatus;
  dateStart?: string;
  dateEnd?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'status' | 'usedPoints';
  direction?: 'asc' | 'desc';
}

/** ────────────────  FIXED STORE + ITEM STRUCTURE ──────────────── **/

export interface OrderItem {
  orderItemId: string;
  deliveryId: string | null;
  productId: string;
  productName: string;
  productImageUrl?: string;
  productCategory?: string[];
  productExpiryDate?: string;
  status: string;
  quantity: number;
  price: number;
  subtotal: number;
  appliedDiscountAmount: number;
  totalAmount: number;
}

export interface StoreOrder {
  orderStoreId: string;
  storeId: string;
  storeName: string;
  shippingOption: string;
  subtotal: number;
  deliveryFee: number;
  status: string;
  items?: OrderItem[];
}

export interface SearchOrdersData {
  content: {
    orderId: string;
    orderNumber: string;
    generalStatus: string;
    paymentMethod: string;
    totalAmount: number;
    usedPoints: number;
    createdAt: string;
    customerName: string;
    customerContact: string;
    storeOrders?: StoreOrder[];
  }[];
  pageInfo?: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SearchOrdersResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: SearchOrdersData;
  errorId?: string;
}

/** ────────────────  NEW ADMIN CANCEL ORDER ITEMS TYPES ──────────────── **/

export interface AdminCancelOrderItemsRequest {
  /** IDs of order items to cancel */
  orderItemIds: string[];
  /** Reason for cancellation */
  cancelReason: string;
}

export interface AdminCancelOrderItemsResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: object;
  errorId?: string;
}
/** ──────────────── NEW V2 ADMIN ORDER SEARCH ──────────────── **/

export type OrderStatusV2 =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_STARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'EXCHANGED';

export interface AdminSearchOrdersParams {
  orderNumber?: string;
  keyword?: string;
  status?: OrderStatusV2[]; // Multiple statuses allowed
  shippingOption?: 'DELIVERY' | 'PICKUP';
  dateStart?: string; // YYYY-MM-DD
  dateEnd?: string; // YYYY-MM-DD
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'totalAmount';
  direction?: 'asc' | 'desc';
}

/** ──────────────── Nested Objects from Response ──────────────── **/

export interface AdminOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface AdminOrderDelivery {
  deliveryId: string;
  courierName: string;
  trackingNumber: string | null;
  receiverName: string;
  orderId: string;
  orderNumber: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryNotes: string | null;
  currentStatus: string;
}

/** ──────────────── Main Order Item ──────────────── **/

export interface AdminSearchOrdersData {
  orderItemId: string;
  orderStoreId: string;
  orderId: string;
  orderNumber: string;
  orderTotalAmount: number;
  shippingOption: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'BANK' | 'CARD' | 'EASY_PAY';
  status: OrderStatusV2;
  storeId: string;
  storeName: string;
  storePhoneNumber: string | null;
  storeAddress: string;
  customer: AdminOrderCustomer;
  productId: string;
  productName: string;
  productImageUrl: string;
  productCategory: string[];
  productExpiryDate: string;
  quantity: number;
  price: number;
  subtotal: number;
  appliedDiscountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  delivery: AdminOrderDelivery | null;
  createdAt: string;
}

/** ──────────────── Pagination Structure ──────────────── **/

export interface AdminSearchOrdersPage {
  content: AdminSearchOrdersData[];
  pageInfo: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/** ──────────────── API Response ──────────────── **/

export interface AdminSearchOrdersResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: AdminSearchOrdersPage;
  errorId?: string;
}
