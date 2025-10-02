import { apiClient } from '../../../apiClient';
import {
  AddToCartRequest,
  AddToCartResponse,
  CartResponse,
  CartItem,
  UpdateCartItemQuantityRequest,
  BatchDeleteCartItemsRequest,
  CartOperationResponse,
} from '../../../types/cart/cart';

export const cartService = {
  /**
   * Add product to cart
   * POST /carts
   */
  addToCart: async (
    productId: string,
    quantity: number
  ): Promise<{ data: AddToCartResponse | null; error?: string }> => {
    const requestData: AddToCartRequest = {
      productId,
      quantity,
    };

    return await apiClient.post<AddToCartResponse>('/carts', requestData);
  },

  /**
   * Get user's cart items
   * GET /carts
   */
  getCart: async (): Promise<{ data: CartResponse | null; error?: string }> => {
    return await apiClient.get<CartResponse>('/carts');
  },

  /**
   * Update cart item quantity
   * PUT /carts/{cartItemId}
   */
  updateCartItemQuantity: async (
    cartItemId: string,
    quantity: number
  ): Promise<{ data: CartOperationResponse | null; error?: string }> => {
    const requestData: UpdateCartItemQuantityRequest = {
      quantity,
    };

    return await apiClient.put<CartOperationResponse>(
      `/carts/${cartItemId}`,
      requestData
    );
  },

  /**
   * Delete single cart item
   * DELETE /carts/{cartItemId}
   */
  deleteCartItem: async (
    cartItemId: string
  ): Promise<{ data: CartOperationResponse | null; error?: string }> => {
    return await apiClient.delete<CartOperationResponse>(
      `/carts/${cartItemId}`
    );
  },

  /**
   * Batch delete cart items
   * DELETE /carts/batch
   */
  batchDeleteCartItems: async (
    cartItemIds: string[]
  ): Promise<{ data: CartOperationResponse | null; error?: string }> => {
    const requestData: BatchDeleteCartItemsRequest = {
      cartItemIds: cartItemIds,
    };

    try {
      const response = await apiClient.raw.delete<CartOperationResponse>(
        '/carts/batch',
        { data: requestData }
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: message };
    }
  },
};
