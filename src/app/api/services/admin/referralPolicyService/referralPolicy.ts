/**
 * Common response structure for API responses
 */
export interface BaseResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  errorId?: string;
}

/**
 * Referral Policy entity
 */
export interface ReferralPolicy {
  policyId: string;
  pointsPerMember: number;
  monthlyLimitPerSeller: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request body for creating a new referral policy
 */
export interface CreateReferralPolicyRequest {
  pointsPerMember: number;
  monthlyLimitPerSeller: number;
}

/**
 * Response object for referral policy creation
 */
export interface CreateReferralPolicyResponse extends BaseResponse {
  data: ReferralPolicy | null;
}

/**
 * Request body for updating an existing referral policy
 */
export interface UpdateReferralPolicyRequest {
  pointsPerMember: number;
  monthlyLimitPerSeller: number;
  isActive: boolean;
}

/**
 * Response for listing referral policies
 */
export interface ReferralPolicyListResponse extends BaseResponse {
  data: ReferralPolicy[] | null;
}
