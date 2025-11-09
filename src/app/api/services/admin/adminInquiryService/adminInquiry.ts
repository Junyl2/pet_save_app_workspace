export type InquiryCategory =
  | 'EXCHANGE_RETURN'
  | 'PRODUCT'
  | 'DELIVERY'
  | 'PAYMENT'
  | 'OTHER';

export type InquiryStatus = 'WAITING' | 'ANSWERED';

export interface InquiryStore {
  storeId: string;
  name: string;
  storeNumber: string;
  profileUrl: string | null;
  phoneNumber: string | null;
  address: string;
  averageRating: number;
  openingHourStart: string;
  openingHourEnd: string;
}

export interface InquiryMember {
  memberId: string;
  name: string;
  profileImageUrl: string;
}

export interface InquiryProduct {
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

export interface AdminInquiryItem {
  inquiryId: string;
  store: InquiryStore;
  inquirer: InquiryMember;
  product: InquiryProduct;
  productName: string;
  category: InquiryCategory;
  status: InquiryStatus;
  content: string;
  answer: string | null;
  answeredAt: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminInquiryPageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminInquiryData {
  content: AdminInquiryItem[];
  pageInfo: AdminInquiryPageInfo;
}

export interface AdminInquirySearchResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: AdminInquiryData;
  errorId?: string;
}

/** Inquiry detail response */
export interface AdminInquiryDetailResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: AdminInquiryItem;
  errorId?: string;
}

export interface AdminInquirySearchParams {
  category?: InquiryCategory;
  status?: InquiryStatus;
  dateStart?: string;
  dateEnd?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'answeredAt';
  direction?: 'asc' | 'desc';
}

/** Request body for creating or updating an inquiry answer */
export interface InquiryAnswerRequest {
  answer: string;
}

/** Standard API base response structure */
export interface ApiBaseResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown>;
  errorId?: string;
}
