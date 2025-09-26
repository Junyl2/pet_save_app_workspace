import { BaseApiEnvelope } from './createProduct';

export type RegistrationStatus = 'ONSALE' | 'SOLD_OUT';
export type SortBy =
  | 'createdAt'
  | 'salePrice'
  | 'discountedPrice'
  | 'expiryDate';
export type SortDirection = 'asc' | 'desc';

export interface StoreProduct {
  productId: string;
  productNumber: string;
  productName: string;
  description?: string;
  salePrice: number;
  discountedPrice?: number;
  expiryDate?: string;
  registrationStatus: RegistrationStatus;
  categoryName?: string;
  storeId: string;
  storeAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
}

export interface StoreProductsRequest {
  storeId: string;
  keyword?: string;
  categoryName?: string;
  baseLocation?: string;
  registrationStatus?: RegistrationStatus;
  page?: number;
  size?: number;
  sortBy?: SortBy;
  direction?: SortDirection;
}

export interface StoreProductsResponse {
  content: StoreProduct[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export type StoreProductsApiResponse = BaseApiEnvelope<StoreProductsResponse>;

export interface DeleteProductResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, never>; // ✅ strict empty object
  errorId: string;
}

export type DeleteProductApiResponse = BaseApiEnvelope<Record<string, never>>; //  strict empty object
