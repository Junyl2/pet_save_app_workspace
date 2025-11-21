/**
 * Store information interface
 */
export interface StoreInfo {
  storeId: string;
  storeNumber?: string;
  ownerId?: string;
  storeName?: string;
  businessRegistrationNumber?: string;
  representativeName?: string;
  businessName: string;
  businessProfileImage?: string;
  roadAddress: string;
  detailedAddress?: string;
  zipCode?: string;
  bankName?: string;
  accountNumber?: string;
  depositorName?: string;
  businessPhoneNumber?: string;
  businessEmail: string;
  averageRating?: number;
  phoneInquiryAllowed: boolean;
  openingHours?: string;
  closingHours?: string;
  numberOfProducts?: number;
  distanceKm?: number | null;
  businessRegistrationCopyFileId?: string;
  bankbookFileId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
  memberId?: string;
  verified?: boolean;
}

/**
 * Store API response interface
 */
export interface StoreApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreInfo;
  errorId: string | null;
}

/**
 * Store list API response interface
 */
export interface StoreListApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreInfo[];
  errorId: string | null;
}

/**
 * Store creation request interface
 */
export interface StoreCreateRequest {
  storeName: string;
  businessRegistrationNumber: string;
  representativeName: string;
  businessName: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  bankName: string;
  accountNumber: string;
  depositorName: string;
  businessEmail: string;
  businessRegistrationCopyFileId?: string;
  bankbookFileId?: string;
}

/**
 * Store update request interface
 */
export interface StoreUpdateRequest {
  storeName?: string;
  businessName?: string;
  roadAddress?: string;
  detailedAddress?: string;
  zipCode?: string;
  bankName?: string;
  accountNumber?: string;
  depositorName?: string;
  businessEmail?: string;
  businessRegistrationCopyFileId?: string;
  bankbookFileId?: string;
}

/**
 * Store search request interface
 */
export interface StoreSearchRequest {
  keyword?: string;
  baseLocation?: string;
  lat?: number;
  long?: number;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'distance';
  direction?: 'asc' | 'desc';
}

/**
 * Store search response data interface
 */
export interface StoreSearchData {
  content: StoreInfo[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

/**
 * Store search API response interface
 */
export interface StoreSearchApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreSearchData;
  errorId: string | null;
}
