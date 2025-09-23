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
      const transformedData: AddressSearchResponse = {
        meta: {
          total_count: apiResponse.data.totalCount || 0,
          pageable_count: apiResponse.data.countPerPage || 10,
          is_end:
            apiResponse.data.currentPage * apiResponse.data.countPerPage >=
            (apiResponse.data.totalCount || 0),
        },
        documents: apiResponse.data.results || [],
      };

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
      const transformedData: AddressSearchResponse = {
        meta: {
          total_count: apiResponse.data.totalCount || 0,
          pageable_count: apiResponse.data.countPerPage || 10,
          is_end:
            apiResponse.data.currentPage * apiResponse.data.countPerPage >=
            (apiResponse.data.totalCount || 0),
        },
        documents: apiResponse.data.results || [],
      };

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

    // Check address for zone_no (fallback)
    if (addressResult.address && addressResult.address.zone_no) {
      return addressResult.address.zone_no;
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
      const transformedData: ZipCodeSearchResponse = {
        meta: {
          total_count: apiResponse.data.totalCount || 0,
        },
        documents: apiResponse.data.results || [],
      };

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
