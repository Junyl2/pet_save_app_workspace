export interface AdminCancelledOrdersParams {
  orderNumber?: string;
  keyword?: string;
  shippingOption?: 'DELIVERY' | 'PICKUP';
  dateStart?: string;
  dateEnd?: string;
  page?: number;
  size?: number;
}

export interface AdminCancelledOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface AdminCancelledOrderItem {
  orderItemId: string;
  orderId: string;
  orderNumber: string;
  orderTotalAmount: number;
  itemTotalAmount: number;
  shippingOption: 'DELIVERY' | 'PICKUP';
  customer: AdminCancelledOrderCustomer;
  paymentMethod: 'BANK' | 'CARD' | 'EASY_PAY';
  status: 'CANCELLED';
  productId: string;
  productName: string;
  quantity: number;
  orderedAt: string;
  cancellationReason: string | null;
  cancelledAt: string | null;
}

export interface AdminCancelledOrdersPage {
  content: AdminCancelledOrderItem[];
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

export interface AdminCancelledOrdersResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: AdminCancelledOrdersPage;
  errorId?: string;
}
