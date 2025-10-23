import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ReviewCreateDto,
  ReviewSearchParams,
  ReviewSearchResponse,
  MyReviewsParams,
  Review,
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

  /**
   * Get a single review by ID
   * GET /api/pet-save/reviews/{reviewId}
   */
  static async getReviewById(reviewId: string): Promise<ApiResponse<Review>> {
    const response = await apiClient.get<{
      success: boolean;
      status: number;
      resultMsg: string;
      divisionCode: string | null;
      data: Review;
    }>(`/reviews/${reviewId}`);

    if (response.error) {
      return { data: null, error: response.error };
    }

    // Handle the wrapped API response structure
    const apiResponse = response.data;
    if (!apiResponse?.success) {
      return {
        data: null,
        error: apiResponse?.resultMsg || 'Failed to fetch review',
      };
    }

    // Return the actual data from the nested structure
    return {
      data: apiResponse.data,
      error: undefined,
    };
  }

  /**
   * Update an existing review
   * PUT /api/pet-save/reviews/{reviewId}
   */
  static async updateReview(
    reviewId: string,
    reviewData: {
      rating: number;
      content: string;
      imageFileIds: string[];
    }
  ): Promise<ApiResponse<Review>> {
    console.log('Updating review with ID:', reviewId);
    console.log('Review data:', reviewData);

    // Use PUT method as specified in the API documentation
    const response = await apiClient.raw.put<{
      success: boolean;
      status: number;
      resultMsg: string;
      divisionCode: string | null;
      data: Review;
    }>(`/reviews/${reviewId}`, reviewData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data) {
      // Handle the wrapped API response structure
      const apiResponse = response.data;
      if (!apiResponse?.success) {
        return {
          data: null,
          error: apiResponse?.resultMsg || 'Failed to update review',
        };
      }

      // Return the actual data from the nested structure
      return {
        data: apiResponse.data,
        error: undefined,
      };
    } else {
      return { data: null, error: 'No response data' };
    }
  }
  catch(error: unknown) {
    console.error('Review update API error:', error);

    // Type guard to check if error has response property
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          data?: { resultMsg?: string };
          status?: number;
          headers?: unknown;
        };
      };
      console.error('Error response:', axiosError.response?.data);
      console.error('Error status:', axiosError.response?.status);
      console.error('Error headers:', axiosError.response?.headers);
    }

    return {
      data: null,
      error:
        (error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { resultMsg?: string } } }).response
              ?.data?.resultMsg
          : undefined) ||
        (error instanceof Error ? error.message : 'Unknown error') ||
        'Failed to update review',
    };
  }

  /**
   * Delete a review
   * DELETE /api/pet-save/reviews/{reviewId}
   */
  static async deleteReview(reviewId: string): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<{
      success: boolean;
      status: number;
      resultMsg: string;
      divisionCode: string | null;
      data: object;
    }>(`/reviews/${reviewId}`);

    if (response.error) {
      return { data: null, error: response.error };
    }

    // Handle the wrapped API response structure
    const apiResponse = response.data;
    if (!apiResponse?.success) {
      return {
        data: null,
        error: apiResponse?.resultMsg || 'Failed to delete review',
      };
    }

    // Return the actual data from the nested structure
    return {
      data: apiResponse.data,
      error: undefined,
    };
  }
}
