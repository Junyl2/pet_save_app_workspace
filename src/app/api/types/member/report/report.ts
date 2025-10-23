// Report target types
export type ReportTargetType = 'PRODUCT' | 'STORE';

// Report request interface
export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string;
}

// Report response interface
export interface ReportResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string;
  data: Record<string, unknown>;
  errorId?: string;
}

// Report reason options (matching the modal options)
export const REPORT_REASONS = [
  '허위 광고',
  '안전 문제',
  '불법 제품',
  '부적절한 판매자',
  '불쾌하거나 부적절한 내용',
  '동물학대 관련 상품',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

// Reason mapping for backend compatibility
export const REASON_MAPPING: Record<string, string> = {
  '허위 광고': 'FALSE_ADVERTISING',
  '안전 문제': 'SAFETY_ISSUE',
  '불법 제품': 'ILLEGAL_PRODUCT',
  '부적절한 판매자': 'INAPPROPRIATE_SELLER',
  '불쾌하거나 부적절한 내용': 'INAPPROPRIATE_CONTENT',
  '동물학대 관련 상품': 'ANIMAL_ABUSE',
};
