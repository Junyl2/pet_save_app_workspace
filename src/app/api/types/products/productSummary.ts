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

export interface ProductSummary {
  productId: string;
  productNumber: string;
  store: Store;
  thumbnail: string;
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
  createdAt: string;
  purchasable: boolean;
  wishlisted: boolean;
  ownProduct: boolean;
  reviewed: boolean;
}

export interface ProductSummaryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: ProductSummary;
  errorId: string | null;
}
