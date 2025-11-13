import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  AdminCancelledOrdersParams,
  AdminCancelledOrdersResponse,
} from './orderCancel';

export class OrderCancelService {
  private static readonly BASE_URL = '/v2/orders/cancelled';

  static async getCancelledOrders(
    params?: AdminCancelledOrdersParams
  ): Promise<ApiResponse<AdminCancelledOrdersResponse>> {
    const query = new URLSearchParams();

    if (params?.orderNumber) {
      query.append('orderNumber', params.orderNumber);
    }
    if (params?.keyword) {
      query.append('keyword', params.keyword);
    }
    if (params?.shippingOption) {
      query.append('shippingOption', params.shippingOption);
    }
    if (params?.dateStart) {
      query.append('dateStart', params.dateStart);
    }
    if (params?.dateEnd) {
      query.append('dateEnd', params.dateEnd);
    }
    if (params?.page !== undefined) {
      query.append('page', String(params.page));
    }
    if (params?.size !== undefined) {
      query.append('size', String(params.size));
    }

    const url = query.toString()
      ? `${this.BASE_URL}?${query.toString()}`
      : this.BASE_URL;

    return apiClient.get<AdminCancelledOrdersResponse>(url);
  }
}
