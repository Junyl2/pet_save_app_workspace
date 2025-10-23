// Order API Types

export type ShippingOption = 'DELIVERY' | 'PICKUP';

export type PaymentMethod = 'BANK' | 'CARD' | 'EASY_PAYMENT';

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
