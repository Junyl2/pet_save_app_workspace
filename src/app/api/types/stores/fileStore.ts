/**
 * Store file upload types and interfaces
 */

/**
 * File metadata interface for store file operations
 */
export interface StoreFileMetadata {
  entityType?: string;
  entityId?: string;
  documentType?: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Uploaded file information for store files
 */
export interface StoreFileInfo {
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

/**
 * Single file upload request
 */
export interface StoreFileUploadRequest {
  file: File;
  metadata?: StoreFileMetadata;
}

/**
 * Multiple file upload request
 */
export interface StoreMultipleFileUploadRequest {
  files: File[];
  metadata?: StoreFileMetadata;
}

/**
 * File attach request
 */
export interface StoreFileAttachRequest {
  fileIds: string[];
}

/**
 * Single file upload response
 */
export interface StoreFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreFileInfo;
  errorId: string | null;
}

/**
 * Multiple file upload response
 */
export interface StoreMultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreFileInfo[];
  errorId: string | null;
}

/**
 * File attach response
 */
export interface StoreFileAttachResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId: string | null;
}

/**
 * File info response
 */
export interface StoreFileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreFileInfo;
  errorId: string | null;
}

/**
 * File list response
 */
export interface StoreFileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: StoreFileInfo[];
  errorId: string | null;
}

/**
 * File delete response
 */
export interface StoreFileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId: string | null;
}

/**
 * File download options
 */
export interface StoreFileDownloadOptions {
  disposition?: 'inline' | 'attachment';
  type?: 'original' | 'thumbnail';
  headers?: Record<string, string>;
}
