import { apiClient } from '../apiClient';

export interface FileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
    fileId: string;
    fileName: string;
    fileUrl?: string;
  };
  errorId: string | null;
}

export interface FileUploadErrorResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: null;
  errorId: string;
}

/**
 * File upload service for handling file uploads and getting file IDs
 */
export class FileUploadService {
  /**
   * Upload a file and get the file ID
   * @param file - The file to upload
   * @returns Promise with file ID or error
   */
  static async uploadFile(
    file: File
  ): Promise<{ data: string | null; error: string | null }> {
    try {
      console.log(
        'Uploading file:',
        file.name,
        'Size:',
        file.size,
        'Type:',
        file.type
      );

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return {
          data: null,
          error: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.',
        };
      }

      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        return { data: null, error: '이미지 파일만 업로드 가능합니다.' };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<FileUploadResponse>(
        '/file/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('File upload response:', response);

      if (response.error) {
        console.error('File upload failed:', response.error);

        // Provide more specific error messages
        if (
          response.error.includes('500') ||
          response.error.includes('서버 내부 오류')
        ) {
          return {
            data: null,
            error:
              '파일 업로드 서버에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
          };
        } else if (
          response.error.includes('413') ||
          response.error.includes('Request Entity Too Large')
        ) {
          return {
            data: null,
            error: '파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.',
          };
        } else if (
          response.error.includes('415') ||
          response.error.includes('Unsupported Media Type')
        ) {
          return {
            data: null,
            error: '지원하지 않는 파일 형식입니다. 이미지 파일을 선택해주세요.',
          };
        }

        return { data: null, error: response.error };
      }

      if (response.data?.success && response.data?.data?.fileId) {
        console.log(
          'File upload successful, file ID:',
          response.data.data.fileId
        );
        return { data: response.data.data.fileId, error: null };
      } else {
        console.error(
          'Unexpected file upload response structure:',
          response.data
        );
        return { data: null, error: 'Unexpected response structure' };
      }
    } catch (error) {
      console.error('File upload service error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'File upload failed',
      };
    }
  }

  /**
   * Upload multiple files and get their file IDs
   * @param files - Array of files to upload
   * @returns Promise with array of file IDs or error
   */
  static async uploadFiles(
    files: File[]
  ): Promise<{ data: string[] | null; error: string | null }> {
    try {
      console.log('Uploading multiple files:', files.length);

      const uploadPromises = files.map((file) => this.uploadFile(file));
      const results = await Promise.all(uploadPromises);

      // Check if any uploads failed
      const failedUploads = results.filter((result) => result.error);
      if (failedUploads.length > 0) {
        console.error('Some file uploads failed:', failedUploads);
        return {
          data: null,
          error: `Failed to upload ${failedUploads.length} files`,
        };
      }

      const fileIds = results
        .map((result) => result.data)
        .filter(Boolean) as string[];
      console.log('All files uploaded successfully, file IDs:', fileIds);
      return { data: fileIds, error: null };
    } catch (error) {
      console.error('Multiple file upload service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Multiple file upload failed',
      };
    }
  }
}
