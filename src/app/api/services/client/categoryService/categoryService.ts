import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  Category,
  CategoryApiResponse,
  CategorySearchParams,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryResponse,
  CategoryByIdResponse,
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

  /**
   * Get category by ID
   * GET /api/pet-save/categories/{categoryId}
   */
  static async getCategoryById(
    categoryId: string
  ): Promise<ApiResponse<{ data: Category }>> {
    try {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }

      const url = `${this.BASE_URL}/${categoryId}`;
      const response = await apiClient.get<{ data: Category }>(url);

      if (response.error) {
        console.error(
          '[CategoryService] Failed to fetch category by ID:',
          response.error
        );
        return response;
      }

      console.log('[CategoryService] Category fetched successfully:', {
        categoryId,
        categoryName: response.data?.data?.categoryName,
      });

      return response;
    } catch (error) {
      console.error('[CategoryService] getCategoryById error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch category by ID',
      };
    }
  }

  /**
   * Create a new category
   * POST /api/pet-save/categories
   */
  static async createCategory(
    request: CategoryCreateRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    console.log('[CategoryService] Creating new category:', request.name);

    try {
      const response = await apiClient.raw.post<CategoryResponse>(
        this.BASE_URL,
        request,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log(
        '[CategoryService] Category created successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Category creation failed';
      console.error('[CategoryService] Failed to create category:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Update existing category information
   * PUT /api/pet-save/categories/{categoryId}
   * ADMIN permission required
   */
  static async updateCategory(
    categoryId: string,
    request: CategoryUpdateRequest
  ): Promise<ApiResponse<CategoryResponse>> {
    console.log('[CategoryService] Updating category:', categoryId);

    try {
      const response = await apiClient.raw.put<CategoryResponse>(
        `${this.BASE_URL}/${categoryId}`,
        request,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log(
        '[CategoryService] Category updated successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Category update failed';
      console.error('[CategoryService] Failed to update category:', message);
      return { data: null, error: message };
    }
  }
}
