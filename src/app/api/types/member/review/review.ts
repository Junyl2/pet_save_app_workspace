// Review creation request DTO
export interface ReviewCreateDto {
  productId: string; // UUID
  rating: number; // 1.0 - 5.0
  content?: string;
  imageFileIds?: string[];
}

// Review search parameters
export interface ReviewSearchParams {
  productId?: string;
  minRating?: number;
  maxRating?: number;
  page?: number; // Default: 0
  size?: number; // Default: 10
  sortBy?: 'createdAt' | 'rating'; // Default: createdAt
  direction?: 'asc' | 'desc'; // Default: desc
}

// Review response data
export interface Review {
  reviewId: string;
  product: {
    productId: string;
    productName: string;
    productNumber: string;
    productThumbnail: string;
    quantity: number;
    category: string[];
    salePrice: number;
    discountedPrice: number;
    expiryDate: string;
  };
  reviewer: {
    memberId: string;
    name: string;
    profileImageUrl: string | null;
  };
  rating: number;
  content: string;
  productName: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

// Review search response
export interface ReviewSearchResponse {
  content: Review[];
  pageInfo: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// My reviews parameters
export interface MyReviewsParams {
  page?: number; // Default: 0
  size?: number; // Default: 10
  sortBy?: 'createdAt'; // Default: createdAt
  direction?: 'asc' | 'desc'; // Default: desc
}

// File upload metadata
export interface FileUploadMetadata {
  entityType?: string;
  entityId?: string;
  [key: string]: unknown;
}

// Single file upload request
export interface FileUploadRequest {
  file: File;
  metadata?: FileUploadMetadata;
}

// Multiple file upload request
export interface MultipleFileUploadRequest {
  files: File[];
  metadata?: FileUploadMetadata;
}

// File upload response data
export interface FileUploadData {
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

// Single file upload response
export interface FileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: FileUploadData;
  errorId: string | null;
}

// Multiple file upload response
export interface MultipleFileUploadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: FileUploadData[];
  errorId: string | null;
}

// File attachment request
export interface FileAttachmentRequest {
  entityId: string;
  fileIds: string[];
}

// File attachment response
export interface FileAttachmentResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId: string | null;
}

// File info response
export interface FileInfoResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: FileUploadData;
  errorId: string | null;
}

// File list response
export interface FileListResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: FileUploadData[];
  errorId: string | null;
}

// File delete response
export interface FileDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId: string | null;
}

// File download options
export interface FileDownloadOptions {
  disposition?: 'inline' | 'attachment';
  type?: 'original' | 'thumbnail';
  headers?: {
    'If-None-Match'?: string;
    'If-Modified-Since'?: string;
  };
}
