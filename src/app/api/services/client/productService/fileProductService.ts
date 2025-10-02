import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  FileUploadResponse,
  MultipleFileUploadResponse,
  FileAttachResponse,
  FileUploadRequest,
  MultipleFileUploadRequest,
  FileAttachRequest,
  FileInfoResponse,
  FileListResponse,
  FileDeleteResponse,
  FileDownloadOptions,
} from '@/app/api/types/file/productFile';

/**
 * Product File Service
 * Handles file upload and attachment operations for products
 */
export class FileProductService {
  private static readonly BASE_URL = '/products/files';

  /**
   * Upload a single file
   * POST /api/pet-save/products/files/upload
   */
  static async uploadFile(
    request: FileUploadRequest
  ): Promise<ApiResponse<FileUploadResponse>> {
    console.log(
      '[FileProductService] Uploading single file:',
      request.file.name
    );

    try {
      const formData = new FormData();
      formData.append('file', request.file);

      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response = await apiClient.raw.post<FileUploadResponse>(
        `${this.BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(
        '[FileProductService] File uploaded successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File upload failed';
      console.error('[FileProductService] Failed to upload file:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Upload multiple files
   * POST /api/pet-save/products/files/upload/multiple
   */
  static async uploadMultipleFiles(
    request: MultipleFileUploadRequest
  ): Promise<ApiResponse<MultipleFileUploadResponse>> {
    console.log(
      '[FileProductService] Uploading multiple files:',
      request.files.length
    );

    try {
      const formData = new FormData();

      request.files.forEach((file) => {
        formData.append('files', file);
      });

      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response = await apiClient.raw.post<MultipleFileUploadResponse>(
        `${this.BASE_URL}/upload/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(
        '[FileProductService] Multiple files uploaded successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Multiple file upload failed';
      console.error(
        '[FileProductService] Failed to upload multiple files:',
        message
      );
      return { data: null, error: message };
    }
  }

  /**
   * Attach uploaded files to an entity
   * POST /api/pet-save/products/files/attach?entityId={entityId}
   */
  static async attachFiles(
    entityId: string,
    request: FileAttachRequest
  ): Promise<ApiResponse<FileAttachResponse>> {
    console.log(
      '[FileProductService] Attaching files to entity:',
      entityId,
      request.fileIds
    );

    try {
      const response = await apiClient.raw.post<FileAttachResponse>(
        `${this.BASE_URL}/attach?entityId=${entityId}`,
        request.fileIds,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        '[FileProductService] Files attached successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File attachment failed';
      console.error('[FileProductService] Failed to attach files:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Download or retrieve a file
   * GET /api/pet-save/products/files/{encryptedId}
   */
  static async downloadFile(
    encryptedId: string,
    options?: FileDownloadOptions
  ): Promise<ApiResponse<Blob>> {
    console.log('[FileProductService] Downloading file:', encryptedId);

    try {
      const params = new URLSearchParams();
      if (options?.disposition) {
        params.append('disposition', options.disposition);
      }
      if (options?.type) {
        params.append('type', options.type);
      }

      const headers: Record<string, string> = {};
      if (options?.ifNoneMatch) {
        headers['If-None-Match'] = options.ifNoneMatch;
      }
      if (options?.ifModifiedSince) {
        headers['If-Modified-Since'] = options.ifModifiedSince;
      }

      const url = `${this.BASE_URL}/${encryptedId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      const response = await apiClient.raw.get(url, {
        responseType: 'blob',
        headers,
      });

      console.log('[FileProductService] File downloaded successfully');
      return { data: response.data as Blob, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File download failed';
      console.error('[FileProductService] Failed to download file:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Delete a file
   * DELETE /api/pet-save/products/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<FileDeleteResponse>> {
    console.log('[FileProductService] Deleting file:', encryptedId);

    try {
      const response = await apiClient.raw.delete<FileDeleteResponse>(
        `${this.BASE_URL}/${encryptedId}`
      );

      console.log(
        '[FileProductService] File deleted successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File deletion failed';
      console.error('[FileProductService] Failed to delete file:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Get file information
   * GET /api/pet-save/products/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<FileInfoResponse>> {
    console.log('[FileProductService] Getting file info:', encryptedId);

    try {
      const response = await apiClient.raw.get<FileInfoResponse>(
        `${this.BASE_URL}/${encryptedId}/info`
      );

      console.log(
        '[FileProductService] File info retrieved successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get file info';
      console.error('[FileProductService] Failed to get file info:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Get list of files for an entity
   * GET /api/pet-save/products/files/list/{entityId}
   */
  static async getEntityFiles(
    entityId: string
  ): Promise<ApiResponse<FileListResponse>> {
    console.log('[FileProductService] Getting files for entity:', entityId);

    try {
      const response = await apiClient.raw.get<FileListResponse>(
        `${this.BASE_URL}/list/${entityId}`
      );

      console.log(
        '[FileProductService] Entity files retrieved successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get entity files';
      console.error(
        '[FileProductService] Failed to get entity files:',
        message
      );
      return { data: null, error: message };
    }
  }
}
