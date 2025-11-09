import { apiClient, ApiResponse } from '@/app/api/apiClient';
import { AxiosError } from 'axios';
import {
  RemoveMemberPermissionRequest,
  RemoveMemberPermissionResponse,
} from './memberManagement';

/**
 * Member Management Service
 * Handles member-related operations for admin
 */
export class MemberManagementService {
  private static readonly BASE_URL = '/members';

  /**
   * Remove member permissions (non-admin)
   * DELETE /api/pet-save/members/{memberId}/permissions-no-admin
   * FOR TESTING PURPOSES ONLY
   */
  static async removeMemberPermissionNoAdmin(
    memberId: string,
    request: RemoveMemberPermissionRequest
  ): Promise<ApiResponse<RemoveMemberPermissionResponse>> {
    const url = `${this.BASE_URL}/${encodeURIComponent(
      memberId
    )}/permissions-no-admin`;

    try {
      console.log('[MemberManagementService] Removing permission:', {
        url,
        memberId,
        permission: request.permission,
      });

      const response =
        await apiClient.raw.delete<RemoveMemberPermissionResponse>(url, {
          data: request,
        });

      console.log(
        '[MemberManagementService] Permission removed successfully:',
        response.data
      );

      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = error.response.data as
          | {
              resultMsg?: string;
              message?: string;
              error?: string;
            }
          | undefined;

        const errorMessage =
          responseData?.resultMsg ||
          responseData?.message ||
          responseData?.error ||
          statusText ||
          error.message;

        console.error(
          '[MemberManagementService] Failed to remove member permission:',
          {
            status,
            statusText,
            url: error.config?.url,
            method: error.config?.method,
            responseData,
            errorMessage,
          }
        );

        return {
          data: null,
          error: `${status}: ${errorMessage}`,
        };
      }

      console.error(
        '[MemberManagementService] Failed to remove member permission:',
        error
      );
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to remove member permission';
      return { data: null, error: message };
    }
  }
}
