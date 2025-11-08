/**
 * Business Registration API Types
 * Covers:
 * - POST /api/pet-save/business-registrations
 * - POST /api/pet-save/business-registrations/{requestId}/approve
 * - POST /api/pet-save/business-registrations/{requestId}/reject
 * - File upload, attach, list, delete endpoints
 */

/** -------------------- Business Registration -------------------- **/

export interface BusinessRegistrationRequest {
  businessRegistrationNumber: string;
  representativeName: string;
  businessName: string;
  businessRegistrationCopyFileId: string;
  roadAddress: string;
  detailedAddress: string;
  zipCode: string;
  bankName: string;
  accountNumber: string;
  depositorName: string;
  bankbookFileId: string;
  businessEmail: string;
  x: number;
  y: number;
}

/** -------------------- Approve / Reject (Admin) -------------------- **/

export interface BusinessRegistrationActionRequest {
  rejectionReason?: string;
  adminNotes?: string;
}

/** -------------------- Common API Envelope -------------------- **/

export interface ApiResponseEnvelope {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown>;
  errorId?: string;
}

export interface BusinessRegistrationResponse extends ApiResponseEnvelope {
  data: Record<string, unknown>;
}

/** -------------------- File Upload / Metadata -------------------- **/

export interface BusinessFileMetadata {
  entityType?: string;
  entityId?: string;
  documentType?: string;
  [key: string]: unknown;
}

export interface BusinessFileUploadData {
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

/** -------------------- File Endpoints -------------------- **/

export interface BusinessFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: BusinessFileUploadData;
  errorId: string;
}

export interface BusinessMultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: BusinessFileUploadData[];
  errorId: string;
}

export interface BusinessFileAttachResponse extends ApiResponseEnvelope {
  data: Record<string, unknown>;
}

export interface BusinessFileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: BusinessFileUploadData;
  errorId: string;
}

export interface BusinessFileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: BusinessFileUploadData[];
  errorId: string;
}

export interface BusinessFileDeleteResponse extends ApiResponseEnvelope {
  data: Record<string, unknown>;
}

export interface EmailValidationResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown>;
  errorId?: string;
}
