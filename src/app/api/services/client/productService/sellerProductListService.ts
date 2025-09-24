import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  StoreProductsRequest,
  StoreProductsApiResponse,
} from '@/app/api/types/products/productList';

/**
 * Seller Product List Service
 * Handles product listing operations for sellers
 */
export class SellerProductListService {
  private static readonly BASE_URL = '/products/stores';

  /**
   * Get products by store ID with pagination and filtering
   * GET /api/pet-save/products/stores/{storeId}
   */
  static async getProductsByStoreId(
    request: StoreProductsRequest
  ): Promise<ApiResponse<StoreProductsApiResponse>> {
    const { storeId, ...queryParams } = request;

    console.log(
      '[SellerProductListService] Getting products for store:',
      storeId,
      'with params:',
      queryParams
    );

    // Build query string
    const queryString = new URLSearchParams();
    if (queryParams.keyword) queryString.append('keyword', queryParams.keyword);
    if (queryParams.categoryName)
      queryString.append('categoryName', queryParams.categoryName);
    if (queryParams.baseLocation)
      queryString.append('base location', queryParams.baseLocation);
    if (queryParams.registrationStatus)
      queryString.append('registrationStatus', queryParams.registrationStatus);
    queryString.append('page', String(queryParams.page ?? 0));
    queryString.append('size', String(queryParams.size ?? 10));
    queryString.append('sortBy', queryParams.sortBy ?? 'createdAt');
    queryString.append('direction', queryParams.direction ?? 'desc');

    const url = `${this.BASE_URL}/${storeId}?${queryString.toString()}`;
    console.log('[SellerProductListService] Full URL:', url);
    console.log(
      '[SellerProductListService] StoreId type:',
      typeof storeId,
      'value:',
      storeId
    );

    const response = await apiClient.get<StoreProductsApiResponse>(url);

    if (response.error) {
      console.error(
        '[SellerProductListService] Failed to get products by store ID:',
        response.error
      );
    } else {
      console.log(
        '[SellerProductListService] Products retrieved successfully:',
        response.data
      );
    }

    return response;
  }
}
