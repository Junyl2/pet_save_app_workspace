import { apiClient } from '../../../apiClient';
import {
  AddToCartRequest,
  AddToCartResponse,
  CartResponse,
  CartItem,
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
};
