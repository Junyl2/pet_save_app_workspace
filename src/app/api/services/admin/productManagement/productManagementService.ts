import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ProductUpdateRequest,
  ProductUpdateResponse,
  ProductDeleteResponse,
} from './productManagement';

/**
 * Product Management Service (ADMIN)
 * Handles product update and delete operations
 * Requires authenticated ADMIN role.
 */
export class ProductManagementService {
  private static readonly BASE_URL = '/products';

  /**
   * Update product information
   * PUT /api/pet-save/products/{productId}
   * Requires ADMIN authority
   */
  static async updateProduct(
    productId: string,
    payload: ProductUpdateRequest
  ): Promise<ApiResponse<ProductUpdateResponse>> {
    console.log(
      '[ProductManagementService] Updating product:',
      productId,
      'with payload:',
      payload
    );

    const response = await apiClient.put<ProductUpdateResponse>(
      `${this.BASE_URL}/${productId}`,
      payload
    );

    if (response.error) {
      console.error(
        '[ProductManagementService] Failed to update product:',
        response.error
      );
    } else {
      console.log(
        '[ProductManagementService] Product updated successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Delete product
   * DELETE /api/pet-save/products/{productId}
   * Requires ADMIN authority
   */
  static async deleteProduct(
    productId: string
  ): Promise<ApiResponse<ProductDeleteResponse>> {
    console.log('[ProductManagementService] Deleting product:', productId);

    const response = await apiClient.delete<ProductDeleteResponse>(
      `${this.BASE_URL}/${productId}`
    );

    if (response.error) {
      console.error(
        '[ProductManagementService] Failed to delete product:',
        response.error
      );
    } else {
      console.log(
        '[ProductManagementService] Product deleted successfully:',
        response.data
      );
    }

    return response;
  }
}
