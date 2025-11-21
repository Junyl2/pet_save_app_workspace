/**
 * Common base response for block-related endpoints
 */
export interface BlockBaseResponse<T = Record<string, unknown>> {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: T;
  errorId?: string;
}

/**
 * Single blocked store record
 */
export interface BlockedStore {
  blockId: string;
  memberId: string;
  memberName: string;
  storeId: string;
  storeName: string;
  createdAt: string;
  updatedAt: string;
  businessProfileImage: string;
  storeProfileImageUrl: string;
  storePhoneNumber: string;
  storeAddress: string;
}

/**
 * Pagination metadata
 */
export interface BlockPageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Toggle store block response (POST /stores/{storeId}/toggle-block)
 */
export type ToggleBlockResponse = BlockBaseResponse;

/**
 * Check if store is blocked (GET /stores/{storeId}/check-blocked)
 */
export type CheckBlockedResponse = BlockBaseResponse;

/**
 * Get single block details (GET /blocks/{blockId})
 */
export type GetBlockByIdResponse = BlockBaseResponse<BlockedStore>;

/**
 * Get member's block list (GET /member/{memberId}/blocks)
 */
export type GetBlocksByMemberResponse = BlockBaseResponse<{
  content: BlockedStore[];
  pageInfo: BlockPageInfo;
}>;
/**
 * Get current user's blocked stores
 * GET /members/me/blocks
 */
export type GetMyBlockedStoresResponse = BlockBaseResponse<{
  content: BlockedStore[];
  pageInfo: BlockPageInfo;
}>;
