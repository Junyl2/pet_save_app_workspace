import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ReviewCreateDto,
  ReviewSearchParams,
  ReviewSearchResponse,
  MyReviewsParams,
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

    if (params?.productId) {
      queryParams.append('productId', params.productId);
    }
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

    const response = await apiClient.get<{
      success: boolean;
      status: number;
      resultMsg: string;
      divisionCode: string | null;
      data: ReviewSearchResponse;
    }>(url);

    if (response.error) {
      return { data: null, error: response.error };
    }

    // Handle the wrapped API response structure
    const apiResponse = response.data;
    if (!apiResponse?.success) {
      return {
        data: null,
        error: apiResponse?.resultMsg || 'Failed to fetch reviews',
      };
    }

    // Return the actual data from the nested structure
    return {
      data: apiResponse.data,
      error: undefined,
    };
  }

  /**
   * Get my reviews
   * GET /api/pet-save/members/me/reviews
   */
  static async getMyReviews(
    params?: MyReviewsParams
  ): Promise<ApiResponse<ReviewSearchResponse>> {
    const queryParams = new URLSearchParams();

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

    const url = `/members/me/reviews${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await apiClient.get<{
      success: boolean;
      status: number;
      resultMsg: string;
      divisionCode: string | null;
      data: ReviewSearchResponse;
    }>(url);

    if (response.error) {
      return { data: null, error: response.error };
    }

    // Handle the wrapped API response structure
    const apiResponse = response.data;
    if (!apiResponse?.success) {
      return {
        data: null,
        error: apiResponse?.resultMsg || 'Failed to fetch my reviews',
      };
    }

    // Return the actual data from the nested structure
    return {
      data: apiResponse.data,
      error: undefined,
    };
  }
}
