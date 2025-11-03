// Order API Types

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

    storeOrders?: {
      orderStoreId: string;
      storeId: string;
      storeName: string;
      shippingOption: string;
      subtotal: number;
      deliveryFee: number;
      status: string;
    }[];
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
