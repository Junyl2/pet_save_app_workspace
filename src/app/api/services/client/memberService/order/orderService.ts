import { apiClient } from '../../../../apiClient';
import {
  DirectOrderRequest,
  DirectOrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  SearchOrdersParams,
  SearchOrdersResponse,
  AdminCancelOrderItemsResponse,
  AdminSearchOrdersParams,
  AdminSearchOrdersResponse,
} from '../../../../types/member/order/order';

export const orderService = {
  /** Create direct order (Buy Now) */
  createDirectOrder: async (
    request: DirectOrderRequest
  ): Promise<{ data: DirectOrderResponse | null; error?: string }> => {
    return await apiClient.post<DirectOrderResponse>('/orders/direct', request);
  },

  /** Checkout cart items */
  checkoutCart: async (
    request: CheckoutRequest
  ): Promise<{ data: CheckoutResponse | null; error?: string }> => {
    return await apiClient.post<CheckoutResponse>('/orders/checkout', request);
  },

  /** Search orders (User or Admin) - legacy endpoint */
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

  /** NEW: Search orders (Admin) - v2 */
  searchOrdersV2: async (
    params?: AdminSearchOrdersParams
  ): Promise<{ data: AdminSearchOrdersResponse | null; error?: string }> => {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                  value.forEach((v) => (acc[key] = v));
                } else {
                  acc[key] = String(value);
                }
              }
              return acc;
            },
            {}
          )
        ).toString()
      : '';

    return await apiClient.get<AdminSearchOrdersResponse>(`/v2/orders${query}`);
  },

  /** Cancel order (Admin) */
  cancelOrderByAdmin: async (
    orderId: string,
    reason: string
  ): Promise<{ data: unknown | null; error?: string }> => {
    return await apiClient.post(
      `/orders/${orderId}/admin-cancel?reason=${encodeURIComponent(reason)}`
    );
  },

  /** Cancel specific order items (Admin Only) */
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

  /** ──────────────── NEW: Customer cancels entire order ──────────────── **/
  cancelOrderByCustomer: async (
    orderId: string,
    reason: string
  ): Promise<{ data: unknown | null; error?: string }> => {
    try {
      return await apiClient.post(
        `/orders/${orderId}/cancel?reason=${encodeURIComponent(reason)}`
      );
    } catch (error) {
      console.error('[orderService.cancelOrderByCustomer] Error:', error);
      return { data: null, error: (error as Error).message };
    }
  },
};
