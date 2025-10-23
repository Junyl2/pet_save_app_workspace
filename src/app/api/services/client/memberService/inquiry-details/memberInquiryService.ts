import { InquiryFileService } from './inquiryFileService';
import { apiClient, ApiResponse } from '../../../../apiClient';
import {
  MyInquiriesResponse,
  MyInquiriesParams,
  DeleteInquiryResponse,
} from '../../../../types/member/inquiry-details/inquiry';

export interface CreateInquiryRequest {
  productId: string;
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
      console.log(
        '[MemberInquiryService] Getting my inquiries with params:',
        params
      );

      // Build query parameters
      const queryParams = new URLSearchParams();

      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.dateStart) queryParams.append('dateStart', params.dateStart);
      if (params?.dateEnd) queryParams.append('dateEnd', params.dateEnd);
      if (params?.page !== undefined)
        queryParams.append('page', params.page.toString());
      if (params?.size !== undefined)
        queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const queryString = queryParams.toString();
      const url = `/members/me/inquiries${
        queryString ? `?${queryString}` : ''
      }`;

      console.log('🌐 API Request URL:', url);
      console.log(
        '📋 Query parameters:',
        Object.fromEntries(queryParams.entries())
      );

      const response = await apiClient.get<MyInquiriesResponse>(url);

      if (response.error) {
        console.error(
          '[MemberInquiryService] Failed to get my inquiries:',
          response.error
        );
      } else {
        console.log(
          '[MemberInquiryService] My inquiries retrieved successfully:',
          {
            totalElements: response.data?.data?.pageInfo?.totalElements || 0,
            currentPage: response.data?.data?.pageInfo?.currentPage || 0,
            totalPages: response.data?.data?.pageInfo?.totalPages || 0,
            inquiriesCount: response.data?.data?.content?.length || 0,
          }
        );
      }

      return response;
    } catch (error) {
      console.error(
        '[MemberInquiryService] Error getting my inquiries:',
        error
      );
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get my inquiries',
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

      const response = await apiClient.post<CreateInquiryResponse>(
        '/inquiries',
        {
          productId: request.productId,
          category: request.category,
          content: request.content,
          imageFileIds: request.imageFileIds || [],
        }
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
