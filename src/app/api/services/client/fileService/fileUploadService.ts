import { apiClient } from '../../../apiClient';
import { FileUploadResponse } from '../../../types/file/file';
import { isAxiosError, AxiosError, AxiosResponse } from 'axios';

/**
 * Narrow types used by this service
 */
type UploadSuccessData = { fileId: string; encryptedId: string };
type FileInfoResponse = { success: boolean; data: unknown };
type MultipleUploadResponse = { success: boolean; data: UploadSuccessData[] };
type AttachFilesResponse<T = unknown> = { success: boolean; data: T };

/**
 * File upload service for handling file uploads
 */
export class FileUploadService {
  /**
   * Upload a single file
   * Endpoint: POST /api/pet-save/auth/files/upload
   */
  static async uploadFile(
    file: File,
    retryCount: number = 2
  ): Promise<{
    data: { fileId: string; encryptedId: string } | null;
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
          `Uploading file (attempt ${attempt + 1}/${retryCount + 1}):`,
          file.name,
          'Size:',
          file.size,
          'Type:',
          file.type
        );

        const formData = new FormData();
        formData.append('file', file);

        // Use the correct API endpoint from the documentation
        console.log('Uploading file to /auth/files/upload');
        const response: AxiosResponse<FileUploadResponse> =
          await apiClient.raw.post<FileUploadResponse>(
            '/auth/files/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

        console.log('File upload response:', response.data);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.data?.success && response.data?.data?.fileId) {
          const { fileId, encryptedId } = response.data
            .data as UploadSuccessData;
          console.log('File upload successful, file ID:', fileId);

          // Verify the file was actually stored by getting file info
          try {
            console.log('Verifying file storage by getting file info...');
            const fileInfoResponse = await apiClient.get<FileInfoResponse>(
              `/auth/files/${encryptedId}/info`
            );

            if (fileInfoResponse.data?.success) {
              console.log(
                'File verification successful:',
                fileInfoResponse.data.data
              );
              return {
                data: { fileId, encryptedId },
                error: null,
              };
            } else {
              console.error(
                'File verification failed - file not found after upload'
              );
              if (attempt < retryCount) {
                console.log(
                  `Retrying upload (attempt ${attempt + 2}/${
                    retryCount + 1
                  })...`
                );
                continue;
              }
              return {
                data: null,
                error:
                  '파일이 업로드되었지만 서버에서 찾을 수 없습니다. 다시 시도해주세요.',
              };
            }
          } catch (verifyError: unknown) {
            console.error('File verification error:', verifyError);
            if (attempt < retryCount) {
              console.log(
                `Retrying upload due to verification error (attempt ${
                  attempt + 2
                }/${retryCount + 1})...`
              );
              continue;
            }
            return {
              data: null,
              error:
                '파일 업로드 확인 중 오류가 발생했습니다. 다시 시도해주세요.',
            };
          }
        } else {
          console.error(
            'Unexpected file upload response structure:',
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
        // Detailed logging without using 'any'
        if (isAxiosError(error)) {
          const axErr = error as AxiosError<{ resultMsg?: string }>;
          console.error(`File upload attempt ${attempt + 1} failed:`, axErr);
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
          console.error(`File upload attempt ${attempt + 1} failed:`, error);
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
      error: 'File upload failed after all retry attempts',
    };
  }

  /**
   * Upload multiple files
   * Endpoint: POST /api/pet-save/auth/files/upload/multiple
   */
  static async uploadFiles(
    files: File[]
  ): Promise<{ data: UploadSuccessData[] | null; error: string | null }> {
    try {
      console.log('Uploading multiple files:', files.length);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response: AxiosResponse<MultipleUploadResponse> =
        await apiClient.raw.post<MultipleUploadResponse>(
          '/auth/files/upload/multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

      if (response.data?.success && response.data?.data) {
        console.log('Multiple files uploaded successfully');
        return { data: response.data.data, error: null };
      } else {
        return { data: null, error: 'Multiple file upload failed' };
      }
    } catch (error: unknown) {
      console.error('Multiple file upload error:', error);
      const message = isAxiosError(error)
        ? (error as AxiosError).message
        : 'Multiple file upload failed';
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Attach files to entity
   * Endpoint: POST /api/pet-save/auth/files/attach
   */
  static async attachFiles(
    entityId: string,
    fileIds: string[]
  ): Promise<{ data: unknown | null; error: string | null }> {
    try {
      console.log('Attaching files to entity:', entityId, fileIds);

      const response = await apiClient.post<AttachFilesResponse>(
        `/auth/files/attach?entityId=${encodeURIComponent(entityId)}`,
        fileIds
      );

      if (
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data &&
        (response.data as AttachFilesResponse).success
      ) {
        console.log('Files attached successfully');
        return {
          data: (response.data as AttachFilesResponse).data,
          error: null,
        };
      } else {
        return { data: null, error: 'File attachment failed' };
      }
    } catch (error: unknown) {
      console.error('File attachment error:', error);
      const message = isAxiosError(error)
        ? (error as AxiosError).message
        : 'File attachment failed';
      return {
        data: null,
        error: message,
      };
    }
  }

  /**
   * Test file upload endpoint accessibility
   */
  static async testFileUploadEndpoint(): Promise<boolean> {
    try {
      console.log('Testing file upload endpoint accessibility...');

      // Create a small test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = await this.uploadFile(testFile);

      if (result.error) {
        console.log('File upload endpoint test failed:', result.error);
        return false;
      } else {
        console.log('File upload endpoint test successful');
        return true;
      }
    } catch (error) {
      console.error('File upload endpoint test error:', error);
      return false;
    }
  }
}
