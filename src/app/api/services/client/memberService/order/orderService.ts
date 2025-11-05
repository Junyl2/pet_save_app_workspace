import { apiClient } from '../../../../apiClient';
import {
  DirectOrderRequest,
  DirectOrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  SearchOrdersParams,
  SearchOrdersResponse,
  AdminCancelOrderItemsResponse,
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

  /**
   * Cancel order (Admin)
   * POST /orders/{orderId}/admin-cancel?reason={reason}
   */
  cancelOrderByAdmin: async (
    orderId: string,
    reason: string
  ): Promise<{ data: any | null; error?: string }> => {
    return await apiClient.post<any>(
      `/orders/${orderId}/admin-cancel?reason=${encodeURIComponent(reason)}`
    );
  },

  /**
   * Cancel specific order items (Admin Only)
   * POST /orders/items/admin-cancel
   */
  cancelOrderItemsByAdmin: async (
    orderItemIds: string[],
    cancelReason: string
  ): Promise<{
    data: AdminCancelOrderItemsResponse | null;
    error?: string;
  }> => {
    const query = new URLSearchParams();
    orderItemIds.forEach((id) => query.append('orderItemIds', id));

    const body = { cancelReason };

    return await apiClient.post<AdminCancelOrderItemsResponse>(
      `/orders/items/admin-cancel?${query.toString()}`,
      body
    );
  },
};
