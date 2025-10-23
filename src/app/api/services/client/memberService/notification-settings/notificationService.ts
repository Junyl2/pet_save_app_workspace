import { apiClient, ApiResponse } from '../../../../apiClient';
import {
  NotificationSettingsApiResponse,
  NotificationSettingsUpdateRequest,
  NotificationSettingsUpdateResponse,
} from '@/app/api/types/member/notification-settings/settings';

/**
 * Notification settings service for handling notification-related operations
 */
export class NotificationService {
  /**
   * Get current user's notification settings
   * Endpoint: GET /api/pet-save/members/me/settings
   */
  static async getMySettings(): Promise<
    ApiResponse<NotificationSettingsApiResponse>
  > {
    try {
      console.log('Getting notification settings...');
      const response = await apiClient.get<NotificationSettingsApiResponse>(
        '/members/me/settings'
      );

      if (response.error) {
        console.error('Get notification settings failed:', response.error);
        return response;
      }

      console.log(
        'Notification settings retrieved successfully:',
        response.data
      );
      return response;
    } catch (error) {
      console.error('Notification service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get notification settings',
      };
    }
  }

  /**
   * Update user's notification settings by member ID
   * Endpoint: PUT /api/pet-save/user-settings/member/{memberId}
   */
  static async updateSettings(
    memberId: string,
    settings: NotificationSettingsUpdateRequest
  ): Promise<ApiResponse<NotificationSettingsUpdateResponse>> {
    try {
      console.log('Updating notification settings for member:', memberId);
      const response = await apiClient.put<NotificationSettingsUpdateResponse>(
        `/user-settings/member/${memberId}`,
        settings
      );

      if (response.error) {
        console.error('Update notification settings failed:', response.error);
        return response;
      }

      console.log('Notification settings updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Notification service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update notification settings',
      };
    }
  }
}
