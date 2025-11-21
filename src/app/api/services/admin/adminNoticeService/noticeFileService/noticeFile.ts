/**
 * ====== REQUEST TYPES ======
 */
export interface NoticeFileUploadRequest {
  file: File;
  metadata?: Record<string, unknown>;
}

export interface NoticeMultipleFileUploadRequest {
  files: File[];
  metadata?: Record<string, unknown>;
}

export interface NoticeFileAttachRequest {
  entityId: string;
  fileIds: string[];
}

/**
 * ====== CORE FILE DATA ======
 */
export interface NoticeFileData {
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
  entityType: string | null;
  entityId: string | null;
  width?: number;
  height?: number;
  hasThumbnail?: boolean;
  documentType?: string;
  pageCount?: number;
  isTextExtractable?: boolean;
}

/**
 * ====== RESPONSE TYPES ======
 */
export interface NoticeFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: NoticeFileData;
  errorId?: string;
}

export interface NoticeMultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: NoticeFileData[];
  errorId?: string;
}

export interface NoticeFileAttachResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, never>;
  errorId?: string;
}

export interface NoticeFileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: NoticeFileData;
  errorId?: string;
}

export interface NoticeFileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: NoticeFileData[];
  errorId?: string;
}

export interface NoticeFileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, never>;
  errorId?: string;
}
