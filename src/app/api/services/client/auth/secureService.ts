import { apiClient, ApiResponse } from '../../../apiClient';
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../../../types/auth/ChangePassword';

/**
 * Request body for member withdrawal
 */
export interface WithdrawRequest {
  withdrawalReason: string;
  password: string;
}

/**
 * Generic response format for secure endpoints
 */
export interface SecureResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

/**
 * Secure service for sensitive account operations
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
      const response = await apiClient.post<ChangePasswordResponse>(
        '/auth/secure/change-password',
        changePasswordData
      );

      if (response.error) {
        console.error(
          '[SecureService] Change password failed:',
          response.error
        );
      }

      return response;
    } catch (error) {
      console.error('[SecureService] Change password error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }

  /**
   * Withdraw member account (회원 탈퇴)
   * Endpoint: DELETE /api/pet-save/auth/secure/withdraw
   */
  static async withdrawMember(
    payload: WithdrawRequest
  ): Promise<ApiResponse<SecureResponse>> {
    try {
      const response = await apiClient.raw.delete<SecureResponse>(
        '/auth/secure/withdraw',
        { data: payload }
      );

      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      console.error('[SecureService] Withdrawal service error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to withdraw member';
      return { data: null, error: message };
    }
  }
}
