export interface Product {
  // Legacy fields (for backward compatibility)
  id?: number;
  name?: string;
  image?: string;

  // Actual API response fields
  productId?: string;
  productName?: string;
  productNumber?: string;
  thumbnail?: string;

  // Common fields
  weight?: string;
  quantity?: string;
  productWeight?: string;
  productQuantity?: string;
  price?: number;
  originalPrice?: number;
  regularPrice?: number;
  productPrice?: number;
  discountPrice?: number;
  discountedPrice?: number;
  salePrice?: number;
  expiration?: string;
  expiryDate?: string;
  expirationDate?: string;
  category?: string;
  details?: string[];
  location?: string;
  distance?: string;
  storeLocation?: string;
  storeDistance?: string;
  shopName?: string;
  shopLocation?: string;
  shopDistance?: string;
  shopImage?: string;
  phoneNumber?: string;
  storeId?: string;
  registrationStatus?: 'ONSALE' | 'SOLD_OUT';
  createdAt?: string;

  // Store information from API
  store?: {
    storeId?: number | string;
    storeName?: string;
    name?: string;
    location?: string;
    phoneNumber?: string;
    storeNumber?: string;
    profileUrl?: string;
  };
}

export interface ProductSearchParams {
  keyword?: string;
  categoryName?: string;
  baseLocation?: string;
  registrationStatus?: 'ONSALE' | 'SOLD_OUT';
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'salePrice' | 'discountedPrice' | 'expiryDate';
  direction?: 'asc' | 'desc';
}

export interface ProductSearchResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
  };
  errorId?: string;
}
