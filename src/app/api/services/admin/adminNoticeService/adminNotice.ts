/**
 * ===== Admin Notice Search Types =====
 */
export interface NoticeSearchParams {
  keyword?: string;
  dateStart?: string; // ISO 8601
  dateEnd?: string; // ISO 8601
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'title';
  direction?: 'asc' | 'desc';
}

/** Single notice item */
export interface NoticeItem {
  noticeId: string;
  title: string;
  summary?: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
  imageUrls?: string[];
}

/** Page info metadata */
export interface NoticePageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Paginated response for notices */
export interface NoticePageResponse {
  content: NoticeItem[];
  pageInfo: NoticePageInfo;
}

/** API response wrapper */
export interface NoticeApiResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: NoticePageResponse;
  errorId?: string;
}

/**
 * ===== Create Notice =====
 */
export interface NoticeCreateRequest {
  title: string;
  summary?: string;
  content: string;
  imageId?: string;
}

export interface NoticeCreateResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, never>;
  errorId?: string;
}

/**
 * ===== Notice Detail =====
 */
export interface NoticeDetailResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: NoticeItem;
  errorId?: string;
}

/**
 * ===== Update Notice =====
 */
export interface NoticeUpdateRequest {
  title: string;
  summary?: string;
  content: string;
  imageId?: string;
}

export interface NoticeUpdateResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, never>;
  errorId?: string;
}

/**
 * ===== Delete Notice =====
 */
export interface NoticeDeleteResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: Record<string, never>;
  errorId?: string;
}
