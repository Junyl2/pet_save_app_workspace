// app/api/services/client/memberService/order/oderDetailsService.ts
import { apiClient } from '../../../../apiClient';
import {
  OrderHistoryQueryParams,
  OrderHistoryApiResponse,
  OrderItemResponse,
  DeleteOrderHistoryResponse,
} from '../../../../types/member/order/orderDetails';

// Simple cache for order data
let orderCache: OrderItemResponse[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const orderDetailsService = {
  /**
   * Get my order history
   * GET /api/pet-save/members/me/orders
   */
  getMyOrderHistory: async (
    params?: OrderHistoryQueryParams
  ): Promise<{ data: OrderHistoryApiResponse | null; error?: string }> => {
    const queryParams = new URLSearchParams();

    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.dateStart) queryParams.append('dateStart', params.dateStart);
    if (params?.dateEnd) queryParams.append('dateEnd', params.dateEnd);
    if (params?.page !== undefined)
      queryParams.append('page', params.page.toString());
    if (params?.size !== undefined)
      queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.direction) queryParams.append('direction', params.direction);
    if (params?.onlyReviewable !== undefined)
      queryParams.append('onlyReviewable', String(params.onlyReviewable));

    const url = `/members/me/orders${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    return await apiClient.get<OrderHistoryApiResponse>(url);
  },

  /**
   * Get order details by order ID
   * Filters from the order history API since individual order endpoint doesn't exist
   */
  getOrderDetails: async (
    orderId: string
  ): Promise<{ data: OrderHistoryApiResponse | null; error?: string }> => {
    try {
      let allOrderItems: OrderItemResponse[] = [];

      // Check cache first
      const now = Date.now();
      if (orderCache && now - cacheTimestamp < CACHE_DURATION) {
        allOrderItems = orderCache;
      } else {
        const response = await orderDetailsService.getMyOrderHistory();
        if (response.error) return { data: null, error: response.error };

        if (response.data?.data?.content) {
          allOrderItems = response.data.data.content;
          orderCache = allOrderItems;
          cacheTimestamp = now;
        } else {
          return { data: null, error: 'No order data found' };
        }
      }

      const filteredItems = allOrderItems.filter(
        (item) => item.orderId === orderId
      );

      if (filteredItems.length === 0) {
        return { data: null, error: 'Order not found' };
      }

      const filteredResponse: OrderHistoryApiResponse = {
        success: true,
        status: 200,
        resultMsg: 'Select Success',
        divisionCode: null,
        data: {
          content: filteredItems,
          pageInfo: {
            totalElements: filteredItems.length,
            totalPages: 1,
            currentPage: 0,
            pageSize: filteredItems.length,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
          },
        },
      };

      return { data: filteredResponse };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch order details',
      };
    }
  },

  /**
   * Delete order history (OWNER/ADMIN)
   * DELETE /api/pet-save/order-histories/orders/{orderId}
   */
  deleteOrderHistory: async (
    orderId: string
  ): Promise<{ data: DeleteOrderHistoryResponse | null; error?: string }> => {
    try {
      const url = `/order-histories/orders/${orderId}`;
      const response = await apiClient.delete<DeleteOrderHistoryResponse>(url);
      return { data: response.data };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete order history',
      };
    }
  },
};
