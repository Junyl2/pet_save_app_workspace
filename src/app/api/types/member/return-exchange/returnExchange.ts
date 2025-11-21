export type ReturnExchangeType = 'RETURN' | 'EXCHANGE';

export type ReturnExchangeStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'WAITING_FOR_RETURN'
  | 'RETURNED'
  | 'EXCHANGED';

export type CollectionMethod = 'COURIER_PICKUP' | 'CUSTOMER_RETURN' | string;

export type ExchangeOption =
  | 'RETURN_ONLY'
  | 'SIZE_CHANGE'
  | 'PRODUCT_CHANGE'
  | string;

export interface BaseApiResponse<T = unknown> {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: T;
  errorId?: string;
}

export interface CreateReturnExchangeRequest {
  type: ReturnExchangeType;
  reason: string;
  orderItemIds: string[];
  collectionMethod: CollectionMethod;
  exchangeOption: ExchangeOption;
}

export interface UpdateReturnExchangeStatusRequest {
  status: ReturnExchangeStatus;
  rejectReason?: string;
}

export interface ReturnExchangeItem {
  id: string;
  type: ReturnExchangeType;
  status: ReturnExchangeStatus;
  reason: string;
  requesterId: string;
  storeId: string;
  productId?: string;
  exchangeOption?: ExchangeOption;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnExchangeQueryParams {
  type?: ReturnExchangeType;
  status?: ReturnExchangeStatus;
  requesterId?: string;
  storeId?: string;
  productId?: string;
  dateStart?: string;
  dateEnd?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  direction?: 'asc' | 'desc';
}
export interface ReturnRequestByOrderItemResponse {
  returnRequestId: string;
  orderNumber: string;
  requester: {
    memberId: string;
    name: string;
    profileImageUrl: string;
    phoneNumber: string;
  };
  storeName: string;
  storeProfileImageUrl: string;
  type: ReturnExchangeType;
  reason: string;
  rejectReason: string | null;
  exchangeOption: string;
  status: ReturnExchangeStatus;
  collectionMethod: CollectionMethod;
  items: ReturnRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequestItem {
  returnRequestItemId: string;
  orderItemId: string;
  storeId: string;
  product: {
    productId: string;
    productName: string;
    productNumber: string;
    productThumbnail: string;
    quantity: number;
    category: string[];
    salePrice: number;
    discountedPrice: number;
    expiryDate: string;
  };
  unitPrice: number;
  subtotal: number;
  totalAmount: number;
  discountAllocated: number;
  refundableAmount: number;
  orderedQuantity: number;
}
