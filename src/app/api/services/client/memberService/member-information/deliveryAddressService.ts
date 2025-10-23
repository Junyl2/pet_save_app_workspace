import { apiClient } from '@/app/api/apiClient';
import {
  CreateDeliveryAddressRequest,
  UpdateDeliveryAddressRequest,
  DeliveryAddressListResponse,
  DeliveryAddressResponse,
} from '@/app/api/types/member/member-information/member-information';

export class DeliveryAddressService {
  /**
   * Get current user's delivery addresses
   */
  static async getDeliveryAddresses(): Promise<{
    data?: DeliveryAddressListResponse;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<DeliveryAddressListResponse>(
        '/delivery/delivery-addresses'
      );

      return { data: response.data || undefined };
    } catch (error) {
      console.error('Error fetching delivery addresses:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch delivery addresses',
      };
    }
  }

  /**
   * Create a new delivery address
   */
  static async createDeliveryAddress(
    request: CreateDeliveryAddressRequest
  ): Promise<{
    data?: DeliveryAddressResponse;
    error?: string;
  }> {
    try {
      console.log(
        '🚀 Sending POST request to /delivery/delivery-addresses with:',
        request
      );

      const response = await apiClient.post<DeliveryAddressResponse>(
        '/delivery/delivery-addresses',
        request
      );

      console.log('📨 POST response received:', response.data);
      return { data: response.data || undefined };
    } catch (error) {
      console.error('Error creating delivery address:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create delivery address',
      };
    }
  }

  /**
   * Update an existing delivery address
   */
  static async updateDeliveryAddress(
    deliveryAddressId: string,
    request: UpdateDeliveryAddressRequest
  ): Promise<{
    data?: DeliveryAddressResponse;
    error?: string;
  }> {
    try {
      console.log(
        '🚀 Sending PUT request to update address:',
        deliveryAddressId,
        request
      );

      const response = await apiClient.put<DeliveryAddressResponse>(
        `/delivery/delivery-addresses/${deliveryAddressId}`,
        request
      );

      console.log('📨 PUT response received:', response.data);
      return { data: response.data || undefined };
    } catch (error) {
      console.error('Error updating delivery address:', error);
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update delivery address',
      };
    }
  }
}
