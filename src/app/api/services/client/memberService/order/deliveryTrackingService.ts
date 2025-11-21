import { apiClient } from '@/app/api/apiClient';
import {
  DeliveryTrackingResponse,
  DeliveryInfoResponse,
  DeliveryEventsResponse,
} from '@/app/api/types/member/order/deliveryTracking';

export const deliveryTrackingService = {
  /**
   * Track delivery by tracking number
   * @param trackingNumber - The tracking number to look up
   */
  trackDelivery: async (trackingNumber: string) => {
    return await apiClient.get<DeliveryTrackingResponse>(
      `/delivery/track/${trackingNumber}`
    );
  },

  /**
   * Get delivery info by order item ID
   * @param orderItemId - The order item ID to get delivery info for
   */
  getDeliveryInfo: async (orderItemId: string) => {
    return await apiClient.get<DeliveryInfoResponse>(
      `/delivery/orders/items/${orderItemId}`
    );
  },

  /**
   * Get delivery events by delivery ID
   * @param deliveryId - The delivery ID to fetch events for
   */
  getDeliveryEvents: async (deliveryId: string) => {
    return await apiClient.get<DeliveryEventsResponse>(
      `/delivery/${deliveryId}/events`
    );
  },
};
