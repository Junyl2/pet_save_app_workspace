import { apiClient } from '../../../../apiClient';
import {
  DirectOrderRequest,
  DirectOrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  SearchOrdersParams,
  SearchOrdersResponse,
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

  /**
   * Search orders (Admin or user)
   * GET /orders
   */
  searchOrders: async (
    params?: SearchOrdersParams
  ): Promise<{ data: SearchOrdersResponse | null; error?: string }> => {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null)
                acc[key] = String(value);
              return acc;
            },
            {}
          )
        ).toString()
      : '';

    return await apiClient.get<SearchOrdersResponse>(`/orders${query}`);
  },
};
