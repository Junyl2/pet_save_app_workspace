import { apiClient, ApiResponse } from '../../../apiClient';
import {
  FileUploadResponse,
  MultipleFileUploadResponse,
  FileAttachmentResponse,
  FileInfoResponse,
  FileListResponse,
  FileDeleteResponse,
  FileUploadMetadata,
  FileDownloadOptions,
} from '../../../types/member/review/review';

/**
 * Retry utility with exponential backoff
 */
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Review file service for handling review-related file operations
 */
export class ReviewFileService {
  /**
   * Upload single file for review
   * Endpoint: POST /api/pet-save/reviews/files/upload
   */
  static async uploadFile(
    file: File,
    metadata?: FileUploadMetadata
  ): Promise<ApiResponse<FileUploadResponse>> {
    try {
      console.log('Uploading file for review:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.post<FileUploadResponse>(
          '/reviews/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 seconds for file uploads
          }
        );
      });

      if (response.data) {
        console.log('File uploaded successfully');
        return { data: response.data, error: undefined };
      } else {
        return { data: null, error: 'Upload failed' };
      }
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload file after retries',
      };
    }
  }

  /**
   * Upload multiple files for review
   * Endpoint: POST /api/pet-save/reviews/files/upload/multiple
   */
  static async uploadMultipleFiles(
    files: File[],
    metadata?: FileUploadMetadata
  ): Promise<ApiResponse<MultipleFileUploadResponse>> {
    try {
      console.log('Uploading multiple files for review:', files.length);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.post<MultipleFileUploadResponse>(
          '/reviews/files/upload/multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 seconds for file uploads
          }
        );
      });

      if (response.data) {
        console.log('Multiple files uploaded successfully');
        return { data: response.data, error: undefined };
      } else {
        return { data: null, error: 'Multiple upload failed' };
      }
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload multiple files after retries',
      };
    }
  }

  /**
   * Attach uploaded files to entity
   * Endpoint: POST /api/pet-save/reviews/files/attach
   */
  static async attachFiles(
    entityId: string,
    fileIds: string[]
  ): Promise<ApiResponse<FileAttachmentResponse>> {
    try {
      console.log('Attaching files to entity:', entityId, fileIds);

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.post<FileAttachmentResponse>(
          `/reviews/files/attach?entityId=${entityId}`,
          fileIds,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });

      if (response.data) {
        console.log('Files attached successfully');
        return { data: response.data, error: undefined };
      } else {
        return { data: null, error: 'File attachment failed' };
      }
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to attach files after retries',
      };
    }
  }

  /**
   * Create upload URL for single file
   */
  static createUploadUrl(): string {
    return '/reviews/files/upload';
  }

  /**
   * Create multiple upload URL
   */
  static createMultipleUploadUrl(): string {
    return '/reviews/files/upload/multiple';
  }

  /**
   * Create file attachment URL
   */
  static createAttachmentUrl(entityId: string): string {
    return `/reviews/files/attach?entityId=${entityId}`;
  }

  /**
   * Get/Download file
   * Endpoint: GET /api/pet-save/reviews/files/{encryptedId}
   */
  static async getFile(
    encryptedId: string,
    options?: FileDownloadOptions
  ): Promise<ApiResponse<Blob>> {
    try {
      console.log('Getting review file:', encryptedId);

      const params = new URLSearchParams();
      if (options?.disposition) {
        params.append('disposition', options.disposition);
      }
      if (options?.type) {
        params.append('type', options.type);
      }

      const queryString = params.toString();
      const url = `/reviews/files/${encryptedId}${
        queryString ? `?${queryString}` : ''
      }`;

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.get(url, {
          responseType: 'blob',
          headers: options?.headers || {},
        });
      });

      if (response.data) {
        console.log('Review file retrieved successfully');
        return { data: response.data as Blob, error: undefined };
      } else {
        return { data: null, error: 'File retrieval failed' };
      }
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get file after retries',
      };
    }
  }

  /**
   * Delete file
   * Endpoint: DELETE /api/pet-save/reviews/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<FileDeleteResponse>> {
    try {
      console.log('Deleting review file:', encryptedId);

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.delete<FileDeleteResponse>(
          `/reviews/files/${encryptedId}`
        );
      });

      // For DELETE operations, success is indicated by the HTTP status, not necessarily response.data
      console.log('Review file deleted successfully');
      return { data: response.data, error: undefined };
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete file after retries',
      };
    }
  }

  /**
   * Get file info
   * Endpoint: GET /api/pet-save/reviews/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<FileInfoResponse>> {
    try {
      console.log('Getting review file info:', encryptedId);

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.get<FileInfoResponse>(
          `/reviews/files/${encryptedId}/info`
        );
      });

      if (response.data) {
        console.log('Review file info retrieved successfully');
        return { data: response.data, error: undefined };
      } else {
        return { data: null, error: 'File info retrieval failed' };
      }
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get file info after retries',
      };
    }
  }

  /**
   * Get file list by entity
   * Endpoint: GET /api/pet-save/reviews/files/list/{entityId}
   */
  static async getFileList(
    entityId: string
  ): Promise<ApiResponse<FileListResponse>> {
    try {
      console.log('Getting review file list for entity:', entityId);

      const response = await retryWithBackoff(async () => {
        return await apiClient.raw.get<FileListResponse>(
          `/reviews/files/list/${entityId}`
        );
      });

      if (response.data) {
        console.log('Review file list retrieved successfully');
        return { data: response.data, error: undefined };
      } else {
        return { data: null, error: 'File list retrieval failed' };
      }
    } catch (error) {
      console.error('Review file service error after retries:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get file list after retries',
      };
    }
  }

  /**
   * Create file download URL
   */
  static createFileUrl(
    encryptedId: string,
    options?: FileDownloadOptions
  ): string {
    const params = new URLSearchParams();
    if (options?.disposition) {
      params.append('disposition', options.disposition);
    }
    if (options?.type) {
      params.append('type', options.type);
    }

    const queryString = params.toString();
    return `/reviews/files/${encryptedId}${
      queryString ? `?${queryString}` : ''
    }`;
  }

  /**
   * Create file info URL
   */
  static createFileInfoUrl(encryptedId: string): string {
    return `/reviews/files/${encryptedId}/info`;
  }

  /**
   * Create file list URL
   */
  static createFileListUrl(entityId: string): string {
    return `/reviews/files/list/${entityId}`;
  }
}
