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

/**
 * Parameters for searching store point payment statuses (admin)
 */
export interface StorePointPaymentSearchParams {
  keyword?: string;
  storeId?: string;
  isPaused?: boolean;
  dateStart?: string;
  dateEnd?: string;
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
 * Individual store point payment status record
 */
export interface StorePointPaymentStatus {
  storeId: string;
  businessName: string;
  businessAddress: string;
  ownerName: string;
  ownerEmail: string;
  isReferralAllowed: boolean;
  totalSubscribers: number;
  totalPointPayments: number;
  pausedAt: string | null;
  pausedBy: string | null;
  pauseReason: string | null;
  reactivatedAt: string | null;
  reactivatedBy: string | null;
}

/**
 * Search result for store point payment statuses
 */
export interface StorePointPaymentSearchResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string | null;
  data: {
    content: StorePointPaymentStatus[];
    pageInfo: {
      totalElements: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      first: boolean;
      last: boolean;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  errorId?: string | null;
}
