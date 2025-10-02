import { apiClient } from '@/app/api/apiClient';
import { BusinessRegistrationResponse } from '@/app/api/types/business/business';
import { isAxiosError, type AxiosError } from 'axios';

function hasResultMsg(data: unknown): data is { resultMsg?: unknown } {
  return typeof data === 'object' && data !== null && 'resultMsg' in data;
}

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

      // Note: apiClient.get never throws; it returns { data, error }.
      // We still keep try/catch in case apiClient.get changes or a runtime error happens above.
      if (response.error) {
        console.error('❌ Error from API client:', response.error);
        return { error: response.error };
      }

      console.log('✅ Business registration response:', response.data);
      console.log('📊 Response data success:', response.data?.success);
      console.log('📊 Response data status:', response.data?.data?.status);

      return { data: response.data || undefined };
    } catch (err: unknown) {
      console.error('❌ Error fetching business registration:', err);

      if (isAxiosError(err)) {
        const axErr = err as AxiosError<unknown>;
        if (axErr.response?.status === 404) {
          return { error: 'Business registration not found' };
        }

        let msg: string | undefined;
        const payload = axErr.response?.data;

        if (hasResultMsg(payload) && typeof payload.resultMsg === 'string') {
          msg = payload.resultMsg;
        } else if (typeof axErr.message === 'string') {
          msg = axErr.message;
        }

        return { error: msg || 'Failed to fetch business registration' };
      }

      if (err instanceof Error) {
        return { error: err.message };
      }

      return { error: 'Failed to fetch business registration' };
    }
  }
}
