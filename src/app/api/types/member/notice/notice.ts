export interface Notice {
  noticeId: string;
  title: string;
  summary: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoticeSearchParams {
  keyword?: string;
  dateStart?: string;
  dateEnd?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'title';
  direction?: 'asc' | 'desc';
}

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

export interface NoticeListResponse {
  content: Notice[];
  pageInfo: NoticePageInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: T;
  errorId: string;
}
