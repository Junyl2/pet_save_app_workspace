import { apiClient, ApiResponse } from '../../../../apiClient';
import {
  Notice,
  NoticeSearchParams,
  NoticeListResponse,
} from '../../../../types/member/notice/notice';

export const noticeService = {
  /**
   * 공지사항 검색
   * @param params 검색 파라미터
   * @returns 공지사항 목록
   */
  async searchNotices(
    params: NoticeSearchParams = {}
  ): Promise<ApiResponse<NoticeListResponse>> {
    const searchParams = new URLSearchParams();

    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.dateStart) searchParams.append('dateStart', params.dateStart);
    if (params.dateEnd) searchParams.append('dateEnd', params.dateEnd);
    if (params.page !== undefined)
      searchParams.append('page', params.page.toString());
    if (params.size !== undefined)
      searchParams.append('size', params.size.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.direction) searchParams.append('direction', params.direction);

    const queryString = searchParams.toString();
    const url = `/notices${queryString ? `?${queryString}` : ''}`;

    // The API returns the full response structure, so we need to extract the data field
    const response = await apiClient.raw.get(url);

    if (response.data && response.data.success) {
      return {
        data: response.data.data, // response.data.data contains { content: [...], pageInfo: {...} }
        error: undefined,
      };
    } else {
      return {
        data: null,
        error: response.data?.resultMsg || 'Failed to fetch notices',
      };
    }
  },

  /**
   * 공지사항 상세 조회
   * @param noticeId 공지사항 ID
   * @returns 공지사항 상세 정보
   */
  async getNoticeById(noticeId: string): Promise<ApiResponse<Notice>> {
    // The API returns the full response structure, so we need to extract the data field
    const response = await apiClient.raw.get(`/notices/${noticeId}`);

    if (response.data && response.data.success) {
      return {
        data: response.data.data, // response.data.data contains the notice object
        error: undefined,
      };
    } else {
      return {
        data: null,
        error: response.data?.resultMsg || 'Failed to fetch notice',
      };
    }
  },
};
