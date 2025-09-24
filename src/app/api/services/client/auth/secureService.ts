import { apiClient, ApiResponse } from '../../../apiClient';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../../../types/auth/ChangePassword';

/**
 * Secure service for handling secure operations like password changes
 */
export class SecureService {
  /**
   * Change user password
   * Endpoint: POST /api/pet-save/auth/secure/change-password
   */
  static async changePassword(
    changePasswordData: ChangePasswordRequest
  ): Promise<ApiResponse<ChangePasswordResponse>> {
    try {
      console.log('Changing password...');
      const response = await apiClient.post<ChangePasswordResponse>(
        '/auth/secure/change-password',
        changePasswordData
      );

      if (response.error) {
        console.error('Change password failed:', response.error);
        return response;
      }

      console.log('Password changed successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Change password service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }
}
