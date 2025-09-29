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

      // Log business approval status specifically
      if (response.data?.data) {
        const memberData = response.data.data;
        console.log('🏢 Business Registration Status Check:');
        console.log('  - Member ID:', memberData.memberId);
        console.log('  - Role:', memberData.role);
        console.log('  - Store ID:', memberData.storeId);
        console.log(
          '  - Business Approval Status:',
          memberData.businessApprovalStatus
        );

        if (memberData.businessApprovalStatus === 'PENDING') {
          console.log(' Business registration is PENDING approval');
        } else if (memberData.businessApprovalStatus === 'APPROVED') {
          console.log(' Business registration is APPROVED');
        } else if (memberData.businessApprovalStatus === 'REJECTED') {
          console.log(' Business registration was REJECTED');
        } else {
          console.log('ℹ No business registration status found');
        }
      }

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
