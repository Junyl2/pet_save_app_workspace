import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  AnswerInquiryRequest,
  AnswerInquiryResponse,
} from '@/app/api/types/seller/sellerInquiry';

export class SellerInquiryService {
  /**
   * POST /api/pet-save/inquiries/{inquiryId}/answer
   * 문의 답변 작성 | Answer inquiry
   */
  static async answerInquiry(
    inquiryId: string,
    payload: AnswerInquiryRequest
  ): Promise<ApiResponse<AnswerInquiryResponse>> {
    return apiClient.post<AnswerInquiryResponse>(
      `/inquiries/${inquiryId}/answer`,
      payload
    );
  }

  /**
   * PUT /api/pet-save/inquiries/{inquiryId}/answer
   * 문의 답변 수정 | Update inquiry answer
   */
  static async updateInquiryAnswer(
    inquiryId: string,
    payload: AnswerInquiryRequest
  ): Promise<ApiResponse<AnswerInquiryResponse>> {
    return apiClient.put<AnswerInquiryResponse>(
      `/inquiries/${inquiryId}/answer`,
      payload
    );
  }
}
