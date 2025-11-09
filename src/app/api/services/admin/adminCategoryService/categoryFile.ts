export interface CategoryFileMetadata {
  [key: string]: unknown;
}

export interface CategoryUploadedFile {
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

export interface CategoryFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: CategoryUploadedFile;
  errorId?: string;
}

export interface CategoryMultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: CategoryUploadedFile[];
  errorId?: string;
}

export interface CategoryFileAttachResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

export interface CategoryFileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: CategoryUploadedFile;
  errorId?: string;
}

export interface CategoryFileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: CategoryUploadedFile[];
  errorId?: string;
}

export interface CategoryFileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

export interface CategoryFileUploadRequest {
  file: File;
  metadata?: CategoryFileMetadata;
}

export interface CategoryMultipleFileUploadRequest {
  files: File[];
  metadata?: CategoryFileMetadata;
}

export interface CategoryFileAttachRequest {
  fileIds: string[];
}

export interface CategoryFileDownloadOptions {
  disposition?: 'inline' | 'attachment';
  type?: 'original' | 'thumbnail';
  ifNoneMatch?: string;
  ifModifiedSince?: string;
}
