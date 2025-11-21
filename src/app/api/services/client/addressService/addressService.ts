import { apiClient } from '@/app/api/apiClient';
import {
  AddressSearchRequest,
  AddressSearchServiceResponse,
  ZipCodeSearchServiceResponse,
  AddressSearchResponse,
  ZipCodeSearchResponse,
  AddressKeywordSearchPostRequest,
} from '@/app/api/types/address/addressSearch';

// Flexible type that includes all possible properties from different response formats
type FlexibleAddressResult = {
  // Common properties
  address_name?: string;
  addressName?: string;
  y?: string;
  x?: string;
  longitude?: string;
  latitude?: string;
  lng?: string;
  lat?: string;
  address_type?: string;
  addressType?: string;
  zipCode?: string;
  zip_code?: string;
  postalCode?: string;
  zone_no?: string;
  zoneNo?: string;

  // Address object properties
  address?: {
    address_name?: string;
    addressName?: string;
    region_1depth_name?: string;
    region1depthName?: string;
    region_2depth_name?: string;
    region2depthName?: string;
    region_3depth_name?: string;
    region3depthName?: string;
    region_3depth_h_name?: string;
    region3depthHName?: string;
    h_code?: string;
    hCode?: string;
    b_code?: string;
    bCode?: string;
    mountain_yn?: string;
    mountainYn?: string;
    main_address_no?: string;
    mainAddressNo?: string;
    sub_address_no?: string;
    subAddressNo?: string;
    x?: string;
    y?: string;
    zone_no?: string;
    zoneNo?: string;
  };

  // Road address object properties
  road_address?: {
    address_name?: string;
    addressName?: string;
    region_1depth_name?: string;
    region1depthName?: string;
    region_2depth_name?: string;
    region2depthName?: string;
    region_3depth_name?: string;
    region3depthName?: string;
    road_name?: string;
    roadName?: string;
    underground_yn?: string;
    undergroundYn?: string;
    main_building_no?: string;
    mainBuildingNo?: string;
    sub_building_no?: string;
    subBuildingNo?: string;
    building_name?: string;
    buildingName?: string;
    zone_no?: string;
    zoneNo?: string;
    x?: string;
    y?: string;
  };

  // Alternative road address object properties
  roadAddress?: {
    address_name?: string;
    addressName?: string;
    region_1depth_name?: string;
    region1depthName?: string;
    region_2depth_name?: string;
    region2depthName?: string;
    region_3depth_name?: string;
    region3depthName?: string;
    road_name?: string;
    roadName?: string;
    underground_yn?: string;
    undergroundYn?: string;
    main_building_no?: string;
    mainBuildingNo?: string;
    sub_building_no?: string;
    subBuildingNo?: string;
    building_name?: string;
    buildingName?: string;
    zone_no?: string;
    zoneNo?: string;
    x?: string;
    y?: string;
  };
};

/**
 * Address Service for handling address search operations
 * Uses Kakao API for address search functionality
 */
export class AddressService {
  private static readonly BASE_URL = '/address';

  // Rate limiting for zip code searches to prevent 429 errors
  private static readonly RATE_LIMIT_DURATION = 3000; // 3 seconds between requests
  private static lastZipCodeRequestTime = 0;

  /**
   * Search addresses by keyword using GET method
   * @param keyword - Search keyword for address
   * @param currentPage - Page number (default: 1)
   * @param countPerPage - Number of results per page (default: 10, max: 15)
   * @returns Promise<AddressSearchServiceResponse>
   */
  static async searchAddressByKeyword(
    keyword: string,
    currentPage: number = 1,
    countPerPage: number = 10
  ): Promise<AddressSearchServiceResponse> {
    try {
      // Validate parameters
      if (!keyword || keyword.trim().length === 0) {
        return {
          error: '검색 키워드를 입력해주세요.',
        };
      }

      if (currentPage < 1) {
        return {
          error: '페이지 번호는 1 이상이어야 합니다.',
        };
      }

      if (countPerPage < 1 || countPerPage > 15) {
        return {
          error: '페이지당 결과 수는 1-15 사이여야 합니다.',
        };
      }

      const params = new URLSearchParams({
        keyword: keyword.trim(),
        currentPage: currentPage.toString(),
        countPerPage: countPerPage.toString(),
      });

      const response = await apiClient.get<{
        success: boolean;
        resultMsg?: string;
        data: {
          roadAddress?: string;
          zipCode?: string;
          totalCount?: number;
          results?: FlexibleAddressResult[];
          documents?: FlexibleAddressResult[];
          currentPage?: number;
          countPerPage?: number;
          total_count?: number;
          count_per_page?: number;
          current_page?: number;
        };
      }>(`${this.BASE_URL}/search?${params.toString()}`);

      console.log('Address search API response:', response);

      if (response.error) {
        return {
          error: response.error,
        };
      }

      // The apiClient wraps the response, so response.data is the actual API response
      const apiResponse = response.data;

      if (!apiResponse?.success) {
        return {
          error: apiResponse?.resultMsg || '주소 검색 중 오류가 발생했습니다.',
        };
      }

      // Transform the response to match expected structure
      // Handle the actual server response format
      let transformedData: AddressSearchResponse;

      if (apiResponse.data?.roadAddress && apiResponse.data?.zipCode) {
        // Server returns single address result (zip code search format)
        transformedData = {
          meta: {
            total_count: apiResponse.data?.totalCount || 1,
            pageable_count: 1,
            is_end: true,
          },
          documents: [
            {
              address_name: apiResponse.data.roadAddress,
              y: '', // Not provided by server
              x: '', // Not provided by server
              address_type: 'ROAD',
              address: {
                address_name: apiResponse.data.roadAddress,
                region_1depth_name: '',
                region_2depth_name: '',
                region_3depth_name: '',
                region_3depth_h_name: '',
                h_code: '',
                b_code: '',
                mountain_yn: '',
                main_address_no: '',
                sub_address_no: '',
                x: '',
                y: '',
              },
              road_address: {
                address_name: apiResponse.data.roadAddress,
                region_1depth_name: '',
                region_2depth_name: '',
                region_3depth_name: '',
                road_name: '',
                underground_yn: '',
                main_building_no: '',
                sub_building_no: '',
                building_name: '',
                zone_no: apiResponse.data.zipCode,
                x: '',
                y: '',
              },
            },
          ],
        };
      } else if (
        apiResponse.data?.results &&
        Array.isArray(apiResponse.data.results)
      ) {
        // Server returns array of results (place/POI search format)
        // For each result, get zip code using coordinates
        console.log('Processing place search results and getting zip codes...');

        const transformedDocuments = await Promise.all(
          apiResponse.data.results.map(
            async (result: FlexibleAddressResult) => {
              let zipCode = result.zipCode || result.zone_no || '';
              let roadAddress = result.addressName || result.address_name || '';

              // If we have coordinates but no zip code, try to get it
              const x = result.x || result.longitude;
              const y = result.y || result.latitude;

              if (x && y && !zipCode) {
                try {
                  console.log(`Getting zip code for coordinates: ${x}, ${y}`);
                  const zipResponse = await this.searchZipCodeByCoordinates(
                    parseFloat(x),
                    parseFloat(y)
                  );
                  if (
                    zipResponse.data &&
                    zipResponse.data.documents &&
                    zipResponse.data.documents.length > 0
                  ) {
                    const zipResult = zipResponse.data.documents[0];
                    zipCode = this.extractPostalCode(zipResult);
                    // Use the road address from zip code search if available
                    if (
                      zipResult.road_address &&
                      zipResult.road_address.address_name
                    ) {
                      roadAddress = zipResult.road_address.address_name;
                    }
                    console.log(
                      `Found zip code: ${zipCode} for address: ${roadAddress}`
                    );
                  }
                } catch (error) {
                  console.warn(
                    'Failed to get zip code for coordinates:',
                    error
                  );
                }
              }

              return {
                address_name: roadAddress,
                y: y || '',
                x: x || '',
                address_type: 'ROAD',
                address: {
                  address_name: roadAddress,
                  region_1depth_name: '',
                  region_2depth_name: '',
                  region_3depth_name: '',
                  region_3depth_h_name: '',
                  h_code: '',
                  b_code: '',
                  mountain_yn: '',
                  main_address_no: '',
                  sub_address_no: '',
                  x: x || '',
                  y: y || '',
                },
                road_address: {
                  address_name: roadAddress,
                  region_1depth_name: '',
                  region_2depth_name: '',
                  region_3depth_name: '',
                  road_name: '',
                  underground_yn: '',
                  main_building_no: '',
                  sub_building_no: '',
                  building_name: '',
                  zone_no: zipCode,
                  x: x || '',
                  y: y || '',
                },
              };
            }
          )
        );

        transformedData = {
          meta: {
            total_count: apiResponse.data?.totalCount || 0,
            pageable_count: apiResponse.data?.countPerPage || 10,
            is_end:
              (apiResponse.data?.currentPage || 1) *
                (apiResponse.data?.countPerPage || 10) >=
              (apiResponse.data?.totalCount || 0),
          },
          documents: transformedDocuments,
        };
      } else {
        // Fallback to original format
        transformedData = {
          meta: {
            total_count:
              apiResponse.data?.totalCount ||
              apiResponse.data?.total_count ||
              0,
            pageable_count:
              apiResponse.data?.countPerPage ||
              apiResponse.data?.count_per_page ||
              10,
            is_end:
              (apiResponse.data?.currentPage ||
                apiResponse.data?.current_page ||
                1) *
                (apiResponse.data?.countPerPage ||
                  apiResponse.data?.count_per_page ||
                  10) >=
              (apiResponse.data?.totalCount ||
                apiResponse.data?.total_count ||
                0),
          },
          documents: (
            apiResponse.data?.results ||
            apiResponse.data?.documents ||
            []
          ).map((doc: FlexibleAddressResult) => ({
            address_name: doc.address_name || doc.addressName || '',
            y: doc.y || '',
            x: doc.x || '',
            address_type: doc.address_type || doc.addressType || 'ROAD',
            address: {
              address_name:
                doc.address?.address_name || doc.address?.addressName || '',
              region_1depth_name:
                doc.address?.region_1depth_name ||
                doc.address?.region1depthName ||
                '',
              region_2depth_name:
                doc.address?.region_2depth_name ||
                doc.address?.region2depthName ||
                '',
              region_3depth_name:
                doc.address?.region_3depth_name ||
                doc.address?.region3depthName ||
                '',
              region_3depth_h_name:
                doc.address?.region_3depth_h_name ||
                doc.address?.region3depthHName ||
                '',
              h_code: doc.address?.h_code || doc.address?.hCode || '',
              b_code: doc.address?.b_code || doc.address?.bCode || '',
              mountain_yn:
                doc.address?.mountain_yn || doc.address?.mountainYn || '',
              main_address_no:
                doc.address?.main_address_no ||
                doc.address?.mainAddressNo ||
                '',
              sub_address_no:
                doc.address?.sub_address_no || doc.address?.subAddressNo || '',
              x: doc.address?.x || '',
              y: doc.address?.y || '',
            },
            road_address: {
              address_name:
                doc.road_address?.address_name ||
                doc.road_address?.addressName ||
                doc.roadAddress?.address_name ||
                doc.roadAddress?.addressName ||
                '',
              region_1depth_name:
                doc.road_address?.region_1depth_name ||
                doc.road_address?.region1depthName ||
                doc.roadAddress?.region_1depth_name ||
                doc.roadAddress?.region1depthName ||
                '',
              region_2depth_name:
                doc.road_address?.region_2depth_name ||
                doc.road_address?.region2depthName ||
                doc.roadAddress?.region_2depth_name ||
                doc.roadAddress?.region2depthName ||
                '',
              region_3depth_name:
                doc.road_address?.region_3depth_name ||
                doc.road_address?.region3depthName ||
                doc.roadAddress?.region_3depth_name ||
                doc.roadAddress?.region3depthName ||
                '',
              road_name:
                doc.road_address?.road_name ||
                doc.road_address?.roadName ||
                doc.roadAddress?.road_name ||
                doc.roadAddress?.roadName ||
                '',
              underground_yn:
                doc.road_address?.underground_yn ||
                doc.road_address?.undergroundYn ||
                doc.roadAddress?.underground_yn ||
                doc.roadAddress?.undergroundYn ||
                '',
              main_building_no:
                doc.road_address?.main_building_no ||
                doc.road_address?.mainBuildingNo ||
                doc.roadAddress?.main_building_no ||
                doc.roadAddress?.mainBuildingNo ||
                '',
              sub_building_no:
                doc.road_address?.sub_building_no ||
                doc.road_address?.subBuildingNo ||
                doc.roadAddress?.sub_building_no ||
                doc.roadAddress?.subBuildingNo ||
                '',
              building_name:
                doc.road_address?.building_name ||
                doc.road_address?.buildingName ||
                doc.roadAddress?.building_name ||
                doc.roadAddress?.buildingName ||
                '',
              zone_no:
                doc.road_address?.zone_no ||
                doc.road_address?.zoneNo ||
                doc.roadAddress?.zone_no ||
                doc.roadAddress?.zoneNo ||
                doc.zipCode ||
                doc.zip_code ||
                doc.postalCode ||
                doc.zone_no ||
                doc.zoneNo ||
                '',
              x: doc.road_address?.x || doc.roadAddress?.x || '',
              y: doc.road_address?.y || doc.roadAddress?.y || '',
            },
          })),
        };
      }

      return {
        data: transformedData,
      };
    } catch (error) {
      console.error('Address search error:', error);
      return {
        error: '주소 검색 중 네트워크 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Search addresses by keyword using POST method (alternative)
   * @param searchRequest - Address search request object
   * @returns Promise<AddressSearchServiceResponse>
   */
  static async searchAddressByKeywordPost(
    searchRequest: AddressSearchRequest
  ): Promise<AddressSearchServiceResponse> {
    try {
      // Validate parameters
      if (!searchRequest.keyword || searchRequest.keyword.trim().length === 0) {
        return {
          error: '검색 키워드를 입력해주세요.',
        };
      }

      const currentPage = searchRequest.currentPage || 1;
      const countPerPage = searchRequest.countPerPage || 10;

      if (currentPage < 1) {
        return {
          error: '페이지 번호는 1 이상이어야 합니다.',
        };
      }

      if (countPerPage < 1 || countPerPage > 15) {
        return {
          error: '페이지당 결과 수는 1-15 사이여야 합니다.',
        };
      }

      const requestBody = {
        keyword: searchRequest.keyword.trim(),
        currentPage,
        countPerPage,
      };

      const response = await apiClient.post<{
        success: boolean;
        resultMsg?: string;
        data: {
          roadAddress?: string;
          zipCode?: string;
          totalCount?: number;
          results?: FlexibleAddressResult[];
          documents?: FlexibleAddressResult[];
          currentPage?: number;
          countPerPage?: number;
          total_count?: number;
          count_per_page?: number;
          current_page?: number;
        };
      }>(`${this.BASE_URL}/search`, requestBody);

      console.log('Address search POST API response:', response);

      if (response.error) {
        return {
          error: response.error,
        };
      }

      // The apiClient wraps the response, so response.data is the actual API response
      const apiResponse = response.data;

      if (!apiResponse?.success) {
        return {
          error: apiResponse?.resultMsg || '주소 검색 중 오류가 발생했습니다.',
        };
      }

      // Transform the response to match expected structure
      // Handle the actual server response format
      let transformedData: AddressSearchResponse;

      if (apiResponse.data?.roadAddress && apiResponse.data?.zipCode) {
        // Server returns single address result (zip code search format)
        transformedData = {
          meta: {
            total_count: apiResponse.data?.totalCount || 1,
            pageable_count: 1,
            is_end: true,
          },
          documents: [
            {
              address_name: apiResponse.data.roadAddress,
              y: '', // Not provided by server
              x: '', // Not provided by server
              address_type: 'ROAD',
              address: {
                address_name: apiResponse.data.roadAddress,
                region_1depth_name: '',
                region_2depth_name: '',
                region_3depth_name: '',
                region_3depth_h_name: '',
                h_code: '',
                b_code: '',
                mountain_yn: '',
                main_address_no: '',
                sub_address_no: '',
                x: '',
                y: '',
              },
              road_address: {
                address_name: apiResponse.data.roadAddress,
                region_1depth_name: '',
                region_2depth_name: '',
                region_3depth_name: '',
                road_name: '',
                underground_yn: '',
                main_building_no: '',
                sub_building_no: '',
                building_name: '',
                zone_no: apiResponse.data.zipCode,
                x: '',
                y: '',
              },
            },
          ],
        };
      } else if (
        apiResponse.data?.results &&
        Array.isArray(apiResponse.data.results)
      ) {
        // Server returns array of results (place/POI search format)
        // For each result, get zip code using coordinates
        console.log('Processing place search results and getting zip codes...');

        const transformedDocuments = await Promise.all(
          apiResponse.data.results.map(
            async (result: FlexibleAddressResult) => {
              let zipCode = result.zipCode || result.zone_no || '';
              let roadAddress = result.addressName || result.address_name || '';

              // If we have coordinates but no zip code, try to get it
              const x = result.x || result.longitude;
              const y = result.y || result.latitude;

              if (x && y && !zipCode) {
                try {
                  console.log(`Getting zip code for coordinates: ${x}, ${y}`);
                  const zipResponse = await this.searchZipCodeByCoordinates(
                    parseFloat(x),
                    parseFloat(y)
                  );
                  if (
                    zipResponse.data &&
                    zipResponse.data.documents &&
                    zipResponse.data.documents.length > 0
                  ) {
                    const zipResult = zipResponse.data.documents[0];
                    zipCode = this.extractPostalCode(zipResult);
                    // Use the road address from zip code search if available
                    if (
                      zipResult.road_address &&
                      zipResult.road_address.address_name
                    ) {
                      roadAddress = zipResult.road_address.address_name;
                    }
                    console.log(
                      `Found zip code: ${zipCode} for address: ${roadAddress}`
                    );
                  }
                } catch (error) {
                  console.warn(
                    'Failed to get zip code for coordinates:',
                    error
                  );
                }
              }

              return {
                address_name: roadAddress,
                y: y || '',
                x: x || '',
                address_type: 'ROAD',
                address: {
                  address_name: roadAddress,
                  region_1depth_name: '',
                  region_2depth_name: '',
                  region_3depth_name: '',
                  region_3depth_h_name: '',
                  h_code: '',
                  b_code: '',
                  mountain_yn: '',
                  main_address_no: '',
                  sub_address_no: '',
                  x: x || '',
                  y: y || '',
                },
                road_address: {
                  address_name: roadAddress,
                  region_1depth_name: '',
                  region_2depth_name: '',
                  region_3depth_name: '',
                  road_name: '',
                  underground_yn: '',
                  main_building_no: '',
                  sub_building_no: '',
                  building_name: '',
                  zone_no: zipCode,
                  x: x || '',
                  y: y || '',
                },
              };
            }
          )
        );

        transformedData = {
          meta: {
            total_count: apiResponse.data?.totalCount || 0,
            pageable_count: apiResponse.data?.countPerPage || 10,
            is_end:
              (apiResponse.data?.currentPage || 1) *
                (apiResponse.data?.countPerPage || 10) >=
              (apiResponse.data?.totalCount || 0),
          },
          documents: transformedDocuments,
        };
      } else {
        // Fallback to original format
        transformedData = {
          meta: {
            total_count:
              apiResponse.data?.totalCount ||
              apiResponse.data?.total_count ||
              0,
            pageable_count:
              apiResponse.data?.countPerPage ||
              apiResponse.data?.count_per_page ||
              10,
            is_end:
              (apiResponse.data?.currentPage ||
                apiResponse.data?.current_page ||
                1) *
                (apiResponse.data?.countPerPage ||
                  apiResponse.data?.count_per_page ||
                  10) >=
              (apiResponse.data?.totalCount ||
                apiResponse.data?.total_count ||
                0),
          },
          documents: (
            apiResponse.data?.results ||
            apiResponse.data?.documents ||
            []
          ).map((doc: FlexibleAddressResult) => ({
            address_name: doc.address_name || doc.addressName || '',
            y: doc.y || '',
            x: doc.x || '',
            address_type: doc.address_type || doc.addressType || 'ROAD',
            address: {
              address_name:
                doc.address?.address_name || doc.address?.addressName || '',
              region_1depth_name:
                doc.address?.region_1depth_name ||
                doc.address?.region1depthName ||
                '',
              region_2depth_name:
                doc.address?.region_2depth_name ||
                doc.address?.region2depthName ||
                '',
              region_3depth_name:
                doc.address?.region_3depth_name ||
                doc.address?.region3depthName ||
                '',
              region_3depth_h_name:
                doc.address?.region_3depth_h_name ||
                doc.address?.region3depthHName ||
                '',
              h_code: doc.address?.h_code || doc.address?.hCode || '',
              b_code: doc.address?.b_code || doc.address?.bCode || '',
              mountain_yn:
                doc.address?.mountain_yn || doc.address?.mountainYn || '',
              main_address_no:
                doc.address?.main_address_no ||
                doc.address?.mainAddressNo ||
                '',
              sub_address_no:
                doc.address?.sub_address_no || doc.address?.subAddressNo || '',
              x: doc.address?.x || '',
              y: doc.address?.y || '',
            },
            road_address: {
              address_name:
                doc.road_address?.address_name ||
                doc.road_address?.addressName ||
                doc.roadAddress?.address_name ||
                doc.roadAddress?.addressName ||
                '',
              region_1depth_name:
                doc.road_address?.region_1depth_name ||
                doc.road_address?.region1depthName ||
                doc.roadAddress?.region_1depth_name ||
                doc.roadAddress?.region1depthName ||
                '',
              region_2depth_name:
                doc.road_address?.region_2depth_name ||
                doc.road_address?.region2depthName ||
                doc.roadAddress?.region_2depth_name ||
                doc.roadAddress?.region2depthName ||
                '',
              region_3depth_name:
                doc.road_address?.region_3depth_name ||
                doc.road_address?.region3depthName ||
                doc.roadAddress?.region_3depth_name ||
                doc.roadAddress?.region3depthName ||
                '',
              road_name:
                doc.road_address?.road_name ||
                doc.road_address?.roadName ||
                doc.roadAddress?.road_name ||
                doc.roadAddress?.roadName ||
                '',
              underground_yn:
                doc.road_address?.underground_yn ||
                doc.road_address?.undergroundYn ||
                doc.roadAddress?.underground_yn ||
                doc.roadAddress?.undergroundYn ||
                '',
              main_building_no:
                doc.road_address?.main_building_no ||
                doc.road_address?.mainBuildingNo ||
                doc.roadAddress?.main_building_no ||
                doc.roadAddress?.mainBuildingNo ||
                '',
              sub_building_no:
                doc.road_address?.sub_building_no ||
                doc.road_address?.subBuildingNo ||
                doc.roadAddress?.sub_building_no ||
                doc.roadAddress?.subBuildingNo ||
                '',
              building_name:
                doc.road_address?.building_name ||
                doc.road_address?.buildingName ||
                doc.roadAddress?.building_name ||
                doc.roadAddress?.buildingName ||
                '',
              zone_no:
                doc.road_address?.zone_no ||
                doc.road_address?.zoneNo ||
                doc.roadAddress?.zone_no ||
                doc.roadAddress?.zoneNo ||
                doc.zipCode ||
                doc.zip_code ||
                doc.postalCode ||
                doc.zone_no ||
                doc.zoneNo ||
                '',
              x: doc.road_address?.x || doc.roadAddress?.x || '',
              y: doc.road_address?.y || doc.roadAddress?.y || '',
            },
          })),
        };
      }

      return {
        data: transformedData,
      };
    } catch (error) {
      console.error('Address search error:', error);
      return {
        error: '주소 검색 중 네트워크 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Format address for display
   * @param addressResult - Address search result
   * @returns Formatted address string
   */
  static formatAddress(
    addressResult: FlexibleAddressResult | null | undefined
  ): string {
    if (!addressResult) return '';

    // Handle the actual API response structure
    // The API returns addressName (camelCase) instead of address_name (snake_case)
    if (addressResult.addressName) {
      return addressResult.addressName;
    }

    // Fallback to snake_case format (for compatibility)
    if (addressResult.road_address && addressResult.road_address.address_name) {
      return addressResult.road_address.address_name;
    }

    if (addressResult.address && addressResult.address.address_name) {
      return addressResult.address.address_name;
    }

    // Handle alternative camelCase format
    if (addressResult.roadAddress && addressResult.roadAddress.addressName) {
      return addressResult.roadAddress.addressName;
    }

    if (addressResult.address && addressResult.address.addressName) {
      return addressResult.address.addressName;
    }

    // Last resort
    return addressResult.address_name || '';
  }

  /**
   * Extract postal code from address result
   * @param addressResult - Address search result
   * @returns Postal code string
   */
  static extractPostalCode(
    addressResult: FlexibleAddressResult | null | undefined
  ): string {
    if (!addressResult) return '';

    // Handle the actual API response structure
    // Check for postal code in various possible field names (camelCase first)
    if (addressResult.postalCode) {
      return addressResult.postalCode;
    }

    if (addressResult.zoneNo) {
      return addressResult.zoneNo;
    }

    // Check road_address for zone_no (most common in Kakao API)
    if (addressResult.road_address && addressResult.road_address.zone_no) {
      return addressResult.road_address.zone_no;
    }

    // Check roadAddress for zoneNo (camelCase format)
    if (addressResult.roadAddress && addressResult.roadAddress.zoneNo) {
      return addressResult.roadAddress.zoneNo;
    }

    // Check address for zone_no (fallback)
    if (addressResult.address && addressResult.address.zone_no) {
      return addressResult.address.zone_no;
    }

    // Check address for zoneNo (camelCase fallback)
    if (addressResult.address && addressResult.address.zoneNo) {
      return addressResult.address.zoneNo;
    }

    // Check direct zone_no field
    if (addressResult.zone_no) {
      return addressResult.zone_no;
    }

    // Check for other possible zip code field names
    if (addressResult.zipCode) {
      return addressResult.zipCode;
    }

    if (addressResult.zip_code) {
      return addressResult.zip_code;
    }

    return '';
  }

  /**
   * Extract coordinates from address result
   * @param addressResult - Address search result
   * @returns Object with x (longitude) and y (latitude)
   */
  static extractCoordinates(
    addressResult: FlexibleAddressResult | null | undefined
  ): { x: string; y: string } {
    if (!addressResult) return { x: '', y: '' };

    // Handle the actual API response structure
    // Check for coordinates in various possible field names
    return {
      x: addressResult.x || addressResult.longitude || addressResult.lng || '',
      y: addressResult.y || addressResult.latitude || addressResult.lat || '',
    };
  }

  /**
   * Search address and get nearby stores in one operation
   * @param keyword - Address search keyword
   * @param radius - Search radius in km (default: 10)
   * @param page - Page number (default: 0)
   * @param size - Results per page (default: 20)
   * @returns Promise with nearby stores or error
   */
  static async searchAddressAndNearbyStores(
    keyword: string,
    radius: number = 10,
    page: number = 0,
    size: number = 20
  ): Promise<{
    data: {
      address: string;
      coordinates: { lat: number; long: number };
      stores: unknown[];
    } | null;
    error: string | null;
  }> {
    try {
      console.log('🔍 Starting address search and nearby stores lookup:', {
        keyword,
        radius,
        page,
        size,
      });

      // Step 1: Search for address
      const addressResponse = await this.searchAddressByKeywordPost({
        keyword,
        currentPage: 1,
        countPerPage: 1, // Only need the first result
      });

      if (addressResponse.error) {
        console.error('❌ Address search failed:', addressResponse.error);
        return { data: null, error: addressResponse.error };
      }

      if (
        !addressResponse.data?.documents ||
        addressResponse.data.documents.length === 0
      ) {
        console.error('❌ No address results found');
        return { data: null, error: '검색된 주소가 없습니다.' };
      }

      // Get the first result
      const firstResult = addressResponse.data.documents[0];
      const coordinates = this.extractCoordinates(firstResult);

      if (!coordinates.x || !coordinates.y) {
        console.error('❌ No coordinates found in address result');
        return { data: null, error: '주소에서 좌표를 찾을 수 없습니다.' };
      }

      const lat = parseFloat(coordinates.y);
      const long = parseFloat(coordinates.x);

      if (isNaN(lat) || isNaN(long)) {
        console.error('❌ Invalid coordinates:', { lat, long });
        return { data: null, error: '유효하지 않은 좌표입니다.' };
      }

      console.log('✅ Address found with coordinates:', {
        address: firstResult.address_name,
        lat,
        long,
      });

      // Step 2: Search nearby stores using coordinates
      const { StoreService } = await import('../storeService/storeService');
      const nearbyResponse = await StoreService.searchNearbyStores({
        lat,
        long,
        radius,
        page,
        size,
      });

      if (nearbyResponse.error) {
        console.error('❌ Nearby stores search failed:', nearbyResponse.error);
        return { data: null, error: nearbyResponse.error };
      }

      if (!nearbyResponse.data?.data?.content) {
        console.error('❌ No nearby stores found');
        return { data: null, error: '주변 상점을 찾을 수 없습니다.' };
      }

      console.log('✅ Nearby stores found:', {
        address: firstResult.address_name,
        storesCount: nearbyResponse.data.data.content.length,
      });

      return {
        data: {
          address: firstResult.address_name,
          coordinates: { lat, long },
          stores: nearbyResponse.data.data.content,
        },
        error: null,
      };
    } catch (error) {
      console.error('💥 Address and nearby stores search error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : '주소 검색 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Search by keyword (Alternative, POST) – delegates to the existing POST handler.
   * Endpoint: POST /api/pet-save/address/search
   */
  static async searchAddressByKeywordAlternative(
    payload: AddressKeywordSearchPostRequest
  ): Promise<AddressSearchServiceResponse> {
    console.log('[AddressService] POST keyword alternative search:', {
      keyword: payload?.keyword,
      currentPage: payload?.currentPage ?? 1,
      countPerPage: payload?.countPerPage ?? 10,
    });
    return this.searchAddressByKeywordPost(payload);
  }

  /**
   * Search zip code by coordinates using GET method with rate limiting
   * @param x - Longitude coordinate
   * @param y - Latitude coordinate
   * @returns Promise<ZipCodeSearchServiceResponse>
   */
  static async searchZipCodeByCoordinates(
    x: number,
    y: number
  ): Promise<ZipCodeSearchServiceResponse> {
    try {
      // Validate parameters
      if (typeof x !== 'number' || typeof y !== 'number') {
        return {
          error: '유효한 좌표를 입력해주세요.',
        };
      }

      if (isNaN(x) || isNaN(y)) {
        return {
          error: '유효한 좌표 형식이 아닙니다.',
        };
      }

      // Rate limiting - prevent too many requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastZipCodeRequestTime;
      if (timeSinceLastRequest < this.RATE_LIMIT_DURATION) {
        console.log(
          '⏱️ Rate limiting zip code request - too soon since last request'
        );
        return {
          error: '요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.',
        };
      }

      this.lastZipCodeRequestTime = now;

      const params = new URLSearchParams({
        x: x.toString(),
        y: y.toString(),
      });

      const response = await apiClient.get<{
        success: boolean;
        resultMsg?: string;
        data: {
          roadAddress?: string;
          zipCode?: string;
          totalCount?: number;
          results?: FlexibleAddressResult[];
          documents?: FlexibleAddressResult[];
          total_count?: number;
        };
      }>(`${this.BASE_URL}/search/zip-code?${params.toString()}`);

      console.log('Zip code search API response:', response);

      if (response.error) {
        return {
          error: response.error,
        };
      }

      // The apiClient wraps the response, so response.data is the actual API response
      const apiResponse = response.data;

      if (!apiResponse?.success) {
        return {
          error:
            apiResponse?.resultMsg || '우편번호 검색 중 오류가 발생했습니다.',
        };
      }

      // Transform the response to match expected structure
      // Handle the actual server response format
      let transformedData: ZipCodeSearchResponse;

      if (apiResponse.data?.roadAddress && apiResponse.data?.zipCode) {
        // Server returns single address result
        transformedData = {
          meta: {
            total_count: apiResponse.data?.totalCount || 1,
          },
          documents: [
            {
              address: {
                address_name: apiResponse.data.roadAddress,
                region_1depth_name: '',
                region_2depth_name: '',
                region_3depth_name: '',
                region_3depth_h_name: '',
                h_code: '',
                b_code: '',
                mountain_yn: '',
                main_address_no: '',
                sub_address_no: '',
                x: '',
                y: '',
              },
              road_address: {
                address_name: apiResponse.data.roadAddress,
                region_1depth_name: '',
                region_2depth_name: '',
                region_3depth_name: '',
                road_name: '',
                underground_yn: '',
                main_building_no: '',
                sub_building_no: '',
                building_name: '',
                zone_no: apiResponse.data.zipCode,
                x: '',
                y: '',
              },
            },
          ],
        };
      } else {
        // Fallback to original format
        transformedData = {
          meta: {
            total_count:
              apiResponse.data?.totalCount ||
              apiResponse.data?.total_count ||
              0,
          },
          documents: (
            apiResponse.data?.results ||
            apiResponse.data?.documents ||
            []
          ).map((doc: FlexibleAddressResult) => ({
            address: {
              address_name:
                doc.address?.address_name || doc.address?.addressName || '',
              region_1depth_name:
                doc.address?.region_1depth_name ||
                doc.address?.region1depthName ||
                '',
              region_2depth_name:
                doc.address?.region_2depth_name ||
                doc.address?.region2depthName ||
                '',
              region_3depth_name:
                doc.address?.region_3depth_name ||
                doc.address?.region3depthName ||
                '',
              region_3depth_h_name:
                doc.address?.region_3depth_h_name ||
                doc.address?.region3depthHName ||
                '',
              h_code: doc.address?.h_code || doc.address?.hCode || '',
              b_code: doc.address?.b_code || doc.address?.bCode || '',
              mountain_yn:
                doc.address?.mountain_yn || doc.address?.mountainYn || '',
              main_address_no:
                doc.address?.main_address_no ||
                doc.address?.mainAddressNo ||
                '',
              sub_address_no:
                doc.address?.sub_address_no || doc.address?.subAddressNo || '',
              x: doc.address?.x || '',
              y: doc.address?.y || '',
            },
            road_address: {
              address_name:
                doc.road_address?.address_name ||
                doc.road_address?.addressName ||
                doc.roadAddress?.address_name ||
                doc.roadAddress?.addressName ||
                '',
              region_1depth_name:
                doc.road_address?.region_1depth_name ||
                doc.road_address?.region1depthName ||
                doc.roadAddress?.region_1depth_name ||
                doc.roadAddress?.region1depthName ||
                '',
              region_2depth_name:
                doc.road_address?.region_2depth_name ||
                doc.road_address?.region2depthName ||
                doc.roadAddress?.region_2depth_name ||
                doc.roadAddress?.region2depthName ||
                '',
              region_3depth_name:
                doc.road_address?.region_3depth_name ||
                doc.road_address?.region3depthName ||
                doc.roadAddress?.region_3depth_name ||
                doc.roadAddress?.region3depthName ||
                '',
              road_name:
                doc.road_address?.road_name ||
                doc.road_address?.roadName ||
                doc.roadAddress?.road_name ||
                doc.roadAddress?.roadName ||
                '',
              underground_yn:
                doc.road_address?.underground_yn ||
                doc.road_address?.undergroundYn ||
                doc.roadAddress?.underground_yn ||
                doc.roadAddress?.undergroundYn ||
                '',
              main_building_no:
                doc.road_address?.main_building_no ||
                doc.road_address?.mainBuildingNo ||
                doc.roadAddress?.main_building_no ||
                doc.roadAddress?.mainBuildingNo ||
                '',
              sub_building_no:
                doc.road_address?.sub_building_no ||
                doc.road_address?.subBuildingNo ||
                doc.roadAddress?.sub_building_no ||
                doc.roadAddress?.subBuildingNo ||
                '',
              building_name:
                doc.road_address?.building_name ||
                doc.road_address?.buildingName ||
                doc.roadAddress?.building_name ||
                doc.roadAddress?.buildingName ||
                '',
              zone_no:
                doc.road_address?.zone_no ||
                doc.road_address?.zoneNo ||
                doc.roadAddress?.zone_no ||
                doc.roadAddress?.zoneNo ||
                doc.zipCode ||
                doc.zip_code ||
                doc.postalCode ||
                doc.zone_no ||
                doc.zoneNo ||
                '',
              x: doc.road_address?.x || doc.roadAddress?.x || '',
              y: doc.road_address?.y || doc.roadAddress?.y || '',
            },
          })),
        };
      }

      return {
        data: transformedData,
      };
    } catch (error) {
      console.error('Zip code search error:', error);
      return {
        error: '우편번호 검색 중 네트워크 오류가 발생했습니다.',
      };
    }
  }
}
