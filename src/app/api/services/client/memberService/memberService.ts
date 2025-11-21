import { apiClient, ApiResponse } from '../../../apiClient';
import {
  MemberApiResponse,
  MemberUpdateRequest,
  MemberUpdateResponse,
} from '@/app/api/types/member/member';

/**
 * Paginated members list response
 */
export interface MemberListApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: {
    content: MemberSummary[];
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

/**
 * Individual member summary (for admin list)
 */
export interface MemberSummary {
  memberId: string;
  storeId: string | null;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  zipCode: string | null;
  roadAddress: string | null;
  detailedAddress: string | null;
  birthdate: string | null;
  verifiedAt: string | null;
  numberOfReports: number;
  availablePointsBalance: number;
  numberOfWishlists: number;
  numberOfProducts: number;
  numberOfReviewsMade: number;
  numberOfReferrals: number;
  referralCode: string | null;
  businessName: string | null;
  classification: string | null; // 관리자, 일반, 판매자
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

/**
 * Query params for members list
 */
export interface MemberListQuery {
  keyword?: string;
  dateStart?: string;
  dateEnd?: string;
  role?: 'ADMIN' | 'USER' | 'SELLER';
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

/**
 * Member service for handling member-related operations
 */
export class MemberService {
  /**
   * Get current member information
   * Endpoint: GET /api/pet-save/members/me
   */
  static async getMyInfo(): Promise<ApiResponse<MemberApiResponse>> {
    try {
      return await apiClient.get<MemberApiResponse>('/members/me');
    } catch (error) {
      console.error('MemberService.getMyInfo error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get member info',
      };
    }
  }

  /**
   * Update member information
   * Endpoint: PUT /api/pet-save/members/{memberId}
   */
  static async updateMemberInfo(
    memberId: string,
    updateData: MemberUpdateRequest
  ): Promise<ApiResponse<MemberUpdateResponse>> {
    try {
      return await apiClient.put<MemberUpdateResponse>(
        `/members/${memberId}`,
        updateData
      );
    } catch (error) {
      console.error('MemberService.updateMemberInfo error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update member info',
      };
    }
  }

  /**
   * Get a specific member's summary information (Admin)
   * Endpoint: GET /api/pet-save/members/{memberId}
   */
  static async getMemberById(
    memberId: string
  ): Promise<ApiResponse<MemberApiResponse>> {
    try {
      return await apiClient.get<MemberApiResponse>(`/members/${memberId}`);
    } catch (error) {
      console.error('MemberService.getMemberById error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch member information',
      };
    }
  }

  /**
   * Get detailed member information (OWNER / ADMIN)
   * Endpoint: GET /api/pet-save/members/{memberId}/details
   */
  static async getMemberDetails(
    memberId: string
  ): Promise<ApiResponse<MemberApiResponse>> {
    try {
      const response = await apiClient.get<MemberApiResponse>(
        `/members/${memberId}/details`
      );

      if (response.error) {
        console.error('Get member details failed:', response.error);
      } else if (!response.data?.success) {
        console.warn('Member details fetch not successful:', response.data);
      }

      return response;
    } catch (error) {
      console.error('MemberService.getMemberDetails error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch member details',
      };
    }
  }

  /**
   * Get members list (ADMIN)
   * Endpoint: GET /api/pet-save/members
   */
  static async getMembersList(
    params: MemberListQuery
  ): Promise<ApiResponse<MemberListApiResponse>> {
    try {
      const query = new URLSearchParams();
      if (params.keyword) query.append('keyword', params.keyword);
      if (params.dateStart) query.append('dateStart', params.dateStart);
      if (params.dateEnd) query.append('dateEnd', params.dateEnd);
      if (params.role) query.append('role', params.role);
      if (params.page !== undefined)
        query.append('page', params.page.toString());
      if (params.size !== undefined)
        query.append('size', params.size.toString());
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.direction) query.append('direction', params.direction);

      const url = `/members${query.toString() ? `?${query.toString()}` : ''}`;
      return await apiClient.get<MemberListApiResponse>(url);
    } catch (error) {
      console.error('MemberService.getMembersList error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch members list',
      };
    }
  }
}
