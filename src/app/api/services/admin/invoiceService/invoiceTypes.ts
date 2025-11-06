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
