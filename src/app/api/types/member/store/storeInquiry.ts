/**
 * Types for GET /api/pet-save/members/me/store/inquiries endpoint
 * 내 가게 문의 조회 | Get my store inquiries
 */

export interface StoreInquiry {
  inquiryId: string;
  store: {
    storeId: string;
    name: string;
    storeNumber: string;
    profileUrl: string | null;
    phoneNumber: string | null;
    address: string;
    averageRating: number;
    openingHourStart: string | null;
    openingHourEnd: string | null;
  };
  inquirer: {
    memberId: string;
    name: string;
    profileImageUrl: string | null;
  };
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
  productName: string;
  category: 'EXCHANGE_RETURN' | 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'OTHER';
  status: 'WAITING' | 'ANSWERED';
  content: string;
  answer: string | null;
  answeredAt: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreInquiriesResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: {
    content: StoreInquiry[];
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
  };
  errorId?: string;
}

export interface StoreInquiriesParams {
  category?: 'EXCHANGE_RETURN' | 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'OTHER';
  status?: 'WAITING' | 'ANSWERED';
  dateStart?: string; // YYYY-MM-DD format
  dateEnd?: string; // YYYY-MM-DD format
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'answeredAt';
  direction?: 'asc' | 'desc';
}
