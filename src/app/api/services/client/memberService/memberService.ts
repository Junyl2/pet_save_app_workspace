import { apiClient, ApiResponse } from '../../../apiClient';
import {
  MemberApiResponse,
  MemberUpdateRequest,
  MemberUpdateResponse,
} from '@/app/api/types/member/member';
import { MemberUpdateRequest as NewMemberUpdateRequest } from '@/app/api/types/auth/MemberUpdate';

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
      console.log('Updating member information for ID:', memberId);
      console.log(
        'Update data being sent:',
        JSON.stringify(updateData, null, 2)
      );

      const response = await apiClient.put<MemberUpdateResponse>(
        `/members/${memberId}`,
        updateData
      );

      if (response.error) {
        console.error('Update member info failed:', response.error);
        console.error('Response data:', response.data);
        return response;
      }

      console.log('Member info updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Member service error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
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
  static async updateMyInfoLegacy(
    updateData: MemberUpdateRequest
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating current member information (fallback method)');
      console.log(
        'Update data being sent:',
        JSON.stringify(updateData, null, 2)
      );

      const response = await apiClient.put<MemberUpdateResponse>(
        '/members/me',
        updateData
      );

      if (response.error) {
        console.error('Update member info failed (fallback):', response.error);
        console.error('Response data:', response.data);
        return response;
      }

      console.log(
        'Member info updated successfully (fallback):',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Member service error (fallback):', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
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
   * JSON update (uses fileId or encryptedId you already uploaded)
   * Endpoint: PUT /api/pet-save/members/{memberId}
   */
  static async updateMyInfo(
    memberId: string,
    payload: NewMemberUpdateRequest
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating current member information (JSON):', payload);
      const response = await apiClient.put<MemberUpdateResponse>(
        `/members/${memberId}`,
        payload
      );

      if (response.error) {
        console.error('Update member info failed (JSON):', response.error);
        console.error('Response data:', response.data);
        return response;
      }

      console.log('Member info updated successfully (JSON):', response.data);
      return response;
    } catch (error) {
      console.error('Member service error (JSON):', error);
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
   * Update only profile image URL (minimal update)
   * Endpoint: PUT /api/pet-save/members/me
   */
  static async updateMyProfileImageUrl(
    memberId: string,
    profileImageUrl: string
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating profile image URL only:', profileImageUrl);

      const payload = { profileImageUrl };
      const response = await apiClient.put<MemberUpdateResponse>(
        `/members/${memberId}`,
        payload
      );

      if (response.error) {
        console.error('Update profile image URL failed:', response.error);
        console.error('Response data:', response.data);
        return response;
      }

      console.log('Profile image URL updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Member service error (URL update):', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update profile image URL',
      };
    }
  }

  /**
   * Try PATCH method for profile image update
   * Endpoint: PATCH /api/pet-save/members/{memberId}
   */
  static async updateMyProfileImagePatch(
    memberId: string,
    profileImageUrl: string
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating profile image URL via PATCH:', profileImageUrl);

      const payload = { profileImageUrl };
      const response = await apiClient.patch<MemberUpdateResponse>(
        `/members/${memberId}`,
        payload
      );

      if (response.error) {
        console.error(
          'Update profile image URL failed (PATCH):',
          response.error
        );
        console.error('Response data:', response.data);
        return response;
      }

      console.log(
        'Profile image URL updated successfully (PATCH):',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Member service error (PATCH):', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update profile image URL',
      };
    }
  }

  /**
   * Multipart update (direct file upload in the profile update)
   * Endpoint: PUT /api/pet-save/members/{memberId}
   */
  static async updateMyProfileImageMultipart(
    memberId: string,
    file: File
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      console.log('Updating profile image via multipart:', file.name);

      const form = new FormData();
      form.append('profileImage', file);
      // If backend also accepts other fields, you can add them here, e.g.:
      // form.append('name', name);

      const response = await apiClient.put<MemberUpdateResponse>(
        `/members/${memberId}`,
        form
      );

      if (response.error) {
        console.error(
          'Update profile image failed (multipart):',
          response.error
        );
        console.error('Response data:', response.data);
        return response;
      }

      console.log(
        'Profile image updated successfully (multipart):',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Member service error (multipart):', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update profile image',
      };
    }
  }
}
