import { apiClient } from '../../../../apiClient';
import {
  DirectOrderRequest,
  DirectOrderResponse,
  CheckoutRequest,
  CheckoutResponse,
} from '../../../../types/member/order/order';

export const orderService = {
  /**
   * Create direct order (Buy Now)
   * POST /orders/direct
   */
  createDirectOrder: async (
    request: DirectOrderRequest
  ): Promise<{ data: DirectOrderResponse | null; error?: string }> => {
    return await apiClient.post<DirectOrderResponse>('/orders/direct', request);
  },

  /**
   * Checkout cart items
   * POST /orders/checkout
   */
  checkoutCart: async (
    request: CheckoutRequest
  ): Promise<{ data: CheckoutResponse | null; error?: string }> => {
    return await apiClient.post<CheckoutResponse>('/orders/checkout', request);
  },
};
