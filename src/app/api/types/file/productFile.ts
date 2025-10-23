/**
 * File upload types for product file operations
 */

export interface FileMetadata {
  [key: string]: unknown;
}

export interface UploadedFile {
  fileId: string;
  encryptedId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  fileExtension: string;
  url: string;
  uploadedAt: string;
  isAttached: boolean;
  entityType: string;
  entityId: string;
  width?: number;
  height?: number;
  hasThumbnail: boolean;
  documentType?: string;
  pageCount?: number;
  isTextExtractable?: boolean;
}

export interface FileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile;
  errorId?: string;
}

export interface MultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile[];
  errorId?: string;
}

export interface FileAttachResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

export interface FileUploadRequest {
  file: File;
  metadata?: FileMetadata;
}

export interface MultipleFileUploadRequest {
  files: File[];
  metadata?: FileMetadata;
}

export interface FileAttachRequest {
  fileIds: string[];
}

export interface FileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile;
  errorId?: string;
}

export interface FileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile[];
  errorId?: string;
}

export interface FileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

export interface FileDownloadOptions {
  disposition?: 'inline' | 'attachment';
  type?: 'original' | 'thumbnail';
  ifNoneMatch?: string;
  ifModifiedSince?: string;
}
