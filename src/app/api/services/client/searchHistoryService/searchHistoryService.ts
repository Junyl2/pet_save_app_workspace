import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  /*  SearchHistoryItem, */
  SearchHistoryResponse,
  SearchHistoryParams,
  KeywordListResponse,
} from '@/app/api/types/searchHistory/searchHistory';

/**
 * Search History Service
 * Public endpoints for managing search history
 */
export class SearchHistoryService {
  private static readonly BASE_URL = '/search-history';

  /**
   * Get search history with pagination and sorting
   * GET /api/pet-save/search-history
   */
  static async getSearchHistory(
    params?: SearchHistoryParams
  ): Promise<ApiResponse<SearchHistoryResponse>> {
    console.log(
      '[SearchHistoryService] Getting search history with params:',
      params
    );

    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append('page', params.page.toString());
    if (params?.size !== undefined)
      queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.direction) queryParams.append('direction', params.direction);

    const url = `${this.BASE_URL}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await apiClient.get<SearchHistoryResponse>(url);

    if (response.error) {
      console.error(
        '[SearchHistoryService] Failed to get search history:',
        response.error
      );
    } else {
      console.log(
        '[SearchHistoryService] Search history retrieved successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Clear all search history
   * DELETE /api/pet-save/search-history
   */
  static async clearSearchHistory(): Promise<
    ApiResponse<{ success: boolean }>
  > {
    console.log('[SearchHistoryService] Clearing all search history');

    const response = await apiClient.delete<{ success: boolean }>(
      this.BASE_URL
    );

    if (response.error) {
      console.error(
        '[SearchHistoryService] Failed to clear search history:',
        response.error
      );
    } else {
      console.log(
        '[SearchHistoryService] Search history cleared successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Get recent searches
   * GET /api/pet-save/search-history/recent
   */
  static async getRecentSearches(): Promise<
    ApiResponse<SearchHistoryResponse>
  > {
    console.log('[SearchHistoryService] Getting recent searches');

    const response = await apiClient.get<SearchHistoryResponse>(
      `${this.BASE_URL}/recent`
    );

    if (response.error) {
      console.error(
        '[SearchHistoryService] Failed to get recent searches:',
        response.error
      );
    } else {
      console.log(
        '[SearchHistoryService] Recent searches retrieved successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Get distinct keywords
   * GET /api/pet-save/search-history/keywords
   */
  static async getDistinctKeywords(): Promise<
    ApiResponse<KeywordListResponse>
  > {
    console.log('[SearchHistoryService] Getting distinct keywords');

    const response = await apiClient.get<KeywordListResponse>(
      `${this.BASE_URL}/keywords`
    );

    if (response.error) {
      console.error(
        '[SearchHistoryService] Failed to get distinct keywords:',
        response.error
      );
    } else {
      console.log(
        '[SearchHistoryService] Distinct keywords retrieved successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Get search history count
   * GET /api/pet-save/search-history/count
   */
  static async getSearchHistoryCount(): Promise<
    ApiResponse<{ count: number }>
  > {
    console.log('[SearchHistoryService] Getting search history count');

    const response = await apiClient.get<{ count: number }>(
      `${this.BASE_URL}/count`
    );

    if (response.error) {
      console.error(
        '[SearchHistoryService] Failed to get search history count:',
        response.error
      );
    } else {
      console.log(
        '[SearchHistoryService] Search history count retrieved successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Delete specific keyword from search history
   * DELETE /api/pet-save/search-history/keyword?keyword={keyword}
   */
  static async deleteKeyword(
    keyword: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    console.log('[SearchHistoryService] Deleting keyword:', keyword);

    const response = await apiClient.delete<{ success: boolean }>(
      `${this.BASE_URL}/keyword?keyword=${encodeURIComponent(keyword)}`
    );

    if (response.error) {
      console.error(
        '[SearchHistoryService] Failed to delete keyword:',
        response.error
      );
    } else {
      console.log(
        '[SearchHistoryService] Keyword deleted successfully:',
        response.data
      );
    }

    return response;
  }
}
