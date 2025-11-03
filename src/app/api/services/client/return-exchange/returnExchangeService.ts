import { apiClient } from '@/app/api/apiClient';
import {
  BaseApiResponse,
  CreateReturnExchangeRequest,
  ReturnExchangeItem,
  ReturnExchangeQueryParams,
  UpdateReturnExchangeStatusRequest,
} from '@/app/api/types/member/return-exchange/returnExchange';

/**
 * Service: Return / Exchange Requests
 * Centralized wrapper for all return/exchange API calls.
 * All methods use the shared `apiClient` for typed, authenticated requests.
 */
export const returnExchangeService = {
  /**
   * [POST] /return-requests
   * Create a new return or exchange request.
   * - Accessible by: **Authenticated Users**
   */
  async create(payload: CreateReturnExchangeRequest) {
    return apiClient.post<BaseApiResponse<ReturnExchangeItem>>(
      '/return-requests',
      payload
    );
  },

  /**
   * [GET] /return-requests
   * Fetch all return/exchange requests (with optional filters).
   * - Accessible by: **Admin**
   */
  async getAll(params?: ReturnExchangeQueryParams) {
    const query = new URLSearchParams(
      Object.entries(params || {}).reduce<Record<string, string>>(
        (acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        },
        {}
      )
    ).toString();

    const url = `/return-requests${query ? `?${query}` : ''}`;
    return apiClient.get<BaseApiResponse<ReturnExchangeItem[]>>(url);
  },

  /**
   * [GET] /return-requests/{returnRequestId}
   * Fetch detailed info for a specific return/exchange request.
   */
  async getById(returnRequestId: string) {
    return apiClient.get<BaseApiResponse<ReturnExchangeItem>>(
      `/return-requests/${returnRequestId}`
    );
  },

  /**
   * [GET] /return-requests/stores/{storeId}
   * Fetch all return/exchange requests for a specific store.
   */
  async getByStore(
    storeId: string,
    params?: Pick<
      ReturnExchangeQueryParams,
      'page' | 'size' | 'sortBy' | 'direction'
    >
  ) {
    const query = new URLSearchParams(
      Object.entries(params || {}).reduce<Record<string, string>>(
        (acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        },
        {}
      )
    ).toString();

    const url = `/return-requests/stores/${storeId}${query ? `?${query}` : ''}`;
    return apiClient.get<BaseApiResponse<ReturnExchangeItem[]>>(url);
  },

  /**
   * [PUT] /return-requests/{returnRequestId}/status
   * Update the status of a return/exchange request.
   */
  async updateStatus(
    returnRequestId: string,
    payload: UpdateReturnExchangeStatusRequest
  ) {
    return apiClient.put<BaseApiResponse<ReturnExchangeItem>>(
      `/return-requests/${returnRequestId}/status`,
      payload
    );
  },
};
