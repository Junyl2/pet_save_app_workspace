// Payment API Types

export type PaymentMethod = 'BANK' | 'CARD' | 'EASY_PAY';
export type ReceiptType = 'TAX_INVOICE' | 'CASH_RECEIPT';
export type IssuanceType = 'TAX_INVOICE_ISSUANCE' | 'CASH_RECEIPT_ISSUANCE';

/** ────────────────  ADD PAYMENT TO ORDER ──────────────── **/
export interface AddPaymentRequest {
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

export interface AddPaymentResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  PREPARE PAYMENT (SET AMOUNT) ──────────────── **/
export interface PreparePaymentResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  PROCESS PAYMENT ──────────────── **/
export interface ProcessPaymentResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  CONFIRM PAYMENT ──────────────── **/
export interface ConfirmPaymentResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}
/** ────────────────  HANDLE PAYMENT SUCCESS ──────────────── **/
export interface PaymentSuccessResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}

/** ────────────────  HANDLE PAYMENT FAIL ──────────────── **/
export interface PaymentFailResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string;
  data: object;
  errorId?: string;
}
