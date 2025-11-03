// ----- Store -----
export interface Store {
  storeId: string;
  name: string;
  storeNumber: string;
  profileUrl: string | null;
  phoneNumber: string | null;
  address: string;
  averageRating: number;
  openingHourStart: string | null;
  openingHourEnd: string | null;
}

// ----- Base summary returned by list OR details (no images/expired here) -----
export interface ProductSummary {
  productId: string;
  productNumber: string;
  store: Store;

  images: string[];
  thumbnail?: string | null;

  productName: string;
  category: string[];
  description: string;
  shortDescription: string | null;
  salePrice: number;
  discountedPrice: number;
  quantity: number;
  registrationStatus: 'ONSALE' | 'SOLD_OUT';
  expiryDate: string;
  pointsUsageAllowed: boolean;
  averageRating: number;
  totalReviews: number;
  totalSold: number;

  /** Added from sample payloads */
  distanceKm?: number | null;
  createdAt: string;
  updatedAt: string;

  purchasable: boolean;
  wishlisted: boolean;
  ownProduct: boolean;
  reviewed: boolean;
}

// ----- Details extends summary with fields present in GET /products/{productId} -----
export interface ProductDetails extends ProductSummary {
  images: string[];
  expired: boolean;
}

// ----- Envelopes -----
export interface ProductSummaryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: ProductSummary;
  errorId?: string | null;
}

export interface ProductDetailsResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: ProductDetails;
  errorId?: string | null;
}

export interface ProductDetails extends ProductSummary {
  images: string[];
  expired: boolean;
}

export interface ProductDetailsResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: ProductDetails;
  errorId: string | null;
}
