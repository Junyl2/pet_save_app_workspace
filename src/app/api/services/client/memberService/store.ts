import { apiClient, ApiResponse } from '../../../apiClient';
import {
  StoreApiResponse,
  StoreListApiResponse,
  StoreCreateRequest,
  StoreUpdateRequest,
} from '../../../types/member/store/store';

/**
 * Store service for handling store-related operations
 */
export class StoreService {
  /**
   * Get current member's store information
   * Endpoint: GET /api/pet-save/members/me/store
   */
  static async getMyStore(): Promise<ApiResponse<StoreApiResponse>> {
    try {
      console.log('Getting member store information...');
      const response = await apiClient.get<StoreApiResponse>(
        '/members/me/store'
      );

      if (response.error) {
        console.error('Get member store failed:', response.error);
        return response;
      }

      console.log('Member store retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Store service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get member store',
      };
    }
  }

  /**
   * Get store by ID
   * Endpoint: GET /api/pet-save/members/stores/{storeId}
   */
  static async getStoreById(
    storeId: string
  ): Promise<ApiResponse<StoreApiResponse>> {
    try {
      console.log('Getting store by ID:', storeId);
      const response = await apiClient.get<StoreApiResponse>(
        `/stores/${storeId}`
      );

      if (response.error) {
        console.error('Get store by ID failed:', response.error);
        return response;
      }

      console.log('Store retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Store service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get store',
      };
    }
  }

  /**
   * Get all stores
   * Endpoint: GET /api/pet-save/members/stores
   */
  static async getAllStores(): Promise<ApiResponse<StoreListApiResponse>> {
    try {
      console.log('Getting all stores...');
      const response = await apiClient.get<StoreListApiResponse>(
        '/members/stores'
      );

      if (response.error) {
        console.error('Get all stores failed:', response.error);
        return response;
      }

      console.log('All stores retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Store service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get stores',
      };
    }
  }

  /**
   * Create a new store
   * Endpoint: POST /api/pet-save/members/stores
   */
  static async createStore(
    storeData: StoreCreateRequest
  ): Promise<ApiResponse<StoreApiResponse>> {
    try {
      console.log('Creating store:', storeData);
      const response = await apiClient.post<StoreApiResponse>(
        '/members/stores',
        storeData
      );

      if (response.error) {
        console.error('Create store failed:', response.error);
        return response;
      }

      console.log('Store created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Store service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to create store',
      };
    }
  }

  /**
   * Update store
   * Endpoint: PUT /api/pet-save/members/stores/{storeId}
   */
  static async updateStore(
    storeId: string,
    storeData: StoreUpdateRequest
  ): Promise<ApiResponse<StoreApiResponse>> {
    try {
      console.log('Updating store:', storeId, storeData);
      const response = await apiClient.put<StoreApiResponse>(
        `/members/stores/${storeId}`,
        storeData
      );

      if (response.error) {
        console.error('Update store failed:', response.error);
        return response;
      }

      console.log('Store updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Store service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to update store',
      };
    }
  }

  /**
   * Delete store
   * Endpoint: DELETE /api/pet-save/members/stores/{storeId}
   */
  static async deleteStore(
    storeId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      console.log('Deleting store:', storeId);
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/members/stores/${storeId}`);

      if (response.error) {
        console.error('Delete store failed:', response.error);
        return response;
      }

      console.log('Store deleted successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Store service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to delete store',
      };
    }
  }
}
