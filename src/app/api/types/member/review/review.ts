// Review creation request DTO
export interface ReviewCreateDto {
  productId: string; // UUID
  rating: number; // 1.0 - 5.0
  content?: string;
  imageFileIds?: string[];
}

// Review search parameters
export interface ReviewSearchParams {
  minRating?: number;
  maxRating?: number;
  page?: number; // Default: 0
  size?: number; // Default: 10
  sortBy?: 'createdAt' | 'rating'; // Default: createdAt
  direction?: 'asc' | 'desc'; // Default: desc
}

// Review response data
export interface Review {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  content: string;
  imageFileIds: string[];
  userId: string;
  username: string;
  profileImage?: string;
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
