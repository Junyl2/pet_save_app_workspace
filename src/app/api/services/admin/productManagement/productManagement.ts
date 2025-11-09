import { RegistrationStatus } from '@/app/api/types/products/createProduct';
import { BaseApiEnvelope } from '@/app/api/types/products/createProduct';

/**
 * Request body for updating a product
 * Endpoint: PUT /api/pet-save/products/{productId}
 */
export interface ProductUpdateRequest {
  imageFileIds: string[];

  name: string;

  categoryId: string;

  description?: string;

  shortDescription?: string;

  quantity: number;

  salePrice: number;

  discountedPrice?: number;

  allowPoints: boolean;

  expiryDate?: string;

  registrationStatus: RegistrationStatus;
}

/**
 * Response for product update operation
 */
export type ProductUpdateResponse = BaseApiEnvelope<Record<string, never>>;

/**
 * Response for product delete operation
 */
export type ProductDeleteResponse = BaseApiEnvelope<Record<string, never>>;
