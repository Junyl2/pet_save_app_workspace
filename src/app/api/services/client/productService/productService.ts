import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  BaseApiEnvelope,
  Product,
  ProductCreateRequest,
  ProductStatusChangeResponse,
} from '@/app/api/types/products/createProduct';

/**
 * Product Service
 * Requires authenticated ADMIN role.
 */
export class ProductService {
  private static readonly BASE_URL = '/products';

  /**
   * Create a new product for a specific store
   * POST /products
   */
  static async createProduct(
    payload: ProductCreateRequest
  ): Promise<ApiResponse<BaseApiEnvelope<Product>>> {
    console.log('[ProductService] Creating product with payload:', payload);

    const response = await apiClient.post<BaseApiEnvelope<Product>>(
      this.BASE_URL,
      payload
    );

    if (response.error) {
      console.error(
        '[ProductService] Failed to create product:',
        response.error
      );
    } else {
      console.log(
        '[ProductService] Product created successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Mark product as sold out
   * POST /products/{productId}/mark-soldout
   */
  static async markSoldOut(
    productId: string
  ): Promise<ApiResponse<ProductStatusChangeResponse>> {
    console.log('[ProductService] Marking product as sold out:', productId);

    const response = await apiClient.post<ProductStatusChangeResponse>(
      `${this.BASE_URL}/${productId}/mark-soldout`
    );

    if (response.error) {
      console.error(
        '[ProductService] Failed to mark product as sold out:',
        response.error
      );
    } else {
      console.log(
        '[ProductService] Product marked as sold out successfully:',
        response.data
      );
    }

    return response;
  }

  /**
   * Mark product as on sale
   * POST /products/{productId}/mark-onsale
   */
  static async markOnSale(
    productId: string
  ): Promise<ApiResponse<ProductStatusChangeResponse>> {
    console.log('[ProductService] Marking product as on sale:', productId);

    const response = await apiClient.post<ProductStatusChangeResponse>(
      `${this.BASE_URL}/${productId}/mark-onsale`
    );

    if (response.error) {
      console.error(
        '[ProductService] Failed to mark product as on sale:',
        response.error
      );
    } else {
      console.log(
        '[ProductService] Product marked as on sale successfully:',
        response.data
      );
    }

    return response;
  }
}
