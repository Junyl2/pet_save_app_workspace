import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  NoticeApiResponse,
  NoticeSearchParams,
  NoticeCreateRequest,
  NoticeCreateResponse,
  NoticeDetailResponse,
  NoticeUpdateRequest,
  NoticeUpdateResponse,
  NoticeDeleteResponse,
} from './adminNotice';

/**
 * Admin Notice Service
 * Handles 공지사항 (Notice) CRUD operations
 */
export class AdminNoticeService {
  private static readonly BASE_URL = '/notices';

  /**
   * Search notices with filters
   * GET /api/pet-save/notices
   */
  static async searchNotices(
    params: NoticeSearchParams
  ): Promise<ApiResponse<NoticeApiResponse>> {
    try {
      const query = new URLSearchParams();

      if (params.keyword) query.append('keyword', params.keyword);
      if (params.dateStart) query.append('dateStart', params.dateStart);
      if (params.dateEnd) query.append('dateEnd', params.dateEnd);
      if (params.page !== undefined) query.append('page', String(params.page));
      if (params.size !== undefined) query.append('size', String(params.size));
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.direction) query.append('direction', params.direction);

      const { data, error } = await apiClient.get<NoticeApiResponse>(
        `${this.BASE_URL}?${query.toString()}`
      );

      return { data, error };
    } catch (err) {
      console.error('[AdminNoticeService] Failed to fetch notices:', err);
      return { data: null, error: '공지사항 조회 실패' };
    }
  }

  /**
   * Create a new notice
   * POST /api/pet-save/notices
   * Requires ADMIN authority
   */
  static async createNotice(
    payload: NoticeCreateRequest
  ): Promise<ApiResponse<NoticeCreateResponse>> {
    try {
      const { data, error } = await apiClient.post<NoticeCreateResponse>(
        this.BASE_URL,
        payload
      );
      return { data, error };
    } catch (err) {
      console.error('[AdminNoticeService] Failed to create notice:', err);
      return { data: null, error: '공지사항 생성 실패' };
    }
  }

  /**
   * Get notice details by ID
   * GET /api/pet-save/notices/{noticeId}
   * Public endpoint
   */
  static async getNoticeById(
    noticeId: string
  ): Promise<ApiResponse<NoticeDetailResponse>> {
    try {
      const { data, error } = await apiClient.get<NoticeDetailResponse>(
        `${this.BASE_URL}/${encodeURIComponent(noticeId)}`
      );
      return { data, error };
    } catch (err) {
      console.error('[AdminNoticeService] Failed to fetch notice detail:', err);
      return { data: null, error: '공지사항 상세 조회 실패' };
    }
  }

  /**
   * Update a notice
   * PUT /api/pet-save/notices/{noticeId}
   * Requires ADMIN authority
   */
  static async updateNotice(
    noticeId: string,
    payload: NoticeUpdateRequest
  ): Promise<ApiResponse<NoticeUpdateResponse>> {
    try {
      const { data, error } = await apiClient.put<NoticeUpdateResponse>(
        `${this.BASE_URL}/${encodeURIComponent(noticeId)}`,
        payload
      );
      return { data, error };
    } catch (err) {
      console.error('[AdminNoticeService] Failed to update notice:', err);
      return { data: null, error: '공지사항 수정 실패' };
    }
  }

  /**
   * Delete a notice
   * DELETE /api/pet-save/notices/{noticeId}
   * Requires ADMIN authority
   */
  static async deleteNotice(
    noticeId: string
  ): Promise<ApiResponse<NoticeDeleteResponse>> {
    try {
      const { data, error } = await apiClient.delete<NoticeDeleteResponse>(
        `${this.BASE_URL}/${encodeURIComponent(noticeId)}`
      );
      return { data, error };
    } catch (err) {
      console.error('[AdminNoticeService] Failed to delete notice:', err);
      return { data: null, error: '공지사항 삭제 실패' };
    }
  }
}
