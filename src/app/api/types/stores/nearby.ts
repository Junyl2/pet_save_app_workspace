/**
 * Nearby stores search request interface
 */
export interface NearbyStoresRequest {
  keyword?: string;
  baseLocation?: string;
  lat: number;
  long: number;
  radius?: number;
  page?: number;
  size?: number;
}

/**
 * Nearby store information interface
 */
export interface NearbyStoreInfo {
  storeId: string;
  storeNumber: string;
  ownerId: string;
  businessName: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  businessPhoneNumber: string | null;
  businessEmail: string;
  businessRegistrationCopy: string | null;
  businessProfileImage: string | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  averageRating: number;
  phoneInquiryAllowed: boolean;
  verifiedAt: string;
  openingHours: string;
  closingHours: string;
  numberOfProducts: number;
  distanceKm: number; // Distance in km
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

/**
 * Nearby stores API response interface
 */
export interface NearbyStoresApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: {
    content: NearbyStoreInfo[];
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
}
