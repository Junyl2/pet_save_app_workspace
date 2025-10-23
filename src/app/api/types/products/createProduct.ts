export enum RegistrationStatus {
  ONSALE = 'ONSALE',
  SOLDOUT = 'SOLDOUT',
}

/**
 * Request body for creating a product
 * Endpoint: POST /products
 */
export interface ProductCreateRequest {
  /** Store UUID */
  storeId: string; // string($uuid)

  /** Array of uploaded image file IDs (these are not UUIDs, just strings) */
  imageFileIds: string[];

  /** Product name */
  name: string;

  /** Category UUID */
  categoryId: string; // string($uuid)

  /** Product description */
  description?: string;

  /** Available quantity (>= 0) */
  quantity: number;

  /** Regular sale price (KRW) */
  salePrice: number;

  /** Discounted price (KRW, optional) */
  discountedPrice?: number;

  /** Expiry date (YYYY-MM-DD) */
  expiryDate?: string;

  /** Registration status */
  registrationStatus: RegistrationStatus;
}

/**
 * Product entity returned from backend
 */
export interface Product {
  id: string; // string($uuid)
  storeId: string; // string($uuid)
  imageFileIds: string[];
  name: string;
  categoryId: string; // string($uuid)
  description?: string;
  quantity: number;
  salePrice: number;
  discountedPrice?: number | null;
  expiryDate?: string | null;
  registrationStatus: RegistrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

/** Standard envelope your backend returns */
export interface BaseApiEnvelope<T> {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: T;
  errorId: string | null;
}

/** Response for product status change operations */
export interface ProductStatusChangeResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}
