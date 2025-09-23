/**
 * Wishlist API Types
 */

// Base API response structure
export interface WishlistApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: any;
  errorId: string;
}

// Wishlist item structure
export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  isFavorited: boolean;
  // Add more fields as needed based on actual API response
  category?: string;
  brand?: string;
  description?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
}

// Wishlist data structure
export interface WishlistData {
  items: WishlistItem[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}

// Request/Response types for wishlist operations
export interface GetWishlistResponse extends WishlistApiResponse {
  data: WishlistData;
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface AddToWishlistResponse extends WishlistApiResponse {
  data: {
    success: boolean;
    message: string;
  };
}

export interface RemoveFromWishlistRequest {
  productId: string;
}

export interface RemoveFromWishlistResponse extends WishlistApiResponse {
  data: {
    success: boolean;
    message: string;
  };
}
