import { apiClient } from '@/app/api/apiClient';
import {
  PrepareOrderItemResponse,
  CancelOrderItemRequest,
  CancelOrderItemResponse,
  BeginPickupResponse,
  BeginDeliveryRequest,
  BeginDeliveryResponse,
  CompleteOrderItemResponse,
} from './orderStatusTypes';

export const orderStatusService = {
  /**
   * Mark order item as in preparation (테스트 전용)
   * POST /api/pet-save/orders/items/{orderItemId}/prepare
   */
  markOrderItemAsPreparing: async (
    orderItemId: string
  ): Promise<{ data: PrepareOrderItemResponse | null; error?: string }> => {
    return await apiClient.post<PrepareOrderItemResponse>(
      `/orders/items/${orderItemId}/prepare`
    );
  },

  /**
   * Cancel specific order item
   * POST /api/pet-save/orders/items/{orderItemId}/cancel
   */
  cancelOrderItem: async (
    orderItemId: string,
    cancelReason: string
  ): Promise<{ data: CancelOrderItemResponse | null; error?: string }> => {
    const body: CancelOrderItemRequest = { cancelReason };
    return await apiClient.post<CancelOrderItemResponse>(
      `/orders/items/${orderItemId}/cancel`,
      body
    );
  },

  /**
   * Begin pickup for a specific order item (테스트 전용)
   * POST /api/pet-save/orders/items/{orderItemId}/begin-pickup
   */
  beginPickup: async (
    orderItemId: string
  ): Promise<{ data: BeginPickupResponse | null; error?: string }> => {
    return await apiClient.post<BeginPickupResponse>(
      `/orders/items/${orderItemId}/begin-pickup`
    );
  },

  /**
   * Begin delivery for a specific order item (테스트 전용)
   * POST /api/pet-save/orders/items/{orderItemId}/begin-delivery
   */
  beginDelivery: async (
    orderItemId: string,
    trackingNumber: string
  ): Promise<{ data: BeginDeliveryResponse | null; error?: string }> => {
    const body: BeginDeliveryRequest = { trackingNumber };
    return await apiClient.post<BeginDeliveryResponse>(
      `/orders/items/${orderItemId}/begin-delivery`,
      body
    );
  },

  /**
   * Mark order item as completed (테스트 전용)
   * POST /api/pet-save/orders/items/{orderItemId}/complete
   *
   * Purpose:
   * - Sets an order item’s status to "COMPLETED"
   * - Used for manual completion testing
   */
  markOrderItemAsCompleted: async (
    orderItemId: string
  ): Promise<{ data: CompleteOrderItemResponse | null; error?: string }> => {
    return await apiClient.post<CompleteOrderItemResponse>(
      `/orders/items/${orderItemId}/complete`
    );
  },
};
