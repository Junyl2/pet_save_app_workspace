/**
 * Common response wrapper for referral API endpoints
 */
export interface ReferralResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string | null;
  data?: unknown;
  errorId?: string | null;
}

/**
 * Request body for pausing a store referral
 */
export interface ReferralPauseRequest {
  reason: string;
}

/**
 * Parameters for searching store referrals (admin)
 */
export interface ReferralSearchParams {
  keyword?: string;
  storeId?: string;
  isPaused?: boolean;
  dateStart?: string;
  dateEnd?: string;
  minReferrals?: number;
  maxReferrals?: number;
  page?: number;
  size?: number;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'businessName'
    | 'totalSubscribers'
    | 'totalAwardedPoints';
  direction?: 'asc' | 'desc';
}

/**
 * Search result for store referrals
 */
export interface ReferralSearchResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string | null;
  data: {
    content: ReferralStoreStatus[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  };
  errorId?: string | null;
}

/**
 * Individual store referral status record
 */
export interface ReferralStoreStatus {
  storeId: string;
  businessName: string;
  totalSubscribers: number;
  totalAwardedPoints: number;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}
