import { apiClient, ApiResponse } from '../../../apiClient';
import {
  BusinessFileUploadResponse,
  BusinessMultipleFileUploadResponse,
  BusinessFileAttachResponse,
  BusinessFileInfoResponse,
  /*   BusinessFileListResponse, */
  BusinessFileDeleteResponse,
  BusinessFileMetadata,
  BusinessFileUploadData,
} from '../../../types/auth/BusinessRegistration';
import { isAxiosError, AxiosError, AxiosResponse } from 'axios';

/**
 * Business file service for handling business registration file operations
 */
export class BusinessFileService {
  /**
   * Upload a single file for business registration
   * Endpoint: POST /api/pet-save/business-registrations/files/upload
   */
  static async uploadFile(
    file: File,
    metadata?: BusinessFileMetadata,
    retryCount: number = 2
  ): Promise<{
    data: BusinessFileUploadData | null;
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
          `Uploading business file (attempt ${attempt + 1}/${retryCount + 1}):`,
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

        const response: AxiosResponse<BusinessFileUploadResponse> =
          await apiClient.raw.post<BusinessFileUploadResponse>(
            '/business-registrations/files/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

        console.log('Business file upload response:', response.data);

        if (response.data?.success && response.data?.data) {
          console.log(
            'Business file upload successful, file ID:',
            response.data.data.fileId
          );
          return {
            data: response.data.data,
            error: null,
          };
        } else {
          console.error(
            'Unexpected business file upload response structure:',
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
            `Business file upload attempt ${attempt + 1} failed:`,
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
            `Business file upload attempt ${attempt + 1} failed:`,
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
      error: 'Business file upload failed after all retry attempts',
    };
  }

  /**
   * Upload multiple files for business registration
   * Endpoint: POST /api/pet-save/business-registrations/files/upload/multiple
   */
  static async uploadFiles(
    files: File[],
    metadata?: BusinessFileMetadata
  ): Promise<{ data: BusinessFileUploadData[] | null; error: string | null }> {
    try {
      console.log('Uploading multiple business files:', files.length);

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

      const response: AxiosResponse<BusinessMultipleFileUploadResponse> =
        await apiClient.raw.post<BusinessMultipleFileUploadResponse>(
          '/business-registrations/files/upload/multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

      console.log('Multiple business files upload response:', response.data);

      if (response.data?.success && response.data?.data) {
        console.log('Multiple business files uploaded successfully');
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: 'Multiple business file upload failed' };
      }
    } catch (error: unknown) {
      console.error('Multiple business file upload error:', error);
      const message = isAxiosError(error)
        ? (error as AxiosError).message
        : 'Multiple business file upload failed';
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Attach uploaded files to business registration entity
   * Endpoint: POST /api/pet-save/business-registrations/files/attach
   */
  static async attachFiles(
    entityId: string,
    fileIds: string[]
  ): Promise<{ data: unknown | null; error: string | null }> {
    try {
      console.log('Attaching business files to entity:', entityId, fileIds);

      const response = await apiClient.post<BusinessFileAttachResponse>(
        `/business-registrations/files/attach?entityId=${encodeURIComponent(
          entityId
        )}`,
        fileIds
      );

      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        (response.data as BusinessFileAttachResponse).success
      ) {
        console.log('Business files attached successfully');
        return {
          data: (response.data as BusinessFileAttachResponse).data,
          error: null,
        };
      } else {
        return { data: null, error: 'Business file attachment failed' };
      }
    } catch (error: unknown) {
      console.error('Business file attachment error:', error);
      const message = isAxiosError(error)
        ? (error as AxiosError).message
        : 'Business file attachment failed';
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Get/Download business file
   * Endpoint: GET /api/pet-save/business-registrations/files/{encryptedId}
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
      console.log('Getting business file:', encryptedId);
      const response = await apiClient.getFile(
        `/business-registrations/files/${encryptedId}`,
        {
          disposition: options?.disposition || 'inline',
          type: options?.type || 'original',
          headers: options?.headers || {},
        }
      );

      if (response.error) {
        console.error('Get business file failed:', response.error);
        return response;
      }

      console.log('Business file retrieved successfully');
      return response;
    } catch (error) {
      console.error('Business file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get business file',
      };
    }
  }

  /**
   * Delete business file
   * Endpoint: DELETE /api/pet-save/business-registrations/files/{encryptedId}
   */
  static async deleteFile(
    encryptedId: string
  ): Promise<ApiResponse<BusinessFileDeleteResponse>> {
    try {
      console.log('Deleting business file:', encryptedId);
      const response = await apiClient.delete<BusinessFileDeleteResponse>(
        `/business-registrations/files/${encryptedId}`
      );

      if (response.error) {
        console.error('Delete business file failed:', response.error);
        return response;
      }

      console.log('Business file deleted successfully');
      return response;
    } catch (error) {
      console.error('Business file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete business file',
      };
    }
  }

  /**
   * Get business file info
   * Endpoint: GET /api/pet-save/business-registrations/files/{encryptedId}/info
   */
  static async getFileInfo(
    encryptedId: string
  ): Promise<
    ApiResponse<BusinessFileInfoResponse & { data: BusinessFileUploadData }>
  > {
    try {
      console.log('Getting business file info:', encryptedId);
      const response = await apiClient.get<
        BusinessFileInfoResponse & { data: BusinessFileUploadData }
      >(`/business-registrations/files/${encryptedId}/info`);

      if (response.error) {
        console.error('Get business file info failed:', response.error);
        return response;
      }

      console.log('Business file info retrieved successfully');
      return response;
    } catch (error) {
      console.error('Business file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get business file info',
      };
    }
  }

  /**
   * Get business file list by entity
   * Endpoint: GET /api/pet-save/business-registrations/files/list/{entityId}
   */
  static async getFileList(
    entityId: string
  ): Promise<ApiResponse<BusinessFileUploadData[]>> {
    try {
      console.log('Getting business file list for entity:', entityId);
      const response = await apiClient.get<BusinessFileUploadData[]>(
        `/business-registrations/files/list/${entityId}`
      );

      if (response.error) {
        console.error('Get business file list failed:', response.error);
        return response;
      }

      console.log('Business file list retrieved successfully');
      return response;
    } catch (error) {
      console.error('Business file service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get business file list',
      };
    }
  }

  /**
   * Create download URL for business file
   */
  static createDownloadUrl(
    encryptedId: string,
    options?: { disposition?: string; type?: string }
  ): string {
    const params = new URLSearchParams();
    if (options?.disposition) params.append('disposition', options.disposition);
    if (options?.type) params.append('type', options.type);

    const queryString = params.toString();
    return `/business-registrations/files/${encryptedId}${
      queryString ? `?${queryString}` : ''
    }`;
  }

  /**
   * Create file info URL for business file
   */
  static createFileInfoUrl(encryptedId: string): string {
    return `/business-registrations/files/${encryptedId}/info`;
  }

  /**
   * Create file list URL for business entity
   */
  static createFileListUrl(entityId: string): string {
    return `/business-registrations/files/list/${entityId}`;
  }

  /**
   * Test business file upload endpoint accessibility
   */
  static async testBusinessFileUploadEndpoint(): Promise<boolean> {
    try {
      console.log('Testing business file upload endpoint accessibility...');

      // Create a small test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = await this.uploadFile(testFile);

      if (result.error) {
        console.log('Business file upload endpoint test failed:', result.error);
        return false;
      } else {
        console.log('Business file upload endpoint test successful');
        return true;
      }
    } catch (error) {
      console.error('Business file upload endpoint test error:', error);
      return false;
    }
  }
}
