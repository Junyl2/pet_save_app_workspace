import { apiClient, ApiResponse } from '../../../apiClient';
import {
  NearbyStoresRequest,
  NearbyStoresApiResponse,
} from '../../../types/stores/nearby';
import {
  StoreApiResponse,
  StoreSearchRequest,
  StoreSearchApiResponse,
} from '../../../types/member/store/store';

/**
 * Location interface for GPS coordinates
 */
export interface LocationCoordinates {
  lat: number;
  long: number;
}

/**
 * Update store information request interface
 */
export interface UpdateStoreRequest {
  businessLogoFileId?: string;
  businessName: string;
  roadAddress: string;
  detailedAddress?: string;
  zipCode: string;
  businessPhoneNumber: string;
  allowPhoneInquiries: boolean;
  businessOpeningTime: string;
  businessClosingTime: string;
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
      timeout: 15000,
      maximumAge: 300000,
    }
  ): Promise<{
    data: LocationCoordinates | null;
    error: LocationError | null;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ data: null, error: 'POSITION_UNAVAILABLE' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
          };
          resolve({ data: coordinates, error: null });
        },
        (error) => {
          let locationError: LocationError;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              locationError = 'PERMISSION_DENIED';
              break;
            case error.POSITION_UNAVAILABLE:
              locationError = 'POSITION_UNAVAILABLE';
              break;
            case error.TIMEOUT:
              locationError = 'TIMEOUT';
              break;
            default:
              locationError = 'UNKNOWN_ERROR';
              break;
          }
          resolve({ data: null, error: locationError });
        },
        options
      );
    });
  }

  /**
   * Search nearby stores based on user location.
   * Reads lat/long from localStorage if not provided.
   * Endpoint: GET /api/pet-save/stores/nearby
   */
  static async searchNearbyStores(
    params: NearbyStoresRequest
  ): Promise<ApiResponse<NearbyStoresApiResponse>> {
    try {
      // Auto-read saved coordinates if missing
      let lat = params.lat;
      let long = params.long;

      if (lat == null || long == null) {
        const savedLat = localStorage.getItem('selectedLocationLat');
        const savedLong = localStorage.getItem('selectedLocationLong');
        if (savedLat && savedLong) {
          lat = parseFloat(savedLat);
          long = parseFloat(savedLong);
        }
      }

      if (lat == null || long == null) {
        return {
          data: null,
          error:
            'No location coordinates available in request or localStorage.',
        };
      }

      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.baseLocation)
        queryParams.append('baseLocation', params.baseLocation);
      queryParams.append('lat', lat.toString());
      queryParams.append('long', long.toString());
      if (params.radius) queryParams.append('radius', params.radius.toString());
      if (params.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params.size !== undefined)
        queryParams.append('size', params.size.toString());

      const response = await apiClient.get<NearbyStoresApiResponse>(
        `/stores/nearby?${queryParams.toString()}`
      );

      if (response.error) return response;

      return response;
    } catch (error) {
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
   */
  static async getStoreSummary(
    storeId: string,
    lat?: number,
    long?: number
  ): Promise<ApiResponse<StoreApiResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (lat !== undefined) queryParams.append('lat', lat.toString());
      if (long !== undefined) queryParams.append('long', long.toString());
      const queryString = queryParams.toString();
      const url = `/stores/${storeId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<StoreApiResponse>(url);
      return response;
    } catch (error) {
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
   */
  static async searchNearbyStoresWithCurrentLocation(
    params: Omit<NearbyStoresRequest, 'lat' | 'long'> = {}
  ): Promise<{ data: NearbyStoresApiResponse | null; error: string | null }> {
    try {
      const locationResult = await this.getCurrentLocation();
      if (locationResult.error)
        return {
          data: null,
          error: this.getLocationErrorMessage(locationResult.error),
        };

      if (!locationResult.data)
        return { data: null, error: 'Failed to get current location' };

      const searchParams: NearbyStoresRequest = {
        ...params,
        lat: locationResult.data.lat,
        long: locationResult.data.long,
      };

      const response = await this.searchNearbyStores(searchParams);
      if (response.error) return { data: null, error: response.error };
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to search nearby stores',
      };
    }
  }

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

  static async updateStore(
    storeId: string,
    updateData: UpdateStoreRequest
  ): Promise<ApiResponse<object>> {
    try {
      const response = await apiClient.put<object>(
        `/stores/${storeId}`,
        updateData
      );
      return response;
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update store information',
      };
    }
  }

  static async searchStores(
    params: StoreSearchRequest
  ): Promise<ApiResponse<StoreSearchApiResponse>> {
    try {
      const lat = params.lat;
      const long = params.long;

      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.baseLocation)
        queryParams.append('baseLocation', params.baseLocation);
      if (lat !== undefined) queryParams.append('lat', lat.toString());
      if (long !== undefined) queryParams.append('long', long.toString());
      if (params.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params.size !== undefined)
        queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.direction) queryParams.append('direction', params.direction);

      const response = await apiClient.get<StoreSearchApiResponse>(
        `/stores?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to search stores',
      };
    }
  }

  static async testNearbyStoresAPI(): Promise<
    ApiResponse<NearbyStoresApiResponse>
  > {
    return this.searchNearbyStores({
      lat: 37.5665,
      long: 126.978,
      radius: 10,
      page: 0,
      size: 10,
    });
  }
}
