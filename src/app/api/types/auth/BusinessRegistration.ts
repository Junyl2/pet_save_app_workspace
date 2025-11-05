/**
 * =========================
 * Business Registration API Types
 * =========================
 */

/**
 * Request payload for business registration application
 */
export interface BusinessRegistrationRequest {
  businessRegistrationNumber: string;
  representativeName: string;
  businessName: string;
  businessRegistrationCopyFileId: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  bankName: string;
  accountNumber: string;
  depositorName: string;
  bankbookFileId: string;
  businessEmail: string;
  x: number;
  y: number;
}

/**
 * Base API envelope
 */
export interface ApiResponseEnvelope {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown>;
  errorId?: string | null;
}

/**
 * Response for POST / PUT / GET /me
 */
export interface BusinessRegistrationResponse extends ApiResponseEnvelope {
  data: Record<string, unknown>;
}

/**
 * =========================
 * Admin: List All Business Registrations
 * =========================
 */

/**
 * Query params for fetching all business registration requests (admin)
 */
export interface BusinessRegistrationListQuery {
  keyword?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  dateStart?: string;
  dateEnd?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt';
  direction?: 'asc' | 'desc';
}

/**
 * Single business registration summary (admin)
 */
export interface BusinessRegistrationSummary {
  requestId: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  applicantNickname: string;
  applicantPhoneNumber: string;
  businessRegistrationNumber: string;
  representativeName: string;
  businessName: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  fullAddress: string;
  businessEmail: string;
  bankName: string;
  accountNumber: string;
  depositorName: string;
  businessRegistrationCopy: string;
  bankbook: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

/**
 * Paginated response for GET /api/pet-save/business-registrations (admin)
 */
export interface BusinessRegistrationListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: {
    content: BusinessRegistrationSummary[];
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
