import { apiClient, ApiResponse } from '../../../../apiClient';
import { StoreApiResponse } from '../../../../types/member/store/store';
import {
  StoreInquiriesResponse,
  StoreInquiriesParams,
} from '../../../../types/member/store/storeInquiry';

/**
 * Member Store service for handling member store-related operations
 */
export class MemberStoreService {
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
      console.error('Member store service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get member store',
      };
    }
  }

  /**
   * Get current member's store inquiries
   * Endpoint: GET /api/pet-save/members/me/store/inquiries
   */
  static async getMyStoreInquiries(
    params?: StoreInquiriesParams
  ): Promise<ApiResponse<StoreInquiriesResponse>> {
    try {
      console.log(
        '[MemberStoreService] Getting my store inquiries with params:',
        params
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.dateStart) queryParams.append('dateStart', params.dateStart);
      if (params?.dateEnd) queryParams.append('dateEnd', params.dateEnd);
      if (params?.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params?.size !== undefined)
        queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const queryString = queryParams.toString();
      const url = `/members/me/store/inquiries${
        queryString ? `?${queryString}` : ''
      }`;

      console.log('🌐 API Request URL:', url);
      console.log(
        '📋 Query parameters:',
        Object.fromEntries(queryParams.entries())
      );

      const response = await apiClient.get<StoreInquiriesResponse>(url);

      if (response.error) {
        console.error(
          '[MemberStoreService] Failed to get my store inquiries:',
          response.error
        );
      } else {
        console.log(
          '[MemberStoreService] My store inquiries retrieved successfully:',
          {
            totalElements: response.data?.data?.pageInfo?.totalElements || 0,
            currentPage: response.data?.data?.pageInfo?.currentPage || 0,
            totalPages: response.data?.data?.pageInfo?.totalPages || 0,
            inquiriesCount: response.data?.data?.content?.length || 0,
          }
        );
      }

      return response;
    } catch (error) {
      console.error(
        '[MemberStoreService] Error getting my store inquiries:',
        error
      );
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get my store inquiries',
      };
    }
  }
}
