import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ReferralPauseRequest,
  ReferralSearchParams,
  ReferralSearchResponse,
  ReferralResponse,
  StorePointPaymentSearchParams,
  StorePointPaymentSearchResponse,
} from './referralManagement';

/**
 * Admin Referral Management Service
 * Handles referral pause/reactivate/search operations
 */
export class ReferralManagementService {
  private static readonly BASE_URL = '/referrals';

  /**
   * Pause store referral points
   * POST /api/pet-save/referrals/stores/{storeId}/pause
   */
  static async pauseStoreReferralPoints(
    storeId: string,
    request: ReferralPauseRequest
  ): Promise<ApiResponse<ReferralResponse>> {
    const url = `${this.BASE_URL}/stores/${storeId}/pause`;
    return apiClient.post<ReferralResponse>(url, request);
  }

  /**
   * Reactivate store referral points
   * POST /api/pet-save/referrals/stores/{storeId}/reactivate
   */
  static async reactivateStoreReferralPoints(
    storeId: string
  ): Promise<ApiResponse<ReferralResponse>> {
    const url = `${this.BASE_URL}/stores/${storeId}/reactivate`;
    return apiClient.post<ReferralResponse>(url);
  }

  /**
   * Search store referral statuses (admin only)
   * GET /api/pet-save/referrals/stores
   */
  static async searchStoreReferrals(
    params: ReferralSearchParams
  ): Promise<ApiResponse<ReferralSearchResponse>> {
    const query = new URLSearchParams();

    if (params.keyword) query.append('keyword', params.keyword);
    if (params.storeId) query.append('storeId', params.storeId);
    if (params.isPaused !== undefined)
      query.append('isPaused', String(params.isPaused));
    if (params.dateStart) query.append('dateStart', params.dateStart);
    if (params.dateEnd) query.append('dateEnd', params.dateEnd);
    if (params.minReferrals !== undefined)
      query.append('minReferrals', String(params.minReferrals));
    if (params.maxReferrals !== undefined)
      query.append('maxReferrals', String(params.maxReferrals));

    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 10));
    query.append('sortBy', params.sortBy ?? 'createdAt');
    query.append('direction', params.direction ?? 'desc');

    const url = `${this.BASE_URL}/stores?${query.toString()}`;
    return apiClient.get<ReferralSearchResponse>(url);
  }

  /**
   * Get referrals by store ID (store owner)
   * GET /api/pet-save/referrals/store/{storeId}
   */
  static async getReferralsByStore(
    storeId: string,
    params?: {
      page?: number;
      size?: number;
      sortBy?: 'createdAt';
      direction?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse<ReferralSearchResponse>> {
    const query = new URLSearchParams();
    query.append('page', String(params?.page ?? 0));
    query.append('size', String(params?.size ?? 10));
    query.append('sortBy', params?.sortBy ?? 'createdAt');
    query.append('direction', params?.direction ?? 'desc');

    const url = `${this.BASE_URL}/store/${storeId}?${query.toString()}`;
    return apiClient.get<ReferralSearchResponse>(url);
  }

  /**
   * Search store point payment statuses (admin)
   * GET /api/pet-save/referrals/point-payments/stores
   */
  static async searchStorePointPayments(
    params?: StorePointPaymentSearchParams
  ): Promise<ApiResponse<StorePointPaymentSearchResponse>> {
    const query = new URLSearchParams();

    if (params?.keyword) query.append('keyword', params.keyword);
    if (params?.storeId) query.append('storeId', params.storeId);
    if (params?.isPaused !== undefined)
      query.append('isPaused', String(params.isPaused));
    if (params?.dateStart) query.append('dateStart', params.dateStart);
    if (params?.dateEnd) query.append('dateEnd', params.dateEnd);

    query.append('page', String(params?.page ?? 0));
    query.append('size', String(params?.size ?? 10));
    query.append('sortBy', params?.sortBy ?? 'createdAt');
    query.append('direction', params?.direction ?? 'desc');

    const url = `${this.BASE_URL}/point-payments/stores?${query.toString()}`;
    return apiClient.get<StorePointPaymentSearchResponse>(url);
  }

  /**
   * Pause store point payments
   * POST /api/pet-save/referrals/point-payments/stores/{storeId}/pause
   */
  static async pauseStorePointPayments(
    storeId: string,
    request: ReferralPauseRequest
  ): Promise<ApiResponse<ReferralResponse>> {
    const url = `${this.BASE_URL}/point-payments/stores/${storeId}/pause`;
    return apiClient.post<ReferralResponse>(url, request);
  }

  /**
   * Reactivate store point payments
   * POST /api/pet-save/referrals/point-payments/stores/{storeId}/reactivate
   */
  static async reactivateStorePointPayments(
    storeId: string
  ): Promise<ApiResponse<ReferralResponse>> {
    const url = `${this.BASE_URL}/point-payments/stores/${storeId}/reactivate`;
    return apiClient.post<ReferralResponse>(url);
  }
}
