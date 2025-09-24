/**
 * File information interface
 */
export interface FileInfo {
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
 * File API response interface
 */
export interface FileApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: FileInfo;
  errorId: string | null;
}

/**
 * File upload response interface
 */
export interface FileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: {
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
  };
  errorId: string | null;
}

/**
 * File upload error response interface
 * `data` can either be null or contain arbitrary key-value pairs
 */
export interface FileUploadErrorResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown> | null; // fixed: no more `any`
  errorId: string;
}
