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
