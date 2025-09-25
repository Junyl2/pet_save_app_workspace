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

// Wishlist item structure - matches actual API response
export interface WishlistItem {
  productId: string;
  productName: string;
  productNumber: string;
  productThumbnail: string;
  quantity: number;
  category: string[];
  salePrice: number;
  discountedPrice: number;
  expiryDate: string;
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  image?: string;
  originalPrice?: number;
  isFavorited?: boolean;
}

// Wishlist data structure - API returns array directly
export interface WishlistData {
  items: WishlistItem[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}

// Request/Response types for wishlist operations
export interface GetWishlistResponse extends WishlistApiResponse {
  data: WishlistItem[]; // API returns array directly, not wrapped in object
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface AddToWishlistResponse extends WishlistApiResponse {
  data: {
    wishlisted: boolean;
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
