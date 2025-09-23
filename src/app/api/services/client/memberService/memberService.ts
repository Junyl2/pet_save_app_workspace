import { apiClient, ApiResponse } from '../../../apiClient';
import {
  MemberApiResponse,
  MemberUpdateRequest,
  MemberUpdateResponse,
} from '@/app/api/types/member/member';

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

  /**
   * Get member information by ID
   * Endpoint: GET /api/pet-save/members/{memberId}
   */
  static async getMemberById(
    memberId: string
  ): Promise<ApiResponse<MemberApiResponse>> {
    try {
      console.log('Getting member information by ID:', memberId);
      const response = await apiClient.get<MemberApiResponse>(
        `/members/${memberId}`
      );

      if (response.error) {
        console.error('Get member by ID failed:', response.error);
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

  /**
   * Update member information by ID
   * Endpoint: PUT /api/pet-save/members/{memberId}
   */
  static async updateMemberById(
    memberId: string,
    updateData: MemberUpdateRequest
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating member information for ID:', memberId, updateData);
      const response = await apiClient.put<MemberUpdateResponse>(
        `/members/${memberId}`,
        updateData
      );

      if (response.error) {
        console.error('Update member info failed:', response.error);
        return response;
      }

      console.log('Member info updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Member service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update member info',
      };
    }
  }

  /**
   * Update current member information (fallback method)
   * Endpoint: PUT /api/pet-save/members/me
   */
  static async updateMyInfo(
    updateData: MemberUpdateRequest
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating current member information:', updateData);
      const response = await apiClient.put<MemberUpdateResponse>(
        '/members/me',
        updateData
      );

      if (response.error) {
        console.error('Update member info failed:', response.error);
        return response;
      }

      console.log('Member info updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Member service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update member info',
      };
    }
  }
}
