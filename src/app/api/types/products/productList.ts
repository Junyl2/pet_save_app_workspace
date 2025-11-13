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
  thumbnail?: string;
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

export interface StoreProductsResponse {
  content: StoreProduct[];
  pageInfo: PageInfo;
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
