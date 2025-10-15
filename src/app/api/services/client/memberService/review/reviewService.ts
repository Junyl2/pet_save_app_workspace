import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ReviewCreateDto,
  ReviewSearchParams,
  ReviewSearchResponse,
} from '@/app/api/types/member/review/review';

export class ReviewService {
  /**
   * Create a new review
   * POST /reviews
   */
  static async createReview(
    reviewData: ReviewCreateDto
  ): Promise<ApiResponse<object>> {
    return apiClient.post<object>('/reviews', reviewData);
  }

  /**
   * Search reviews with filter
   * GET /reviews
   */
  static async searchReviews(
    params?: ReviewSearchParams
  ): Promise<ApiResponse<ReviewSearchResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.minRating !== undefined) {
      queryParams.append('minRating', params.minRating.toString());
    }
    if (params?.maxRating !== undefined) {
      queryParams.append('maxRating', params.maxRating.toString());
    }
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params?.direction) {
      queryParams.append('direction', params.direction);
    }

    const url = `/reviews${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    return apiClient.get<ReviewSearchResponse>(url);
  }
}
