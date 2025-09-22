import { apiClient, ApiResponse } from '../../../apiClient';
import { MemberApiResponse } from '@/app/api/types/member/member';

/**
 * Member service for handling member-related operations
 */
export class MemberService {
  /**
   * Get current member information
   * Endpoint: GET /api/pet-save/members/me
   */
  static async getMyInfo(): Promise<ApiResponse<MemberApiResponse>> {
    try {
      console.log('Getting member information...');
      const response = await apiClient.get<MemberApiResponse>('/members/me');

      if (response.error) {
        console.error('Get member info failed:', response.error);
        return response;
      }

      console.log('Member info retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Member service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get member info',
      };
    }
  }
}
