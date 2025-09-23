// Address search request types
export interface AddressSearchRequest {
  keyword: string;
  currentPage?: number;
  countPerPage?: number;
}

// Address search response types - Updated to match Kakao API response structure
export interface AddressSearchResult {
  address_name: string;
  y: string;
  x: string;
  address_type: string;
  address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    region_3depth_h_name: string;
    h_code: string;
    b_code: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
    x: string;
    y: string;
  };
  road_address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
    x: string;
    y: string;
  };
}

// Alternative response structure that might come from the backend API
export interface AddressSearchResultAlternative {
  addressName: string;
  y: string;
  x: string;
  addressType: string;
  postalCode?: string;
  zoneNo?: string;
  address: {
    addressName: string;
    region1depthName: string;
    region2depthName: string;
    region3depthName: string;
    region3depthHName: string;
    hCode: string;
    bCode: string;
    mountainYn: string;
    mainAddressNo: string;
    subAddressNo: string;
    x: string;
    y: string;
  };
  roadAddress: {
    addressName: string;
    region1depthName: string;
    region2depthName: string;
    region3depthName: string;
    roadName: string;
    undergroundYn: string;
    mainBuildingNo: string;
    subBuildingNo: string;
    buildingName: string;
    zoneNo: string;
    x: string;
    y: string;
  };
}

export interface AddressSearchMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
}

export interface AddressSearchResponse {
  meta: AddressSearchMeta;
  documents: AddressSearchResult[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: T;
  errorId?: string;
}

// Zip code search response types
export interface ZipCodeSearchResult {
  address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    region_3depth_h_name: string;
    h_code: string;
    b_code: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
    x: string;
    y: string;
  };
  road_address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
    x: string;
    y: string;
  };
}

export interface ZipCodeSearchMeta {
  total_count: number;
}

export interface ZipCodeSearchResponse {
  meta: ZipCodeSearchMeta;
  documents: ZipCodeSearchResult[];
}

// Service response types
export interface AddressSearchServiceResponse {
  data?: AddressSearchResponse;
  error?: string;
}

export interface ZipCodeSearchServiceResponse {
  data?: ZipCodeSearchResponse;
  error?: string;
}
