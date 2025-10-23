/**
 * Member file upload data interface
 */
export interface MemberFileUploadData {
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
 * Member file metadata interface
 */
export interface MemberFileMetadata {
  entityType?: string;
  entityId?: string;
  [key: string]: unknown;
}

/**
 * Member file upload response interface
 */
export interface MemberFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: MemberFileUploadData;
  errorId: string | null;
}

/**
 * Member multiple file upload response interface
 */
export interface MemberMultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: MemberFileUploadData[];
  errorId: string | null;
}

/**
 * Member file attach response interface
 */
export interface MemberFileAttachResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId: string | null;
}

/**
 * Member file info response interface
 */
export interface MemberFileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: MemberFileUploadData;
  errorId: string | null;
}

/**
 * Member file list response interface
 */
export interface MemberFileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: MemberFileUploadData[];
  errorId: string | null;
}

/**
 * Member file delete response interface
 */
export interface MemberFileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId: string | null;
}
