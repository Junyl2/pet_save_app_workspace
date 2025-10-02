import { apiClient, ApiResponse } from '../../../../apiClient';
import {
  FileUploadResponse,
  MultipleFileUploadResponse,
  FileAttachmentResponse,
  FileAttachmentRequest,
  FileMetadata,
  FileDownloadOptions,
  FileInfoResponse,
  FileListResponse,
  FileDeleteResponse,
} from '@/app/api/types/member/inquiry-details/fileInquiry';

/**
 * File inquiry service for handling file uploads and attachments
 */
export class InquiryFileService {
  /**
   * Upload a single file
   * Endpoint: POST /api/pet-save/inquiries/files/upload
   */
  static async uploadFile(
    file: File,
    metadata?: FileMetadata
  ): Promise<ApiResponse<FileUploadResponse>> {
    try {
      console.log('Uploading single file...', {
        filename: file.name,
        size: file.size,
        type: file.type,
        metadata,
      });

      const formData = new FormData();
      formData.append('file', file);

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await apiClient.post<FileUploadResponse>(
        '/inquiries/files/upload',
        formData
      );

      if (response.error) {
        console.error('File upload failed:', response.error);
        return response;
      }

      console.log('File uploaded successfully:', response.data);
      return response;
    } catch (error) {
      console.error('File upload service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  }

  /**
   * Upload multiple files
   * Endpoint: POST /api/pet-save/inquiries/files/upload/multiple
   */
  static async uploadMultipleFiles(
    files: File[],
    metadata?: FileMetadata
  ): Promise<ApiResponse<MultipleFileUploadResponse>> {
    try {
      console.log('Uploading multiple files...', {
        fileCount: files.length,
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        metadata,
      });

      const formData = new FormData();

      files.forEach((file) => {
        formData.append('files', file);
      });

      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await apiClient.post<MultipleFileUploadResponse>(
        '/inquiries/files/upload/multiple',
        formData
      );

      if (response.error) {
        console.error('Multiple file upload failed:', response.error);
        return response;
      }

      console.log('Multiple files uploaded successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Multiple file upload service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to upload files',
      };
    }
  }

  /**
   * Attach uploaded files to an entity
   * Endpoint: POST /api/pet-save/inquiries/files/attach?entityId={entityId}
   */
  static async attachFiles(
    entityId: string,
    fileIds: string[]
  ): Promise<ApiResponse<FileAttachmentResponse>> {
    try {
      console.log('Attaching files to entity...', {
        entityId,
        fileIds,
      });

      const requestData: FileAttachmentRequest = {
        fileIds,
      };

      const response = await apiClient.post<FileAttachmentResponse>(
        `/inquiries/files/attach?entityId=${entityId}`,
        requestData
      );

      if (response.error) {
        console.error('File attachment failed:', response.error);
        return response;
      }

      console.log('Files attached successfully:', response.data);
      return response;
    } catch (error) {
      console.error('File attachment service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to attach files',
      };
    }
  }

  /**
   * Upload and attach files in one operation
   * This is a convenience method that combines upload and attach operations
   */
  static async uploadAndAttachFiles(
    files: File[],
    entityId: string,
    metadata?: FileMetadata
  ): Promise<ApiResponse<MultipleFileUploadResponse>> {
    try {
      console.log('Uploading and attaching files...', {
        fileCount: files.length,
        entityId,
        metadata,
      });

      // First upload the files
      const uploadResponse = await this.uploadMultipleFiles(files, metadata);

      if (uploadResponse.error || !uploadResponse.data) {
        return uploadResponse;
      }

      // Extract file IDs from upload response
      const fileIds = uploadResponse.data.data.map((file) => file.fileId);

      // Then attach the files to the entity
      const attachResponse = await this.attachFiles(entityId, fileIds);

      if (attachResponse.error) {
        console.error(
          'File attachment failed after successful upload:',
          attachResponse.error
        );
        // Return the upload response even if attachment fails
        // The files are uploaded but not attached
        return {
          data: uploadResponse.data,
          error: `Files uploaded but attachment failed: ${attachResponse.error}`,
        };
      }

      console.log('Files uploaded and attached successfully');
      return uploadResponse;
    } catch (error) {
      console.error('Upload and attach service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload and attach files',
      };
    }
  }

  /**
   * Download or retrieve a file
   * Endpoint: GET /api/pet-save/inquiries/files/{encryptedId}
   */
  static async downloadFile(
    encryptedId: string,
    options?: FileDownloadOptions
  ): Promise<ApiResponse<Blob>> {
    try {
      console.log('Downloading file...', {
        encryptedId,
        options,
      });

      const params = new URLSearchParams();
      if (options?.disposition) {
        params.append('disposition', options.disposition);
      }
      if (options?.type) {
        params.append('type', options.type);
      }

      const url = `/inquiries/files/${encryptedId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      const headers: Record<string, string> = {};
      if (options?.ifNoneMatch) {
        headers['If-None-Match'] = options.ifNoneMatch;
      }
      if (options?.ifModifiedSince) {
        headers['If-Modified-Since'] = options.ifModifiedSince;
      }

      const response = await apiClient.getFile(url, {
        headers,
      });

      if (response.error) {
        console.error('File download failed:', response.error);
        return response;
      }

      console.log('File downloaded successfully');
      return response;
    } catch (error) {
      console.error('File download service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to download file',
      };
    }
  }

  /**
   * Get file information/metadata
   * Endpoint: GET /api/pet-save/inquiries/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<ApiResponse<FileInfoResponse>> {
    try {
      console.log('Getting file info...', {
        encryptedId,
      });

      const response = await apiClient.get<FileInfoResponse>(
        `/inquiries/files/${encryptedId}/info`
      );

      if (response.error) {
        console.error('Get file info failed:', response.error);
        return response;
      }

      console.log('File info retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Get file info service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get file info',
      };
    }
  }

  /**
   * Get list of files for an entity
   * Endpoint: GET /api/pet-save/inquiries/files/list/{entityId}
   */
  static async getEntityFiles(
    entityId: string
  ): Promise<ApiResponse<FileListResponse>> {
    try {
      console.log('Getting entity files...', {
        entityId,
      });

      const response = await apiClient.get<FileListResponse>(
        `/inquiries/files/list/${entityId}`
      );

      if (response.error) {
        console.error('Get entity files failed:', response.error);
        return response;
      }

      console.log('Entity files retrieved successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Get entity files service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get entity files',
      };
    }
  }

  /**
   * Delete a file
   * Endpoint: DELETE /api/pet-save/inquiries/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<FileDeleteResponse>> {
    try {
      console.log('Deleting file...', {
        encryptedId,
      });

      const response = await apiClient.delete<FileDeleteResponse>(
        `/inquiries/files/${encryptedId}`
      );

      if (response.error) {
        console.error('File deletion failed:', response.error);
        return response;
      }

      console.log('File deleted successfully:', response.data);
      return response;
    } catch (error) {
      console.error('File deletion service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete file',
      };
    }
  }
}
