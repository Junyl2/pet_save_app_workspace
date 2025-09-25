import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  BaseApiEnvelope,
  Product,
  ProductCreateRequest,
  ProductStatusChangeResponse,
} from '@/app/api/types/products/createProduct';
import {
  ProductSearchParams,
  ProductSearchResponse,
} from '@/app/api/types/products/products';

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

  /**
   * Search products with filters
   * GET /api/pet-save/products
   */
  static async searchProducts(
    params: ProductSearchParams = {}
  ): Promise<ApiResponse<ProductSearchResponse>> {
    console.log('[ProductService] Searching products with params:', params);

    const queryParams = new URLSearchParams();

    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.categoryName)
      queryParams.append('categoryName', params.categoryName);
    if (params.baseLocation)
      queryParams.append('base location', params.baseLocation);
    if (params.registrationStatus)
      queryParams.append('registrationStatus', params.registrationStatus);
    if (params.page !== undefined)
      queryParams.append('page', params.page.toString());
    if (params.size !== undefined)
      queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.direction) queryParams.append('direction', params.direction);

    const url = `/products${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await apiClient.get<ProductSearchResponse>(url);

    if (response.error) {
      console.error(
        '[ProductService] Failed to search products:',
        response.error
      );
    } else {
      console.log(
        '[ProductService] Products search successful:',
        response.data
      );
    }

    return response;
  }
}
