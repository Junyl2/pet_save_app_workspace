import { apiClient } from '@/app/api/apiClient';
import {
  DeliveryTrackingResponse,
  DeliveryInfoResponse,
} from '@/app/api/types/member/order/deliveryTracking';

export const deliveryTrackingService = {
  /**
   * Track delivery by tracking number
   * @param trackingNumber - The tracking number to look up
   * @returns Promise with delivery tracking information
   */
  trackDelivery: async (trackingNumber: string) => {
    return await apiClient.get<DeliveryTrackingResponse>(
      `/delivery/track/${trackingNumber}`
    );
  },

  /**
   * Get delivery info by order item ID
   * @param orderItemId - The order item ID to get delivery info for
   * @returns Promise with delivery information
   */
  getDeliveryInfo: async (orderItemId: string) => {
    return await apiClient.get<DeliveryInfoResponse>(
      `/delivery/orders/items/${orderItemId}`
    );
  },
};
