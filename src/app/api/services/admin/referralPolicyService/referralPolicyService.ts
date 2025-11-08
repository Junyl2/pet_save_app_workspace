import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  BaseResponse,
  CreateReferralPolicyRequest,
  CreateReferralPolicyResponse,
  ReferralPolicy,
  UpdateReferralPolicyRequest,
  ReferralPolicyListResponse,
} from './referralPolicy';

/**
 * Referral Policy Service
 * Handles creation, retrieval, update, and listing of referral policies
 */
export class ReferralPolicyService {
  private static readonly BASE_URL = '/referral/policies';

  /** POST /api/pet-save/referral/policies */
  static async createPolicy(
    payload: CreateReferralPolicyRequest
  ): Promise<ApiResponse<CreateReferralPolicyResponse>> {
    try {
      return await apiClient.post<CreateReferralPolicyResponse>(
        this.BASE_URL,
        payload
      );
    } catch (error) {
      console.error('[ReferralPolicyService] Failed to create policy:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  /** GET /api/pet-save/referral/policies */
  static async getAllPolicies(): Promise<
    ApiResponse<ReferralPolicyListResponse>
  > {
    try {
      return await apiClient.get<ReferralPolicyListResponse>(this.BASE_URL);
    } catch (error) {
      console.error('[ReferralPolicyService] Failed to fetch policies:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  /** GET /api/pet-save/referral/policies/{policyId} */
  static async getPolicyById(
    policyId: string
  ): Promise<ApiResponse<BaseResponse & { data: ReferralPolicy | null }>> {
    try {
      return await apiClient.get<
        BaseResponse & { data: ReferralPolicy | null }
      >(`${this.BASE_URL}/${policyId}`);
    } catch (error) {
      console.error(
        '[ReferralPolicyService] Failed to fetch policy by ID:',
        error
      );
      return { data: null, error: (error as Error).message };
    }
  }

  /** PUT /api/pet-save/referral/policies/{policyId} */
  static async updatePolicy(
    policyId: string,
    payload: UpdateReferralPolicyRequest
  ): Promise<ApiResponse<BaseResponse & { data: ReferralPolicy | null }>> {
    try {
      return await apiClient.put<
        BaseResponse & { data: ReferralPolicy | null }
      >(`${this.BASE_URL}/${policyId}`, payload);
    } catch (error) {
      console.error('[ReferralPolicyService] Failed to update policy:', error);
      return { data: null, error: (error as Error).message };
    }
  }

  /** GET /api/pet-save/referral/policies/active */
  static async getActivePolicy(): Promise<
    ApiResponse<BaseResponse & { data: ReferralPolicy | null }>
  > {
    try {
      return await apiClient.get<
        BaseResponse & { data: ReferralPolicy | null }
      >(`${this.BASE_URL}/active`);
    } catch (error) {
      console.error(
        '[ReferralPolicyService] Failed to fetch active policy:',
        error
      );
      return { data: null, error: (error as Error).message };
    }
  }
}
