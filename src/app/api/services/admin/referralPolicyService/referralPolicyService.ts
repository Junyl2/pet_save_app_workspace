import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  CreateReferralPolicyRequest,
  CreateReferralPolicyResponse,
} from './referralPolicy';

/**
 * Referral Policy Service
 * Handles creation and management of referral policies
 */
export class ReferralPolicyService {
  private static readonly BASE_URL = '/referral/policies';

  /**
   * Create a new referral policy (ADMIN only)
   * POST /api/pet-save/referral/policies
   */
  static async createPolicy(
    payload: CreateReferralPolicyRequest
  ): Promise<ApiResponse<CreateReferralPolicyResponse>> {
    try {
      const response = await apiClient.post<CreateReferralPolicyResponse>(
        `${this.BASE_URL}`,
        payload
      );
      return response;
    } catch (error) {
      console.error('[ReferralPolicyService] Failed to create policy:', error);
      return { data: null, error: (error as Error).message };
    }
  }
}
