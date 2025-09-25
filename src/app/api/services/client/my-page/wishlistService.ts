import { apiClient, ApiResponse } from '../../../apiClient';
import {
  GetWishlistResponse,
  WishlistData,
  AddToWishlistRequest,
  AddToWishlistResponse,
  RemoveFromWishlistRequest,
  RemoveFromWishlistResponse,
} from '../../../types/my-page/wishlist';
import { MemberService } from '../memberService/memberService';

/**
 * Wishlist Service
 * Handles all wishlist-related API operations
 */
export class WishlistService {
  /**
   * Get user's wishlist
   * GET /api/pet-save/wishlists/members/{memberId}
   */
  static async getWishlist(): Promise<ApiResponse<WishlistData>> {
    try {
      // Get memberId from member service
      const memberResponse = await MemberService.getMyInfo();
      if (!memberResponse.data?.data?.memberId) {
        return {
          data: null,
          error: 'Failed to get member information',
        };
      }

      const memberId = memberResponse.data.data.memberId;
      console.log('Getting wishlist for member:', memberId);

      const response = await apiClient.get<GetWishlistResponse>(
        `/wishlists/members/${memberId}`
      );

      console.log('Get wishlist response:', response);

      if (response.data?.success && response.data.data) {
        // API returns array directly, wrap it in our expected structure
        const wishlistData: WishlistData = {
          items: response.data.data,
          totalCount: response.data.data.length,
        };
        return {
          data: wishlistData,
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
   * Toggle product in wishlist (add if not present, remove if present)
   * POST /api/pet-save/wishlists/products/{productId}
   */
  static async toggleWishlist(
    productId: string,
    isCurrentlyFavorited: boolean
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      // Check authentication before making the request
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('No auth token found');
        return {
          data: null,
          error: 'Authentication required',
        };
      }

      console.log('Toggling wishlist:', { productId, isCurrentlyFavorited });
      console.log('Auth token exists:', !!authToken);

      const requestBody = { productId };
      console.log('Sending wishlist request:', {
        url: `/wishlists/products/${productId}`,
        body: requestBody,
      });

      const response = await apiClient.post<AddToWishlistResponse>(
        `/wishlists/products/${productId}`,
        requestBody
      );

      console.log('Toggle wishlist response:', response);

      if (response.data?.success) {
        return {
          data: { success: true, message: 'Wishlist updated successfully' },
          error: undefined,
        };
      } else {
        return {
          data: null,
          error: response.data?.resultMsg || 'Failed to toggle wishlist',
        };
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return {
        data: null,
        error:
          error.response?.data?.resultMsg ||
          error.message ||
          'Failed to toggle wishlist',
      };
    }
  }
}

// Export individual functions for convenience
export const { getWishlist, toggleWishlist } = WishlistService;
