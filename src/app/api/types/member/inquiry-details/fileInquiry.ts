/**
 * File inquiry related types for member inquiries
 */

/**
 * File metadata for upload requests
 */
export interface FileMetadata {
  entityType?: string;
  entityId?: string;
  documentType?: string;
  description?: string;
}

/**
 * Uploaded file information
 */
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
  entityType?: string;
  entityId?: string;
  width?: number;
  height?: number;
  hasThumbnail: boolean;
  documentType?: string;
  pageCount?: number;
  isTextExtractable?: boolean;
}

/**
 * Single file upload response
 */
export interface FileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile;
  errorId?: string;
}

/**
 * Multiple file upload response
 */
export interface MultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile[];
  errorId?: string;
}

/**
 * File attachment request
 */
export interface FileAttachmentRequest {
  fileIds: string[];
}

/**
 * File attachment response
 */
export interface FileAttachmentResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId?: string;
}

/**
 * File upload form data
 */
export interface FileUploadFormData {
  file: File;
  metadata?: FileMetadata;
}

/**
 * Multiple file upload form data
 */
export interface MultipleFileUploadFormData {
  files: File[];
  metadata?: FileMetadata;
}

/**
 * File download options
 */
export interface FileDownloadOptions {
  disposition?: 'inline' | 'attachment';
  type?: 'original' | 'thumbnail';
  ifNoneMatch?: string;
  ifModifiedSince?: string;
}

/**
 * File info response
 */
export interface FileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile;
  errorId?: string;
}

/**
 * File list response
 */
export interface FileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: UploadedFile[];
  errorId?: string;
}

/**
 * File delete response
 */
export interface FileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: object;
  errorId?: string;
}
