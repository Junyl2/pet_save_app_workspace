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
export interface CreateReferralPolicyResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown> | null;
  errorId?: string;
}
