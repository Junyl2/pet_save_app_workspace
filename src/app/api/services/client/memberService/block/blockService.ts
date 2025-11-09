import { apiClient, ApiResponse } from '@/app/api/apiClient';
import {
  ToggleBlockResponse,
  CheckBlockedResponse,
  GetBlockByIdResponse,
  GetBlocksByMemberResponse,
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
   * Endpoint: POST /api/pet-save/stores/{storeId}/toggle-block
   */
  static async toggleBlockStore(
    storeId: string
  ): Promise<ApiResponse<ToggleBlockResponse>> {
    try {
      const response = await apiClient.post<ToggleBlockResponse>(
        `${this.STORE_BASE}/${storeId}/toggle-block`
      );

      if (response.error) {
        console.error(
          '[BlockService] toggleBlockStore failed:',
          response.error
        );
      }

      return response;
    } catch (error) {
      console.error('[BlockService] toggleBlockStore service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to toggle block store',
      };
    }
  }

  /**
   * Check if a store is blocked
   * Endpoint: GET /api/pet-save/stores/{storeId}/check-blocked
   */
  static async checkIfStoreBlocked(
    storeId: string
  ): Promise<ApiResponse<CheckBlockedResponse>> {
    try {
      const response = await apiClient.get<CheckBlockedResponse>(
        `${this.STORE_BASE}/${storeId}/check-blocked`
      );

      if (response.error) {
        console.error(
          '[BlockService] checkIfStoreBlocked failed:',
          response.error
        );
      }

      return response;
    } catch (error) {
      console.error('[BlockService] checkIfStoreBlocked service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check block status',
      };
    }
  }

  /**
   * Get blocks by member ID (OWNER/ADMIN)
   * Endpoint: GET /api/pet-save/member/{memberId}/blocks
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

      const response = await apiClient.get<GetBlocksByMemberResponse>(
        `${this.MEMBER_BASE}/${memberId}/blocks?${query}`
      );

      if (response.error) {
        console.error(
          '[BlockService] getBlocksByMember failed:',
          response.error
        );
      }

      return response;
    } catch (error) {
      console.error('[BlockService] getBlocksByMember service error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch member block list',
      };
    }
  }

  /**
   * Get block details by block ID (OWNER/ADMIN)
   * Endpoint: GET /api/pet-save/blocks/{blockId}
   */
  static async getBlockById(
    blockId: string
  ): Promise<ApiResponse<GetBlockByIdResponse>> {
    try {
      const response = await apiClient.get<GetBlockByIdResponse>(
        `${this.BLOCKS_BASE}/${blockId}`
      );

      if (response.error) {
        console.error('[BlockService] getBlockById failed:', response.error);
      }

      return response;
    } catch (error) {
      console.error('[BlockService] getBlockById service error:', error);
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
