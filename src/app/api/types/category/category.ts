/**
 * Category information interface (matches API response exactly)
 */
export interface Category {
  categoryId: string;
  categoryName: string;
  englishName: string;
  displayOrder: number;
  visible: boolean;
  image: string | null; // Added: image URL from API
}

/**
 * Category search parameters
 */
export interface CategorySearchParams {
  keyword?: string;
  categoryName?: string;
  englishName?: string;
  page?: number;
  size?: number;
  sortBy?: 'displayOrder' | 'categoryName' | 'englishName' | 'createdAt';
  direction?: 'asc' | 'desc';
}

/**
 * Admin category search parameters with visible filter
 */
export interface AdminCategorySearchParams {
  keyword?: string;
  categoryName?: string;
  englishName?: string;
  visible?: boolean;
  page?: number;
  size?: number;
  sortBy?: 'displayOrder' | 'categoryName' | 'englishName' | 'createdAt';
  direction?: 'asc' | 'desc';
}

/**
 * Paginated category response
 */
export interface CategoryPageResponse {
  content: Category[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

/**
 * API response wrapper
 */
export interface CategoryApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: CategoryPageResponse;
  errorId?: string;
}

/** Request payload for creating a new category */
export interface CategoryCreateRequest {
  name: string;
  englishName: string;
  displayOrder: number;
  visible: boolean;
  /** Encrypted file ID (imageFileId) from the upload API */
  imageFileId: string;
}

/** Request payload for updating a category */
export interface CategoryUpdateRequest {
  name: string;
  englishName: string;
  displayOrder: number;
  visible: boolean;
  /** Encrypted file IDs (imageFileIds) for updated images */
  imageFileIds: string[];
}

/** Response for fetching category details by ID */
export interface CategoryByIdResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Category;
  errorId?: string;
}

/** Generic response structure for category operations */
export interface CategoryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}
