import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  AdminInquirySearchParams,
  AdminInquirySearchResponse,
  InquiryAnswerRequest,
  ApiBaseResponse,
  AdminInquiryDetailResponse,
} from './adminInquiry';

export class AdminInquiryService {
  private static readonly BASE_URL = '/inquiries';

  static async searchInquiries(
    params: AdminInquirySearchParams
  ): Promise<ApiResponse<AdminInquirySearchResponse>> {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.dateStart) query.append('dateStart', params.dateStart);
    if (params.dateEnd) query.append('dateEnd', params.dateEnd);
    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 10));
    query.append('sortBy', params.sortBy ?? 'createdAt');
    query.append('direction', params.direction ?? 'desc');

    const url = `${this.BASE_URL}?${query.toString()}`;
    return apiClient.get<AdminInquirySearchResponse>(url);
  }

  static async getInquiryById(
    inquiryId: string
  ): Promise<ApiResponse<AdminInquiryDetailResponse>> {
    return apiClient.get<AdminInquiryDetailResponse>(
      `${this.BASE_URL}/${inquiryId}`
    );
  }

  static async createAnswer(
    inquiryId: string,
    body: InquiryAnswerRequest
  ): Promise<ApiResponse<ApiBaseResponse>> {
    return apiClient.post<ApiBaseResponse>(
      `${this.BASE_URL}/${inquiryId}/answer`,
      body
    );
  }

  /**  PUT: update answer (no need for custom headers) */
  static async updateAnswer(
    inquiryId: string,
    body: InquiryAnswerRequest
  ): Promise<ApiResponse<ApiBaseResponse>> {
    return apiClient.put<ApiBaseResponse>(
      `${this.BASE_URL}/${inquiryId}/answer`,
      body
    );
  }

  static async deleteInquiry(
    inquiryId: string
  ): Promise<ApiResponse<ApiBaseResponse>> {
    return apiClient.delete<ApiBaseResponse>(`${this.BASE_URL}/${inquiryId}`);
  }
}
