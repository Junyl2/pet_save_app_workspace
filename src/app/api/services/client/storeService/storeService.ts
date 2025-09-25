import { apiClient, ApiResponse } from '../../../apiClient';
import {
  NearbyStoresRequest,
  NearbyStoresApiResponse,
} from '../../../types/stores/nearby';
import { StoreInfo, StoreApiResponse } from '../../../types/member/store/store';

/**
 * Store service for handling store-related operations
 */
export class StoreService {
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
