import { apiClient, ApiResponse } from '../../../apiClient';
import {
  GetWishlistResponse,
  WishlistData,
  AddToWishlistRequest,
  AddToWishlistResponse,
  RemoveFromWishlistRequest,
  RemoveFromWishlistResponse,
} from '../../../types/my-page/wishlist';

/**
 * Wishlist Service
 * Handles all wishlist-related API operations
 */
export class WishlistService {
  /**
   * Get user's wishlist
   * GET /api/pet-save/members/me/wishlist
   */
  static async getWishlist(): Promise<ApiResponse<WishlistData>> {
    try {
      const response = await apiClient.get<GetWishlistResponse>(
        '/members/me/wishlist'
      );

      if (response.data?.success && response.data.data) {
        return {
          data: response.data.data,
          error: undefined,
        };
      } else {
        return {
          data: null,
          error: response.data?.resultMsg || 'Failed to fetch wishlist',
        };
      }
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      return {
        data: null,
        error:
          error.response?.data?.resultMsg ||
          error.message ||
          'Failed to fetch wishlist',
      };
    }
  }

  /**
   * Add product to wishlist
   * POST /api/pet-save/members/me/wishlist
   */
  static async addToWishlist(
    productId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const requestData: AddToWishlistRequest = { productId };
      const response = await apiClient.post<AddToWishlistResponse>(
        '/members/me/wishlist',
        requestData
      );

      if (response.data?.success) {
        return {
          data: response.data.data,
          error: undefined,
        };
      } else {
        return {
          data: null,
          error: response.data?.resultMsg || 'Failed to add to wishlist',
        };
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      return {
        data: null,
        error:
          error.response?.data?.resultMsg ||
          error.message ||
          'Failed to add to wishlist',
      };
    }
  }

  /**
   * Remove product from wishlist
   * DELETE /api/pet-save/members/me/wishlist/{productId}
   */
  static async removeFromWishlist(
    productId: string
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await apiClient.delete<RemoveFromWishlistResponse>(
        `/members/me/wishlist/${productId}`
      );

      if (response.data?.success) {
        return {
          data: response.data.data,
          error: undefined,
        };
      } else {
        return {
          data: null,
          error: response.data?.resultMsg || 'Failed to remove from wishlist',
        };
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      return {
        data: null,
        error:
          error.response?.data?.resultMsg ||
          error.message ||
          'Failed to remove from wishlist',
      };
    }
  }

  /**
   * Toggle product in wishlist (add if not present, remove if present)
   */
  static async toggleWishlist(
    productId: string,
    isCurrentlyFavorited: boolean
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    if (isCurrentlyFavorited) {
      return this.removeFromWishlist(productId);
    } else {
      return this.addToWishlist(productId);
    }
  }
}

// Export individual functions for convenience
export const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} = WishlistService;
