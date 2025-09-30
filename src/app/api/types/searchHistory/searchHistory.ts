export interface SearchHistoryItem {
  id: string;
  keyword: string;
  searchedAt: string; // ISO string
}

export interface SearchHistoryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode?: string | null;
  data: unknown;
  errorId?: string | null;
}

export interface KeywordListResponse {
  success: boolean;
  status: number;
  data: string[];
}

export interface SearchHistoryParams {
  page?: number;
  size?: number;
  sortBy?: 'searchedAt' | 'keyword';
  direction?: 'asc' | 'desc';
}
