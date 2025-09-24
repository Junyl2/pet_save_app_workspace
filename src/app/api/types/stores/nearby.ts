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
  storeName: string;
  businessName: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  businessEmail: string;
  distance: number; // Distance in km
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  memberId: string;
}

/**
 * Nearby stores API response interface
 */
export interface NearbyStoresApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
    content: NearbyStoreInfo[];
    pageable: {
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      pageSize: number;
      pageNumber: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
  errorId: string | null;
}
