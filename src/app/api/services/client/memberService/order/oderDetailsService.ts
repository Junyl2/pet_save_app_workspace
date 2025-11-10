import { apiClient } from '../../../../apiClient';
import {
  OrderHistoryQueryParams,
  OrderHistoryApiResponse,
  OrderItemResponse,
  DeleteOrderHistoryResponse,
  SingleOrderItemApiResponse,
} from '../../../../types/member/order/orderDetails';

export const orderDetailsService = {
  /** Get my order history */
  async getMyOrderHistory(
    params?: OrderHistoryQueryParams
  ): Promise<{ data: OrderHistoryApiResponse | null; error?: string }> {
    try {
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

      const response = await apiClient.get<OrderHistoryApiResponse>(url);
      return { data: response.data };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch order history',
      };
    }
  },

  /** Get order histories by member ID (ADMIN or OWNER) */
  async getOrderHistoriesByMemberId(
    memberId: string,
    params?: OrderHistoryQueryParams
  ): Promise<{ data: OrderHistoryApiResponse | null; error?: string }> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params?.size !== undefined)
        queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const url = `/order-histories/members/${memberId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await apiClient.get<OrderHistoryApiResponse>(url);
      return { data: response.data };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch member order histories',
      };
    }
  },

  /** Get order details by orderId (from cache or member API) */
  async getOrderDetails(
    orderId: string
  ): Promise<{ data: OrderHistoryApiResponse | null; error?: string }> {
    try {
      const { data, error } = await orderDetailsService.getMyOrderHistory();
      if (error) return { data: null, error };

      const allItems = data?.data?.content ?? [];
      const filteredItems: OrderItemResponse[] = allItems.filter(
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

  /** Get order details by orderItemId (single item response) */
  async getOrderDetailsByItemId(
    orderItemId: string
  ): Promise<{ data: SingleOrderItemApiResponse | null; error?: string }> {
    try {
      const response = await apiClient.get<SingleOrderItemApiResponse>(
        `/orders/items/${orderItemId}`
      );
      return { data: response.data };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch order details by itemId',
      };
    }
  },

  /**
   * Delete order history (OWNER/ADMIN)
   * DELETE /api/pet-save/order-histories/orders/{orderId}
   */
  async deleteOrderHistory(
    orderId: string
  ): Promise<{ data: DeleteOrderHistoryResponse | null; error?: string }> {
    try {
      const url = `/order-histories/orders/${orderId}`;
      console.log('Delete order history URL:', url);
      const response = await apiClient.delete<DeleteOrderHistoryResponse>(url);

      // If there's an error, return it
      if (response.error) {
        return { data: null, error: response.error };
      }

      // If response.data exists but success is false, extract the error message
      if (response.data && !response.data.success) {
        const errorMsg =
          response.data.resultMsg || 'Failed to delete order history';
        return { data: null, error: errorMsg };
      }

      return { data: response.data };
    } catch (error) {
      console.error('Delete order history error:', error);
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
