// Cart API Types

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

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

export interface Product {
  productId: string;
  productName: string;
  productNumber: string;
  productThumbnail: string;
  quantity: number;
  category: string[];
  salePrice: number;
  discountedPrice: number;
  expiryDate: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartStore {
  cartStoreId: string;
  store: Store;
  items: CartItem[];
  totalItems: number;
  totalProducts: number;
  totalAmount: number;
  totalDiscountAmount: number;
  lastItemAddedAt: string;
  updatedAt: string;
}

export interface CartData {
  stores: CartStore[];
  totalStores: number;
  totalItems: number;
  totalProducts: number;
  totalAmount: number;
}

export interface CartResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: CartData;
  errorId?: string;
}

export interface AddToCartResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId?: string;
}
