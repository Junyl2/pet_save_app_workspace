import { apiClient } from '@/app/api/apiClient';
import {
  CreateReportRequest,
  ReportResponse,
  MemberReportStatsResponse,
  ReportMarkAsReadResponse,
} from '@/app/api/types/member/report/report';
import { baseURL } from '@/app/api/config';

export class ReportService {
  /**
   * Create a new report
   * POST /api/pet-save/reports
   */
  static async createReport(
    reportData: CreateReportRequest
  ): Promise<{ data: ReportResponse | null; error?: string }> {
    try {
      const response = await apiClient.post<ReportResponse>(
        '/reports',
        reportData
      );

      return {
        data: response.data,
        error: response.error,
      };
    } catch (error) {
      console.error('Report creation error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to create report',
      };
    }
  }

  /**
   * Get my report list
   * GET /api/pet-save/members/me/reports
   */
  static async getMyReports(params?: {
    keyword?: string;
    targetType?: 'PRODUCT' | 'STORE';
    status?: 'PENDING' | 'REVIEWED' | 'RESOLVED';
    page?: number;
    size?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'status';
    direction?: 'asc' | 'desc';
  }): Promise<{ data: ReportResponse | null; error?: string }> {
    try {
      const response = await apiClient.raw.get<ReportResponse>(
        '/members/me/reports',
        {
          params: {
            keyword: params?.keyword,
            targetType: params?.targetType,
            status: params?.status,
            page: params?.page ?? 0,
            size: params?.size ?? 10,
            sortBy: params?.sortBy ?? 'createdAt',
            direction: params?.direction ?? 'desc',
          },
        }
      );

      return { data: response.data, error: undefined };
    } catch (error) {
      console.error('Report list fetch error:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Failed to load reports',
      };
    }
  }

  /**
   * Get report stats for a specific member
   * GET /api/pet-save/reports/members/{memberId}/stats
   */
  static async getMemberReportStats(
    memberId: string
  ): Promise<{ data: MemberReportStatsResponse | null; error?: string }> {
    try {
      const response = await apiClient.raw.get<MemberReportStatsResponse>(
        `/reports/members/${memberId}/stats`
      );

      return { data: response.data, error: undefined };
    } catch (error) {
      console.error('Report stats fetch error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load member report stats',
      };
    }
  }

  /**
   * Mark reports as read
   * POST /api/pet-save/reports/notification/mark-as-read
   */
  static async markReportsAsRead(): Promise<{
    data: ReportMarkAsReadResponse | null;
    error?: string;
  }> {
    try {
      const response = await apiClient.raw.post<ReportMarkAsReadResponse>(
        '/reports/notification/mark-as-read'
      );

      return { data: response.data, error: undefined };
    } catch (error) {
      console.error('Report mark-as-read error:', error);
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark reports as read',
      };
    }
  }
}
