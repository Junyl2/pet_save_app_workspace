import { apiClient, ApiResponse } from '../../../apiClient';
import {
  StoreFileUploadRequest,
  StoreFileUploadResponse,
  StoreMultipleFileUploadRequest,
  StoreMultipleFileUploadResponse,
  StoreFileAttachRequest,
  StoreFileAttachResponse,
  StoreFileInfoResponse,
  StoreFileListResponse,
  StoreFileDeleteResponse,
  StoreFileDownloadOptions,
} from '../../../types/stores/fileStore';

/**
 * Store File Service
 * Handles file upload and attachment operations for stores
 */
export class StoreFileService {
  private static readonly BASE_URL = '/stores/files';

  /**
   * Upload a single file
   * POST /api/pet-save/stores/files/upload
   */
  static async uploadFile(
    request: StoreFileUploadRequest
  ): Promise<ApiResponse<StoreFileUploadResponse>> {
    console.log('[StoreFileService] Uploading single file:', request.file.name);

    try {
      const formData = new FormData();
      formData.append('file', request.file);

      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response = await apiClient.raw.post<StoreFileUploadResponse>(
        `${this.BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(
        '[StoreFileService] File uploaded successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File upload failed';

      console.error('[StoreFileService] Failed to upload file:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Upload multiple files
   * POST /api/pet-save/stores/files/upload/multiple
   */
  static async uploadMultipleFiles(
    request: StoreMultipleFileUploadRequest
  ): Promise<ApiResponse<StoreMultipleFileUploadResponse>> {
    console.log(
      '[StoreFileService] Uploading multiple files:',
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

      const response =
        await apiClient.raw.post<StoreMultipleFileUploadResponse>(
          `${this.BASE_URL}/upload/multiple`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

      console.log(
        '[StoreFileService] Multiple files uploaded successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Multiple file upload failed';
      console.error(
        '[StoreFileService] Failed to upload multiple files:',
        message
      );
      return { data: null, error: message };
    }
  }

  /**
   * Attach uploaded files to an entity
   * POST /api/pet-save/stores/files/attach?entityId={entityId}
   */
  static async attachFiles(
    entityId: string,
    request: StoreFileAttachRequest
  ): Promise<ApiResponse<StoreFileAttachResponse>> {
    console.log(
      '[StoreFileService] Attaching files to entity:',
      entityId,
      'files:',
      request.fileIds.length
    );

    try {
      const response = await apiClient.post<StoreFileAttachResponse>(
        `${this.BASE_URL}/attach?entityId=${entityId}`,
        request.fileIds
      );

      console.log(
        '[StoreFileService] Files attached successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'File attachment failed';
      console.error('[StoreFileService] Failed to attach files:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Get/Download file
   * GET /api/pet-save/stores/files/{encryptedId}
   */
  static async getFile(
    encryptedId: string,
    options?: StoreFileDownloadOptions
  ): Promise<ApiResponse<Blob>> {
    try {
      console.log('[StoreFileService] Getting file:', encryptedId);
      const response = await apiClient.getFile(`/stores/files/${encryptedId}`, {
        disposition: options?.disposition || 'inline',
        type: options?.type || 'original',
        headers: options?.headers || {},
      });

      if (response.error) {
        console.error('[StoreFileService] Get file failed:', response.error);
        return response;
      }

      console.log('[StoreFileService] File retrieved successfully');
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get file';
      console.error('[StoreFileService] Failed to get file:', message);
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Delete file
   * DELETE /api/pet-save/stores/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<StoreFileDeleteResponse>> {
    try {
      console.log('[StoreFileService] Deleting file:', encryptedId);
      const response = await apiClient.delete<StoreFileDeleteResponse>(
        `/stores/files/${encryptedId}`
      );

      if (response.error) {
        console.error('[StoreFileService] Delete file failed:', response.error);
        return response;
      }

      console.log('[StoreFileService] File deleted successfully');
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete file';
      console.error('[StoreFileService] Failed to delete file:', message);
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Get file info
   * GET /api/pet-save/stores/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<StoreFileInfoResponse>> {
    try {
      console.log('[StoreFileService] Getting file info:', encryptedId);
      const response = await apiClient.get<StoreFileInfoResponse>(
        `/stores/files/${encryptedId}/info`
      );

      if (response.error) {
        console.error(
          '[StoreFileService] Get file info failed:',
          response.error
        );
        return response;
      }

      console.log('[StoreFileService] File info retrieved successfully');
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get file info';
      console.error('[StoreFileService] Failed to get file info:', message);
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Get file list by entity
   * GET /api/pet-save/stores/files/list/{entityId}
   */
  static async getFileList(
    entityId: string
  ): Promise<ApiResponse<StoreFileListResponse>> {
    try {
      console.log('[StoreFileService] Getting file list for entity:', entityId);
      const response = await apiClient.get<StoreFileListResponse>(
        `/stores/files/list/${entityId}`
      );

      if (response.error) {
        console.error(
          '[StoreFileService] Get file list failed:',
          response.error
        );
        return response;
      }

      console.log('[StoreFileService] File list retrieved successfully');
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get file list';
      console.error('[StoreFileService] Failed to get file list:', message);
      return {
        data: null,
        error: message,
      };
    }
  }

  /** Create download URL */
  static createDownloadUrl(
    encryptedId: string,
    options?: { disposition?: string; type?: string }
  ): string {
    const params = new URLSearchParams();
    if (options?.disposition) params.append('disposition', options.disposition);
    if (options?.type) params.append('type', options.type);

    const queryString = params.toString();
    return `/stores/files/${encryptedId}${
      queryString ? `?${queryString}` : ''
    }`;
  }

  /** Create file info URL */
  static createFileInfoUrl(encryptedId: string): string {
    return `/stores/files/${encryptedId}/info`;
  }

  /** Create file list URL */
  static createFileListUrl(entityId: string): string {
    return `/stores/files/list/${entityId}`;
  }
}
