import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  CategoryFileUploadResponse,
  CategoryMultipleFileUploadResponse,
  CategoryFileAttachResponse,
  CategoryFileUploadRequest,
  CategoryMultipleFileUploadRequest,
  CategoryFileAttachRequest,
  CategoryFileDeleteResponse,
  CategoryFileInfoResponse,
  CategoryFileListResponse,
  CategoryFileDownloadOptions,
} from './categoryFile';

/**
 * Category File Service
 * Handles file upload, attachment, and retrieval operations for categories
 */
export class CategoryFileService {
  private static readonly BASE_URL = '/categories/files';

  /** Upload a single file */
  static async uploadFile(
    request: CategoryFileUploadRequest
  ): Promise<ApiResponse<CategoryFileUploadResponse>> {
    console.log(
      '[CategoryFileService] Uploading single file:',
      request.file.name
    );

    try {
      const formData = new FormData();
      formData.append('file', request.file);

      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response = await apiClient.raw.post<CategoryFileUploadResponse>(
        `${this.BASE_URL}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log(
        '[CategoryFileService] File uploaded successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Category file upload failed';
      console.error('[CategoryFileService] Failed to upload file:', message);
      return { data: null, error: message };
    }
  }

  /** Upload multiple files */
  static async uploadMultipleFiles(
    request: CategoryMultipleFileUploadRequest
  ): Promise<ApiResponse<CategoryMultipleFileUploadResponse>> {
    console.log(
      '[CategoryFileService] Uploading multiple files:',
      request.files.length
    );

    try {
      const formData = new FormData();
      request.files.forEach((file) => formData.append('files', file));

      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response =
        await apiClient.raw.post<CategoryMultipleFileUploadResponse>(
          `${this.BASE_URL}/upload/multiple`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

      console.log(
        '[CategoryFileService] Multiple files uploaded successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Category multiple file upload failed';
      console.error(
        '[CategoryFileService] Failed to upload multiple files:',
        message
      );
      return { data: null, error: message };
    }
  }

  /** Attach uploaded files to a category */
  static async attachFiles(
    entityId: string,
    request: CategoryFileAttachRequest
  ): Promise<ApiResponse<CategoryFileAttachResponse>> {
    console.log(
      '[CategoryFileService] Attaching files to entity:',
      entityId,
      request.fileIds
    );

    try {
      const response = await apiClient.raw.post<CategoryFileAttachResponse>(
        `${this.BASE_URL}/attach?entityId=${entityId}`,
        request.fileIds,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log(
        '[CategoryFileService] Files attached successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Category file attachment failed';
      console.error('[CategoryFileService] Failed to attach files:', message);
      return { data: null, error: message };
    }
  }

  /** Download or retrieve a file */
  static async downloadFile(
    encryptedId: string,
    options?: CategoryFileDownloadOptions
  ): Promise<ApiResponse<Blob>> {
    console.log('[CategoryFileService] Downloading file:', encryptedId);

    try {
      const params = new URLSearchParams();
      if (options?.disposition)
        params.append('disposition', options.disposition);
      if (options?.type) params.append('type', options.type);

      const headers: Record<string, string> = {};
      if (options?.ifNoneMatch) headers['If-None-Match'] = options.ifNoneMatch;
      if (options?.ifModifiedSince)
        headers['If-Modified-Since'] = options.ifModifiedSince;

      const url = `${this.BASE_URL}/${encryptedId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      const response = await apiClient.raw.get(url, {
        responseType: 'blob',
        headers,
      });

      console.log('[CategoryFileService] File downloaded successfully');
      return { data: response.data as Blob, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Category file download failed';
      console.error('[CategoryFileService] Failed to download file:', message);
      return { data: null, error: message };
    }
  }

  /** Delete a file */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<CategoryFileDeleteResponse>> {
    console.log('[CategoryFileService] Deleting file:', encryptedId);

    try {
      const response = await apiClient.raw.delete<CategoryFileDeleteResponse>(
        `${this.BASE_URL}/${encryptedId}`
      );

      console.log(
        '[CategoryFileService] File deleted successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Category file deletion failed';
      console.error('[CategoryFileService] Failed to delete file:', message);
      return { data: null, error: message };
    }
  }

  /** Get file information */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<CategoryFileInfoResponse>> {
    console.log('[CategoryFileService] Getting file info:', encryptedId);

    try {
      const response = await apiClient.raw.get<CategoryFileInfoResponse>(
        `${this.BASE_URL}/${encryptedId}/info`
      );

      console.log(
        '[CategoryFileService] File info retrieved successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to get category file info';
      console.error('[CategoryFileService] Failed to get file info:', message);
      return { data: null, error: message };
    }
  }

  /** Get all files linked to an entity */
  static async getEntityFiles(
    entityId: string
  ): Promise<ApiResponse<CategoryFileListResponse>> {
    console.log('[CategoryFileService] Getting files for entity:', entityId);

    try {
      const response = await apiClient.raw.get<CategoryFileListResponse>(
        `${this.BASE_URL}/list/${entityId}`
      );

      console.log(
        '[CategoryFileService] Entity files retrieved successfully:',
        response.data
      );
      return { data: response.data, error: undefined };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get entity files';
      console.error(
        '[CategoryFileService] Failed to get entity files:',
        message
      );
      return { data: null, error: message };
    }
  }
}
