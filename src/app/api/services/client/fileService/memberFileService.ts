import { apiClient, ApiResponse } from '../../../apiClient';
import {
  MemberFileUploadData,
  MemberFileMetadata,
  MemberFileUploadResponse,
  MemberMultipleFileUploadResponse,
  MemberFileAttachResponse,
  MemberFileInfoResponse,
  /*   MemberFileListResponse, */
  MemberFileDeleteResponse,
} from '../../../types/file/memberFile';
import { isAxiosError, AxiosError, AxiosResponse } from 'axios';

/**
 * Member file service for handling member file operations
 */
export class MemberFileService {
  /**
   * Upload a single file for member
   * Endpoint: POST /api/pet-save/members/files/upload
   */
  static async uploadFile(
    file: File,
    metadata?: MemberFileMetadata,
    retryCount: number = 2
  ): Promise<{
    data: MemberFileUploadData | null;
    error: string | null;
  }> {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        data: null,
        error: '파일 크기가 10MB를 초과합니다.',
      };
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        data: null,
        error: '지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF, PDF만 허용)',
      };
    }

    // Retry logic
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        console.log(
          `Uploading member file (attempt ${attempt + 1}/${retryCount + 1}):`,
          file.name,
          'Size:',
          file.size,
          'Type:',
          file.type
        );

        const formData = new FormData();
        formData.append('file', file);

        // Add metadata if provided
        if (metadata) {
          formData.append('metadata', JSON.stringify(metadata));
        }

        const response: AxiosResponse<MemberFileUploadResponse> =
          await apiClient.raw.post<MemberFileUploadResponse>(
            '/members/files/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000, // 30 seconds timeout for file uploads
            }
          );

        console.log('Member file upload response:', response.data);

        if (response.data?.success && response.data?.data) {
          console.log(
            'Member file upload successful, file ID:',
            response.data.data.fileId
          );
          return {
            data: response.data.data,
            error: null,
          };
        } else {
          console.error(
            'Unexpected member file upload response structure:',
            response.data
          );
          if (attempt < retryCount) {
            console.log(
              `Retrying upload due to unexpected response (attempt ${
                attempt + 2
              }/${retryCount + 1})...`
            );
            continue;
          }
          return { data: null, error: 'Unexpected response structure' };
        }
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          const axErr = error as AxiosError<{ resultMsg?: string }>;
          console.error(
            `Member file upload attempt ${attempt + 1} failed:`,
            axErr
          );
          console.error('Error response:', axErr.response);
          console.error('Error status:', axErr.response?.status);
          console.error('Error data:', axErr.response?.data);

          // If this is the last attempt, return the error
          if (attempt === retryCount) {
            const status = axErr.response?.status;
            if (status === 500) {
              return {
                data: null,
                error:
                  '파일 업로드 서버에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
              };
            } else if (status === 413) {
              return {
                data: null,
                error:
                  '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.',
              };
            } else if (status === 415) {
              return {
                data: null,
                error: '지원되지 않는 파일 형식입니다.',
              };
            } else if (axErr.response?.data?.resultMsg) {
              return {
                data: null,
                error: axErr.response.data.resultMsg,
              };
            } else {
              return {
                data: null,
                error: axErr.message || '파일 업로드 중 오류가 발생했습니다.',
              };
            }
          } else {
            console.log(
              `Retrying upload (attempt ${attempt + 2}/${retryCount + 1})...`
            );
            // Wait a bit before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (attempt + 1))
            );
          }
        } else {
          // Non-Axios error
          console.error(
            `Member file upload attempt ${attempt + 1} failed:`,
            error
          );
          if (attempt === retryCount) {
            return {
              data: null,
              error: '파일 업로드 중 오류가 발생했습니다.',
            };
          } else {
            console.log(
              `Retrying upload (attempt ${attempt + 2}/${retryCount + 1})...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (attempt + 1))
            );
          }
        }
      }
    }

    // This should never be reached, but just in case
    return {
      data: null,
      error: 'Member file upload failed after all retry attempts',
    };
  }

  /**
   * Upload multiple files for member
   * Endpoint: POST /api/pet-save/members/files/upload/multiple
   */
  static async uploadFiles(
    files: File[],
    metadata?: MemberFileMetadata
  ): Promise<{ data: MemberFileUploadData[] | null; error: string | null }> {
    try {
      console.log('Uploading multiple member files:', files.length);

      // Validate all files
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
      ];

      for (const file of files) {
        if (file.size > maxSize) {
          return {
            data: null,
            error: `파일 "${file.name}"의 크기가 10MB를 초과합니다.`,
          };
        }
        if (!allowedTypes.includes(file.type)) {
          return {
            data: null,
            error: `파일 "${file.name}"은 지원되지 않는 형식입니다. (JPEG, PNG, GIF, PDF만 허용)`,
          };
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response: AxiosResponse<MemberMultipleFileUploadResponse> =
        await apiClient.raw.post<MemberMultipleFileUploadResponse>(
          '/members/files/upload/multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 seconds timeout for file uploads
          }
        );

      console.log('Multiple member files upload response:', response.data);

      if (response.data?.success && response.data?.data) {
        console.log('Multiple member files uploaded successfully');
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: 'Multiple member file upload failed' };
      }
    } catch (error: unknown) {
      console.error('Multiple member file upload error:', error);
      const message = isAxiosError(error)
        ? (error as AxiosError).message
        : 'Multiple member file upload failed';
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Attach uploaded files to member entity
   * Endpoint: POST /api/pet-save/members/files/attach
   */
  static async attachFiles(
    entityId: string,
    fileIds: string[]
  ): Promise<{ data: unknown | null; error: string | null }> {
    try {
      console.log('Attaching member files to entity:', entityId, fileIds);

      const response = await apiClient.post<MemberFileAttachResponse>(
        `/members/files/attach?entityId=${encodeURIComponent(entityId)}`,
        fileIds
      );

      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        (response.data as MemberFileAttachResponse).success
      ) {
        console.log('Member files attached successfully');
        return {
          data: (response.data as MemberFileAttachResponse).data,
          error: null,
        };
      } else {
        return { data: null, error: 'Member file attachment failed' };
      }
    } catch (error: unknown) {
      console.error('Member file attachment error:', error);
      const message = isAxiosError(error)
        ? (error as AxiosError).message
        : 'Member file attachment failed';
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Get/Download member file
   * Endpoint: GET /api/pet-save/members/files/{encryptedId}
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
      console.log('Getting member file:', encryptedId);
      const response = await apiClient.getFile(
        `/members/files/${encryptedId}`,
        {
          disposition: options?.disposition || 'inline',
          type: options?.type || 'original',
          headers: options?.headers || {},
        }
      );

      if (response.error) {
        console.error('Get member file failed:', response.error);
        return response;
      }

      console.log('Member file retrieved successfully');
      return response;
    } catch (error) {
      console.error('Member file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to get member file',
      };
    }
  }

  /**
   * Delete member file
   * Endpoint: DELETE /api/pet-save/members/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<MemberFileDeleteResponse>> {
    try {
      console.log('Deleting member file:', encryptedId);
      const response = await apiClient.delete<MemberFileDeleteResponse>(
        `/members/files/${encryptedId}`
      );

      if (response.error) {
        console.error('Delete member file failed:', response.error);
        return response;
      }

      console.log('Member file deleted successfully');
      return response;
    } catch (error) {
      console.error('Member file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete member file',
      };
    }
  }

  /**
   * Get member file info
   * Endpoint: GET /api/pet-save/members/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<
    ApiResponse<MemberFileInfoResponse & { data: MemberFileUploadData }>
  > {
    try {
      console.log('Getting member file info:', encryptedId);
      const response = await apiClient.get<
        MemberFileInfoResponse & { data: MemberFileUploadData }
      >(`/members/files/${encryptedId}/info`);

      if (response.error) {
        console.error('Get member file info failed:', response.error);
        return response;
      }

      console.log('Member file info retrieved successfully');
      return response;
    } catch (error) {
      console.error('Member file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get member file info',
      };
    }
  }

  /**
   * Get member file list by entity
   * Endpoint: GET /api/pet-save/members/files/list/{entityId}
   */
  static async getFileList(
    entityId: string
  ): Promise<ApiResponse<MemberFileUploadData[]>> {
    try {
      console.log('Getting member file list for entity:', entityId);
      const response = await apiClient.get<MemberFileUploadData[]>(
        `/members/files/list/${entityId}`
      );

      if (response.error) {
        console.error('Get member file list failed:', response.error);
        return response;
      }

      console.log('Member file list retrieved successfully');
      return response;
    } catch (error) {
      console.error('Member file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get member file list',
      };
    }
  }

  /**
   * Create download URL for member file
   */
  static createDownloadUrl(
    encryptedId: string,
    options?: { disposition?: string; type?: string }
  ): string {
    const params = new URLSearchParams();
    if (options?.disposition) params.append('disposition', options.disposition);
    if (options?.type) params.append('type', options.type);

    const queryString = params.toString();
    return `/members/files/${encryptedId}${
      queryString ? `?${queryString}` : ''
    }`;
  }

  /**
   * Create file info URL for member file
   */
  static createFileInfoUrl(encryptedId: string): string {
    return `/members/files/${encryptedId}/info`;
  }

  /**
   * Create file list URL for member entity
   */
  static createFileListUrl(entityId: string): string {
    return `/members/files/list/${entityId}`;
  }
}
