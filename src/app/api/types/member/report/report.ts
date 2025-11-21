// Report target types
export type ReportTargetType = 'PRODUCT' | 'STORE';

// Report request interface
export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
}

// =============================
// REAL BACKEND RESPONSE STRUCTURE
// =============================

export interface ReportItem {
  reportId: string;
  reporterId: string;
  reporterNickname: string;
  targetType: 'PRODUCT' | 'STORE';
  targetId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

export interface ReportPageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ReportListData {
  content: ReportItem[];
  pageInfo: ReportPageInfo;
}

// =============================
// UPDATED ReportResponse
// =============================
export interface ReportResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: ReportListData; // <--- UPDATED
  errorId?: string;
}

// =============================
// REPORT REASON OPTIONS
// =============================
export const REPORT_REASONS = [
  '허위 광고',
  '안전 문제',
  '불법 제품',
  '부적절한 판매자',
  '불쾌하거나 부적절한 내용',
  '동물학대 관련 상품',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

// Backend reason mapping
export const REASON_MAPPING: Record<string, string> = {
  '허위 광고': 'FALSE_ADVERTISING',
  '안전 문제': 'SAFETY_ISSUE',
  '불법 제품': 'ILLEGAL_PRODUCT',
  '부적절한 판매자': 'INAPPROPRIATE_SELLER',
  '불쾌하거나 부적절한 내용': 'INAPPROPRIATE_CONTENT',
  '동물학대 관련 상품': 'ANIMAL_ABUSE',
};

// Member report stats
export interface MemberReportStats {
  totalReports: number;
  totalReportsReceived: number;
}

export interface MemberReportStatsResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: MemberReportStats;
  errorId?: string;
}
export interface ReportMarkAsReadResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, unknown>;
  errorId?: string;
}
