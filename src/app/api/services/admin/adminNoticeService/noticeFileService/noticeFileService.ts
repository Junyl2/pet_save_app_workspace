import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  NoticeFileUploadRequest,
  NoticeMultipleFileUploadRequest,
  NoticeFileUploadResponse,
  NoticeMultipleFileUploadResponse,
  NoticeFileAttachRequest,
  NoticeFileAttachResponse,
  NoticeFileInfoResponse,
  NoticeFileListResponse,
  NoticeFileDeleteResponse,
} from './noticeFile';

/**
 * Notice File Service
 * Handles upload, attachment, retrieval, and deletion of notice files
 */
export class NoticeFileService {
  private static readonly BASE_URL = '/notices/files';

  /**
   * Upload a single notice file
   * POST /api/pet-save/notices/files/upload
   */
  static async uploadFile(
    request: NoticeFileUploadRequest
  ): Promise<ApiResponse<NoticeFileUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response = await apiClient.raw.post<NoticeFileUploadResponse>(
        `${this.BASE_URL}/upload`,
        formData
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File upload failed';
      return { data: null, error: message };
    }
  }

  /**
   * Upload multiple notice files
   * POST /api/pet-save/notices/files/upload/multiple
   */
  static async uploadMultipleFiles(
    request: NoticeMultipleFileUploadRequest
  ): Promise<ApiResponse<NoticeMultipleFileUploadResponse>> {
    try {
      const formData = new FormData();
      request.files.forEach((file) => formData.append('files', file));
      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response =
        await apiClient.raw.post<NoticeMultipleFileUploadResponse>(
          `${this.BASE_URL}/upload/multiple`,
          formData
        );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Multiple file upload failed';
      return { data: null, error: message };
    }
  }

  /**
   * Attach uploaded notice files to an entity
   * POST /api/pet-save/notices/files/attach?entityId={id}
   */
  static async attachFiles(
    request: NoticeFileAttachRequest
  ): Promise<ApiResponse<NoticeFileAttachResponse>> {
    try {
      const response = await apiClient.post<NoticeFileAttachResponse>(
        `${this.BASE_URL}/attach?entityId=${encodeURIComponent(
          request.entityId
        )}`,
        request.fileIds
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Attach files failed';
      return { data: null, error: message };
    }
  }

  /**
   * Get a notice file (view or download)
   * GET /api/pet-save/notices/files/{encryptedId}
   */
  static async getFile(
    encryptedId: string,
    options?: { disposition?: string; type?: string }
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await apiClient.getFile(
        `${this.BASE_URL}/${encodeURIComponent(encryptedId)}`,
        {
          disposition: options?.disposition ?? 'inline',
          type: options?.type ?? 'original',
        }
      );
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File retrieval failed';
      return { data: null, error: message };
    }
  }

  /**
   * Get file info metadata
   * GET /api/pet-save/notices/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<NoticeFileInfoResponse>> {
    try {
      const response = await apiClient.get<NoticeFileInfoResponse>(
        `${this.BASE_URL}/${encodeURIComponent(encryptedId)}/info`
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Get file info failed';
      return { data: null, error: message };
    }
  }

  /**
   * Get file list for an entity
   * GET /api/pet-save/notices/files/list/{entityId}
   */
  static async listFiles(
    entityId: string
  ): Promise<ApiResponse<NoticeFileListResponse>> {
    try {
      const response = await apiClient.get<NoticeFileListResponse>(
        `${this.BASE_URL}/list/${encodeURIComponent(entityId)}`
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'List files failed';
      return { data: null, error: message };
    }
  }

  /**
   * Delete a notice file
   * DELETE /api/pet-save/notices/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<NoticeFileDeleteResponse>> {
    try {
      const response = await apiClient.delete<NoticeFileDeleteResponse>(
        `${this.BASE_URL}/${encodeURIComponent(encryptedId)}`
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Delete file failed';
      return { data: null, error: message };
    }
  }
}
