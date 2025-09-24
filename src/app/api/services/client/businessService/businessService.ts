import { apiClient } from '@/app/api/apiClient';
import { BusinessRegistrationResponse } from '@/app/api/types/business/business';

export class BusinessService {
  /**
   * Get current user's business registration information
   */
  static async getMyBusinessRegistration(): Promise<{
    data?: BusinessRegistrationResponse;
    error?: string;
  }> {
    try {
      console.log('🔄 Fetching business registration info...');

      const response = await apiClient.get<BusinessRegistrationResponse>(
        '/business-registrations/me'
      );

      console.log('✅ Business registration response:', response.data);
      console.log('📊 Response data success:', response.data?.success);
      console.log('📊 Response data status:', response.data?.data?.status);
      return { data: response.data || undefined };
    } catch (error: any) {
      console.error('❌ Error fetching business registration:', error);

      if (error.response?.status === 404) {
        return { error: 'Business registration not found' };
      }

      return {
        error:
          error.response?.data?.resultMsg ||
          error.message ||
          'Failed to fetch business registration',
      };
    }
  }
}
