import { apiClient } from '@/app/api/apiClient';
import {
  AddressSearchRequest,
  AddressSearchServiceResponse,
  ZipCodeSearchServiceResponse,
  ApiResponse,
  AddressSearchResponse,
  ZipCodeSearchResponse,
} from '@/app/api/types/address/addressSearch';

/**
 * Address Service for handling address search operations
 * Uses Kakao API for address search functionality
 */
export class AddressService {
  private static readonly BASE_URL = '/address';

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

      const response = await apiClient.get<any>(
        `${this.BASE_URL}/search?${params.toString()}`
      );

      console.log('Address search API response:', response);

      if (response.error) {
        return {
          error: response.error,
        };
      }

      // The apiClient wraps the response, so response.data is the actual API response
      const apiResponse = response.data as any;

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
          apiResponse.data.results.map(async (result: any) => {
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
                console.warn('Failed to get zip code for coordinates:', error);
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
          })
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
          documents:
            apiResponse.data?.results || apiResponse.data?.documents || [],
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

      const response = await apiClient.post<any>(
        `${this.BASE_URL}/search`,
        requestBody
      );

      console.log('Address search POST API response:', response);

      if (response.error) {
        return {
          error: response.error,
        };
      }

      // The apiClient wraps the response, so response.data is the actual API response
      const apiResponse = response.data as any;

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
          apiResponse.data.results.map(async (result: any) => {
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
                console.warn('Failed to get zip code for coordinates:', error);
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
          })
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
          documents:
            apiResponse.data?.results || apiResponse.data?.documents || [],
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
  static formatAddress(addressResult: any): string {
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
  static extractPostalCode(addressResult: any): string {
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
  static extractCoordinates(addressResult: any): { x: string; y: string } {
    if (!addressResult) return { x: '', y: '' };

    // Handle the actual API response structure
    // Check for coordinates in various possible field names
    return {
      x: addressResult.x || addressResult.longitude || addressResult.lng || '',
      y: addressResult.y || addressResult.latitude || addressResult.lat || '',
    };
  }

  /**
   * Search zip code by coordinates using GET method
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

      const params = new URLSearchParams({
        x: x.toString(),
        y: y.toString(),
      });

      const response = await apiClient.get<any>(
        `${this.BASE_URL}/search/zip-code?${params.toString()}`
      );

      console.log('Zip code search API response:', response);

      if (response.error) {
        return {
          error: response.error,
        };
      }

      // The apiClient wraps the response, so response.data is the actual API response
      const apiResponse = response.data as any;

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
          documents:
            apiResponse.data?.results || apiResponse.data?.documents || [],
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
