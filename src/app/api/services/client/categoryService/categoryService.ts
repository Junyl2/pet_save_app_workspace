import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  CategoryApiResponse,
  CategorySearchParams,
} from '@/app/api/types/category/category';

/**
 * Category Service
 * Handles category-related operations
 */
export class CategoryService {
  private static readonly BASE_URL = '/categories';

  /**
   * Get all categories with optional search parameters
   * GET /api/pet-save/categories
   */
  static async getAllCategories(
    params?: CategorySearchParams
  ): Promise<ApiResponse<CategoryApiResponse>> {
    try {
      console.log('[CategoryService] Fetching categories with params:', params);

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params?.keyword) queryParams.append('keyword', params.keyword);
      if (params?.categoryName)
        queryParams.append('categoryName', params.categoryName);
      if (params?.englishName)
        queryParams.append('englishName', params.englishName);
      if (params?.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params?.size !== undefined)
        queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const url = `${this.BASE_URL}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await apiClient.get<CategoryApiResponse>(url);

      if (response.error) {
        console.error(
          '[CategoryService] Failed to fetch categories:',
          response.error
        );
        return response;
      }

      console.log('[CategoryService] Categories fetched successfully:', {
        totalCategories: response.data?.data?.totalElements || 0,
        currentPage: response.data?.data?.number || 0,
        totalPages: response.data?.data?.totalPages || 0,
        categoriesFound: response.data?.data?.content?.length || 0,
      });

      return response;
    } catch (error) {
      console.error('[CategoryService] Category service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to fetch categories',
      };
    }
  }
}
