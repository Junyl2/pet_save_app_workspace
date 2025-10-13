import { apiClient } from '@/app/api/apiClient';
import {
  CreateReportRequest,
  ReportResponse,
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
      console.log('ReportService: Sending report data:', reportData);
      console.log('ReportService: BaseURL:', baseURL);
      console.log('ReportService: Full URL:', `${baseURL}/reports`);

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
}
