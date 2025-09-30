/**
 * General inquiry types for member inquiries
 */

/**
 * Types for GET /api/pet-save/members/me/inquiries endpoint
 * 내 문의 조회 | Get my inquiries
 */
export interface MyInquiry {
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

export interface MyInquiriesResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: {
    content: MyInquiry[];
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

export interface MyInquiriesParams {
  category?: 'EXCHANGE_RETURN' | 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'OTHER';
  status?: 'WAITING' | 'ANSWERED';
  dateStart?: string; // YYYY-MM-DD format
  dateEnd?: string; // YYYY-MM-DD format
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'answeredAt';
  direction?: 'asc' | 'desc';
}

/**
 * Base inquiry information
 */
export interface Inquiry {
  inquiryId: string;
  memberId: string;
  title: string;
  content: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments?: string[]; // File IDs
}

/**
 * Inquiry creation request
 */
export interface CreateInquiryRequest {
  title: string;
  content: string;
  category: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: string[]; // File IDs
}

/**
 * Inquiry update request
 */
export interface UpdateInquiryRequest {
  title?: string;
  content?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: string[]; // File IDs
}

/**
 * Inquiry response wrapper
 */
export interface InquiryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Inquiry;
  errorId?: string;
}

/**
 * Inquiry list response
 */
export interface InquiryListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
    inquiries: Inquiry[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  errorId?: string;
}
