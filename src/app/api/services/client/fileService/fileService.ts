import { apiClient, ApiResponse } from '../../../apiClient';
import { FileInfo, FileApiResponse } from '../../../types/file/file';

/** Response shape for DELETE /files/{encryptedId} */
type DeleteFileResponse = { deleted: boolean };

/**
 * File service for handling file-related operations
 */
export class FileService {
  /**
   * Get/Download file
   * Endpoint: GET /api/pet-save/auth/files/{encryptedId}
   */
  static async getFile(
    encryptedId: string,
    options?: {
      disposition?: string;
      type?: string;
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<Blob>> {
    try {
      console.log('Getting file:', encryptedId);
      const response = await apiClient.getFile(`/auth/files/${encryptedId}`, {
        disposition: options?.disposition || 'inline',
        type: options?.type || 'original',
        headers: options?.headers || {},
      });

      if (response.error) {
        console.error('Get file failed:', response.error);
        return response;
      }

      console.log('File retrieved successfully');
      return response;
    } catch (error) {
      console.error('File service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to get file',
      };
    }
  }

  /**
   * Delete file
   * Endpoint: DELETE /api/pet-save/auth/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<DeleteFileResponse>> {
    try {
      console.log('Deleting file:', encryptedId);
      const response = await apiClient.delete<DeleteFileResponse>(
        `/auth/files/${encryptedId}`
      );

      if (response.error) {
        console.error('Delete file failed:', response.error);
        return response;
      }

      console.log('File deleted successfully');
      return response;
    } catch (error) {
      console.error('File service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      };
    }
  }

  /**
   * Get file info
   * Endpoint: GET /api/pet-save/auth/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<FileApiResponse & { data: FileInfo }>> {
    try {
      console.log('Getting file info:', encryptedId);
      const response = await apiClient.get<
        FileApiResponse & { data: FileInfo }
      >(`/auth/files/${encryptedId}/info`);

      if (response.error) {
        console.error('Get file info failed:', response.error);
        return response;
      }

      console.log('File info retrieved successfully');
      return response;
    } catch (error) {
      console.error('File service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get file info',
      };
    }
  }

  /**
   * Get file list by entity
   * Endpoint: GET /api/pet-save/auth/files/list/{entityId}
   */
  static async getFileList(entityId: string): Promise<ApiResponse<FileInfo[]>> {
    try {
      console.log('Getting file list for entity:', entityId);
      const response = await apiClient.get<FileInfo[]>(
        `/auth/files/list/${entityId}`
      );

      if (response.error) {
        console.error('Get file list failed:', response.error);
        return response;
      }

      console.log('File list retrieved successfully');
      return response;
    } catch (error) {
      console.error('File service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get file list',
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
    return `/auth/files/${encryptedId}${queryString ? `?${queryString}` : ''}`;
  }

  /** Create file info URL */
  static createFileInfoUrl(encryptedId: string): string {
    return `/auth/files/${encryptedId}/info`;
  }

  /** Create file list URL */
  static createFileListUrl(entityId: string): string {
    return `/auth/files/list/${entityId}`;
  }
}
