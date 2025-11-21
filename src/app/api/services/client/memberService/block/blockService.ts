import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ToggleBlockResponse,
  CheckBlockedResponse,
  GetBlockByIdResponse,
  GetBlocksByMemberResponse,
  GetMyBlockedStoresResponse,
} from '@/app/api/types/member/block/block';

/**
 * BlockService
 * Handles store blocking, unblocking, and block queries
 */
export class BlockService {
  private static readonly STORE_BASE = '/stores';
  private static readonly MEMBER_BASE = '/member';
  private static readonly BLOCKS_BASE = '/blocks';

  /**
   * Toggle block status of a store
   * POST /api/pet-save/stores/{storeId}/toggle-block
   */
  static async toggleBlockStore(
    storeId: string
  ): Promise<ApiResponse<ToggleBlockResponse>> {
    try {
      return await apiClient.post<ToggleBlockResponse>(
        `${this.STORE_BASE}/${storeId}/toggle-block`
      );
    } catch (error) {
      console.error('[BlockService] toggleBlockStore error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to toggle block',
      };
    }
  }

  /**
   * Check if a store is blocked
   * GET /stores/{storeId}/check-blocked
   */
  static async checkIfStoreBlocked(
    storeId: string
  ): Promise<ApiResponse<CheckBlockedResponse>> {
    try {
      return await apiClient.get<CheckBlockedResponse>(
        `${this.STORE_BASE}/${storeId}/check-blocked`
      );
    } catch (error) {
      console.error('[BlockService] checkIfStoreBlocked error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to check block',
      };
    }
  }

  /**
   * Get blocks by member ID (OWNER/ADMIN)
   * GET /member/{memberId}/blocks
   */
  static async getBlocksByMember(
    memberId: string,
    params?: {
      page?: number;
      size?: number;
      sortBy?: 'createdAt' | 'updatedAt';
      direction?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse<GetBlocksByMemberResponse>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 10),
        sortBy: params?.sortBy ?? 'createdAt',
        direction: params?.direction ?? 'desc',
      }).toString();

      return await apiClient.get<GetBlocksByMemberResponse>(
        `${this.MEMBER_BASE}/${memberId}/blocks?${query}`
      );
    } catch (error) {
      console.error('[BlockService] getBlocksByMember error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch member blocks',
      };
    }
  }

  /**
   * Get *my* blocked stores
   * GET /members/me/blocks
   */
  static async getMyBlockedStores(params?: {
    page?: number;
    size?: number;
    sortBy?: 'createdAt';
    direction?: 'asc' | 'desc';
  }): Promise<ApiResponse<GetMyBlockedStoresResponse>> {
    try {
      const query = new URLSearchParams({
        page: String(params?.page ?? 0),
        size: String(params?.size ?? 10),
        sortBy: params?.sortBy ?? 'createdAt',
        direction: params?.direction ?? 'desc',
      }).toString();

      return await apiClient.get<GetMyBlockedStoresResponse>(
        `/members/me/blocks?${query}`
      );
    } catch (error) {
      console.error('[BlockService] getMyBlockedStores error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch my blocked stores',
      };
    }
  }

  /**
   * Get block details by blockId
   * GET /blocks/{blockId}
   */
  static async getBlockById(
    blockId: string
  ): Promise<ApiResponse<GetBlockByIdResponse>> {
    try {
      return await apiClient.get<GetBlockByIdResponse>(
        `${this.BLOCKS_BASE}/${blockId}`
      );
    } catch (error) {
      console.error('[BlockService] getBlockById error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch block details',
      };
    }
  }
}
