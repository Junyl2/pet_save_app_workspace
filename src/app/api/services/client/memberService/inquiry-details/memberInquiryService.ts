import { InquiryFileService } from './inquiryFileService';
import { apiClient, ApiResponse } from '../../../../apiClient';
import {
  MyInquiriesResponse,
  MyInquiriesParams,
  DeleteInquiryResponse,
} from '../../../../types/member/inquiry-details/inquiry';

export interface CreateInquiryRequest {
  productId?: string;
  category: 'EXCHANGE_RETURN' | 'PRODUCT' | 'DELIVERY' | 'PAYMENT' | 'OTHER';
  content: string;
  imageFileIds?: string[];
}

export interface CreateInquiryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
    inquiryId?: string;
  };
  errorId: string;
}

/**
 * Member inquiry service for handling inquiry-related operations
 * This service provides a high-level interface for inquiry management
 * including file operations through the InquiryFileService
 */
export class MemberInquiryService {
  /**
   * Get current member's inquiries
   * GET /api/pet-save/members/me/inquiries
   */
  static async getMyInquiries(
    params?: MyInquiriesParams
  ): Promise<ApiResponse<MyInquiriesResponse>> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        if (params.category) queryParams.append('category', params.category);
        if (params.status) queryParams.append('status', params.status);

        // Ensure strict YYYY-MM-DD format
        if (params.dateStart) {
          const start = params.dateStart.split('T')[0];
          queryParams.append('dateStart', start);
        }
        if (params.dateEnd) {
          const end = params.dateEnd.split('T')[0];
          queryParams.append('dateEnd', end);
        }

        // pagination and sorting
        queryParams.append('page', String(params.page ?? 0));
        queryParams.append('size', String(params.size ?? 10));
        queryParams.append('sortBy', params.sortBy ?? 'createdAt');
        queryParams.append('direction', params.direction ?? 'desc');
      }

      const queryString = queryParams.toString();
      const url = `/members/me/inquiries${
        queryString ? `?${queryString}` : ''
      }`;

      console.log('📡 [MemberInquiryService] Final Request URL:', url);

      const response = await apiClient.get<MyInquiriesResponse>(url);

      if (response.error) {
        console.error('[MemberInquiryService] API error:', response.error);
      } else {
        console.log('[MemberInquiryService] Response summary:', {
          totalElements: response.data?.data?.pageInfo?.totalElements,
          inquiriesCount: response.data?.data?.content?.length,
        });
      }

      return response;
    } catch (error) {
      console.error('[MemberInquiryService] Error getting inquiries:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get inquiries',
      };
    }
  }

  /**
   * Delete an inquiry
   * DELETE /api/pet-save/inquiries/{inquiryId}
   */
  static async deleteInquiry(
    inquiryId: string
  ): Promise<ApiResponse<DeleteInquiryResponse>> {
    try {
      console.log('[MemberInquiryService] Deleting inquiry:', inquiryId);
      const response = await apiClient.delete<DeleteInquiryResponse>(
        `/inquiries/${inquiryId}`
      );

      if (response.error) {
        console.error(
          '[MemberInquiryService] Failed to delete inquiry:',
          response.error
        );
      } else {
        console.log('[MemberInquiryService] Inquiry deleted:', response.data);
      }

      return response;
    } catch (error) {
      console.error('[MemberInquiryService] Error deleting inquiry:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to delete inquiry',
      };
    }
  }

  /**
   * Create a new inquiry
   * POST /api/pet-save/inquiries
   */
  static async createInquiry(
    request: CreateInquiryRequest
  ): Promise<ApiResponse<CreateInquiryResponse>> {
    try {
      console.log(
        '[MemberInquiryService] Creating inquiry with payload:',
        request
      );

      // Validate: productId is required when category is 'PRODUCT'
      if (request.category === 'PRODUCT') {
        if (!request.productId || request.productId.trim() === '') {
          const errorMessage =
            '상품 문의는 상품 상세 페이지에서 문의를 남겨주세요.';
          console.error(
            '[MemberInquiryService] Validation error:',
            errorMessage
          );
          return {
            data: null,
            error: errorMessage,
          };
        }
      }

      // Build request body - always include productId if provided to ensure store is linked
      const requestBody: {
        productId?: string;
        category: string;
        content: string;
        imageFileIds: string[];
      } = {
        category: request.category,
        content: request.content,
        imageFileIds: request.imageFileIds || [],
      };

      // Always include productId if provided (even if optional) to ensure backend links store
      // According to API: productId is optional, but required when category is 'PRODUCT'
      // However, we always include it when available to ensure store information is populated
      if (request.productId && request.productId.trim() !== '') {
        requestBody.productId = request.productId.trim();
      }

      console.log(
        '[MemberInquiryService] Final request body being sent:',
        JSON.stringify(requestBody, null, 2)
      );

      const response = await apiClient.post<CreateInquiryResponse>(
        '/inquiries',
        requestBody
      );

      if (response.error) {
        console.error(
          '[MemberInquiryService] Failed to create inquiry:',
          response.error
        );
      } else {
        console.log(
          '[MemberInquiryService] Inquiry created successfully:',
          response.data
        );
      }

      return response;
    } catch (error) {
      console.error('[MemberInquiryService] Error creating inquiry:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to create inquiry',
      };
    }
  }
  /**
   * Upload a single file for an inquiry
   * Convenience method that delegates to InquiryFileService
   */
  static async uploadInquiryFile(
    file: File,
    metadata?: {
      entityType?: string;
      entityId?: string;
      documentType?: string;
      description?: string;
    }
  ) {
    return InquiryFileService.uploadFile(file, metadata);
  }

  /**
   * Upload multiple files for an inquiry
   * Convenience method that delegates to InquiryFileService
   */
  static async uploadInquiryFiles(
    files: File[],
    metadata?: {
      entityType?: string;
      entityId?: string;
      documentType?: string;
      description?: string;
    }
  ) {
    return InquiryFileService.uploadMultipleFiles(files, metadata);
  }

  /**
   * Attach files to an inquiry
   * Convenience method that delegates to InquiryFileService
   */
  static async attachFilesToInquiry(inquiryId: string, fileIds: string[]) {
    return InquiryFileService.attachFiles(inquiryId, fileIds);
  }

  /**
   * Upload and attach files to an inquiry in one operation
   * Convenience method that delegates to InquiryFileService
   */
  static async uploadAndAttachFilesToInquiry(
    files: File[],
    inquiryId: string,
    metadata?: {
      entityType?: string;
      entityId?: string;
      documentType?: string;
      description?: string;
    }
  ) {
    return InquiryFileService.uploadAndAttachFiles(files, inquiryId, metadata);
  }

  /**
   * Download a file
   * Convenience method that delegates to InquiryFileService
   */
  static async downloadInquiryFile(
    encryptedId: string,
    options?: {
      disposition?: 'inline' | 'attachment';
      type?: 'original' | 'thumbnail';
      ifNoneMatch?: string;
      ifModifiedSince?: string;
    }
  ) {
    return InquiryFileService.downloadFile(encryptedId, options);
  }

  /**
   * Get file information
   * Convenience method that delegates to InquiryFileService
   */
  static async getInquiryFileInfo(encryptedId: string) {
    return InquiryFileService.getFileInfo(encryptedId);
  }

  /**
   * Get files for an inquiry
   * Convenience method that delegates to InquiryFileService
   */
  static async getInquiryFiles(inquiryId: string) {
    return InquiryFileService.getEntityFiles(inquiryId);
  }

  /**
   * Delete a file
   * Convenience method that delegates to InquiryFileService
   */
  static async deleteInquiryFile(encryptedId: string) {
    return InquiryFileService.deleteFile(encryptedId);
  }

  /**
   * Get inquiry file service instance for direct access
   * This allows for more granular control over file operations
   */
  static get fileService() {
    return InquiryFileService;
  }
}
