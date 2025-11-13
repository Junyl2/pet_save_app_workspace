export type InvoiceStatus = 'PENDING' | 'ISSUED' | 'CANCELLED';

export type InvoiceType = 'GENERAL_INVOICE' | 'TAX_INVOICE' | 'CASH_RECEIPT';

export type InvoiceNature = 'FULL' | 'PARTIAL' | 'SUPPLEMENTARY' | 'ADJUSTMENT';

export type IssuanceType =
  | 'PERSONAL_DEDUCTION'
  | 'BUSINESS_EXPENSE'
  | 'TAX_INVOICE_ISSUANCE';

export interface InvoiceSearchParams {
  keyword?: string;
  createdStart?: string;
  createdEnd?: string;
  status?: InvoiceStatus;
  invoiceType?: InvoiceType;
  invoiceNature?: InvoiceNature;
  issuanceType?: IssuanceType;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'issueDate' | 'totalAmount' | 'invoiceNumber';
  direction?: 'asc' | 'desc';
}

export interface InvoiceItem {
  invoiceId: string;
  invoiceNumber: string;
  invoiceSequence: number;
  status: InvoiceStatus;
  invoiceType: InvoiceType;
  invoiceNature: InvoiceNature;
  issuanceType?: IssuanceType | null;
  totalAmount: number;
  issueDate?: string | null;
  createdAt: string;
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalQuantity: number;
  itemCount: number;
  hasPartialLineItems: boolean;
}

export interface InvoicePageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface InvoiceSearchResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string | null;
  data: {
    content: InvoiceItem[];
    pageInfo: InvoicePageInfo;
  };
}

export interface CompanyInfo {
  businessNumber: string | null;
  businessName: string | null;
  representativeName: string | null;
  businessAddress: string | null;
  businessType: string | null;
  businessCategory: string | null;
  businessEmail: string | null;
}

export interface InvoiceLineItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productDescription: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  appliedDiscount: number;
  totalAmount: number;
  invoicedQuantity: number;
  invoicedAmount: number;
  isPartialInvoice: boolean;
  effectiveUnitPrice: number;
  notes: string | null;
}

export interface Payment {
  paymentId: string;
  paymentMethod: string;
  amount: number;
  transactionIds: string[];
  status: string;
  paidAt: string;
}

export interface Refund {
  refundId?: string;
  amount?: number;
  refundedAt?: string;
  [key: string]: unknown;
}

export interface InvoiceDetail {
  invoiceId: string;
  invoiceNumber: string;
  invoiceSequence: number;
  status: InvoiceStatus;
  invoiceType: InvoiceType;
  invoiceNature: InvoiceNature;
  totalAmount: number;
  taxAmount: number | null;
  totalRefundedAmount: number;
  netAmount: number;
  issueDate: string | null;
  dueDate: string | null;
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  companyInfo: CompanyInfo;
  issueNumber: string;
  issuanceType: IssuanceType | null;
  items: InvoiceLineItem[];
  payments: Payment[];
  refunds: Refund[];
  totalQuantity: number;
  hasPartialLineItems: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDetailResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: InvoiceDetail;
}

export interface IssueInvoiceResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, never>;
}
