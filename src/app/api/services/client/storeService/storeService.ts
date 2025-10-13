import { apiClient, ApiResponse } from '../../../apiClient';
import {
  NearbyStoresRequest,
  NearbyStoresApiResponse,
} from '../../../types/stores/nearby';
import {
  /* StoreInfo, */ StoreApiResponse,
} from '../../../types/member/store/store';

/**
 * Location interface for GPS coordinates
 */
export interface LocationCoordinates {
  lat: number;
  long: number;
}

/**
 * Location error types
 */
export type LocationError =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

/**
 * Store service for handling store-related operations
 */
export class StoreService {
  /**
   * Get current GPS location of the user
   * @param options - Geolocation options
   * @returns Promise with location coordinates or error
   */
  static async getCurrentLocation(
    options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout to 15 seconds
      maximumAge: 300000, // 5 minutes
    }
  ): Promise<{
    data: LocationCoordinates | null;
    error: LocationError | null;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('❌ Geolocation is not supported by this browser');
        resolve({ data: null, error: 'POSITION_UNAVAILABLE' });
        return;
      }

      console.log('📍 Requesting current location with options:', options);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };

          console.log('✅ Current location obtained:', coordinates);
          console.log('📍 Accuracy:', position.coords.accuracy, 'meters');
          resolve({ data: coordinates, error: null });
        },
        (error) => {
          let locationError: LocationError;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              locationError = 'PERMISSION_DENIED';
              console.error('❌ Location access denied by user');
              break;
            case error.POSITION_UNAVAILABLE:
              locationError = 'POSITION_UNAVAILABLE';
              console.error('❌ Location information is unavailable');
              break;
            case error.TIMEOUT:
              locationError = 'TIMEOUT';
              console.error('❌ Location request timed out');
              break;
            default:
              locationError = 'UNKNOWN_ERROR';
              console.error('❌ Unknown location error:', error);
              break;
          }

          console.error('📍 Geolocation error details:', {
            code: error.code,
            message: error.message,
            type: locationError,
          });

          resolve({ data: null, error: locationError });
        },
        options
      );
    });
  }

  /**
   * Search nearby stores based on user location
   * Endpoint: GET /api/pet-save/stores/nearby
   * @param params - Search parameters including location and filters
   */
  static async searchNearbyStores(
    params: NearbyStoresRequest
  ): Promise<ApiResponse<NearbyStoresApiResponse>> {
    try {
      console.log('🔍 Searching nearby stores:', {
        lat: params.lat,
        long: params.long,
        radius: params.radius || 10,
        keyword: params.keyword,
        baseLocation: params.baseLocation,
        page: params.page || 0,
        size: params.size || 10,
      });

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.baseLocation)
        queryParams.append('baseLocation', params.baseLocation);
      queryParams.append('lat', params.lat.toString());
      queryParams.append('long', params.long.toString());
      if (params.radius) queryParams.append('radius', params.radius.toString());
      if (params.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params.size !== undefined)
        queryParams.append('size', params.size.toString());

      const response = await apiClient.get<NearbyStoresApiResponse>(
        `/stores/nearby?${queryParams.toString()}`
      );

      if (response.error) {
        console.error('❌ Search nearby stores failed:', response.error);
        return response;
      }

      console.log('✅ Nearby stores search successful:', {
        totalStores: response.data?.data?.totalElements || 0,
        currentPage: response.data?.data?.number || 0,
        totalPages: response.data?.data?.totalPages || 0,
        storesFound: response.data?.data?.content?.length || 0,
      });

      return response;
    } catch (error) {
      console.error('💥 Nearby stores search service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to search nearby stores',
      };
    }
  }

  /**
   * Get store summary by ID
   * Endpoint: GET /api/pet-save/stores/{storeId}
   * @param storeId - Store ID (UUID)
   * @param lat - User latitude for distance calculation (optional)
   * @param long - User longitude for distance calculation (optional)
   */
  static async getStoreSummary(
    storeId: string,
    lat?: number,
    long?: number
  ): Promise<ApiResponse<StoreApiResponse>> {
    try {
      console.log('🔍 Getting store summary:', {
        storeId,
        lat,
        long,
      });

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (lat !== undefined) queryParams.append('lat', lat.toString());
      if (long !== undefined) queryParams.append('long', long.toString());

      const queryString = queryParams.toString();
      const url = `/stores/${storeId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<StoreApiResponse>(url);

      if (response.error) {
        console.error('❌ Get store summary failed:', response.error);
        return response;
      }

      console.log('✅ Store summary retrieved successfully:', {
        storeId: response.data?.data?.storeId,
        storeName: response.data?.data?.storeName,
        businessName: response.data?.data?.businessName,
      });

      return response;
    } catch (error) {
      console.error('💥 Get store summary service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get store summary',
      };
    }
  }

  /**
   * Search nearby stores using current GPS location
   * @param params - Optional search parameters (excluding lat/long)
   * @returns Promise with nearby stores or error
   */
  static async searchNearbyStoresWithCurrentLocation(
    params: Omit<NearbyStoresRequest, 'lat' | 'long'> = {}
  ): Promise<{ data: NearbyStoresApiResponse | null; error: string | null }> {
    try {
      console.log('📍 Getting current location for nearby stores search...');

      const locationResult = await this.getCurrentLocation();

      if (locationResult.error) {
        const errorMessage = this.getLocationErrorMessage(locationResult.error);
        console.error('❌ Failed to get current location:', errorMessage);
        return { data: null, error: errorMessage };
      }

      if (!locationResult.data) {
        console.error('❌ No location data received');
        return { data: null, error: 'Failed to get current location' };
      }

      console.log('🔍 Searching nearby stores with current location...');

      const searchParams: NearbyStoresRequest = {
        ...params,
        lat: locationResult.data.lat,
        long: locationResult.data.long,
      };

      const response = await this.searchNearbyStores(searchParams);

      if (response.error) {
        return { data: null, error: response.error };
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error(
        '💥 Search nearby stores with current location error:',
        error
      );
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to search nearby stores',
      };
    }
  }

  /**
   * Get user-friendly error message for location errors
   * @param error - Location error type
   * @returns User-friendly error message
   */
  private static getLocationErrorMessage(error: LocationError): string {
    switch (error) {
      case 'PERMISSION_DENIED':
        return '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
      case 'POSITION_UNAVAILABLE':
        return '위치 정보를 가져올 수 없습니다. GPS가 활성화되어 있는지 확인해주세요.';
      case 'TIMEOUT':
        return '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
      case 'UNKNOWN_ERROR':
        return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
      default:
        return '위치 정보를 가져오는 중 오류가 발생했습니다.';
    }
  }

  /**
   * Test the nearby stores API with default Seoul coordinates
   * This is a helper method for testing the API
   */
  static async testNearbyStoresAPI(): Promise<
    ApiResponse<NearbyStoresApiResponse>
  > {
    console.log(
      '🧪 Testing nearby stores API with default Seoul coordinates...'
    );

    return this.searchNearbyStores({
      lat: 37.5665, // Seoul latitude
      long: 126.978, // Seoul longitude
      radius: 10, // 10km radius
      page: 0,
      size: 10,
    });
  }
}
