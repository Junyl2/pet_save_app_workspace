import { apiClient } from '@/app/api/apiClient';
import {
  PointsHistoryResponse,
  PointsHistoryParams,
  PointsStatsResponse,
} from '@/app/api/types/member/points/points';

export class PointsService {
  /**
   * Get current user's points history
   */
  static async getPointsHistory(
    params: PointsHistoryParams = {}
  ): Promise<{ data: PointsHistoryResponse | null; error?: string }> {
    const {
      page = 0,
      size = 10,
      sortBy = 'createdAt',
      direction = 'desc',
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    return await apiClient.get<PointsHistoryResponse>(
      `/members/me/points?${queryParams.toString()}`
    );
  }

  /**
   * Get current user's points statistics
   */
  static async getPointsStats(): Promise<{
    data: PointsStatsResponse | null;
    error?: string;
  }> {
    console.log('PointsService.getPointsStats() - calling API...');
    const result = await apiClient.get<PointsStatsResponse>(
      '/members/me/points/stats'
    );
    console.log('PointsService.getPointsStats() - API result:', result);
    return result;
  }
}
