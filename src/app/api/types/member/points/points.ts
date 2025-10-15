export interface PointsProduct {
  productId: string;
  productName: string;
  productNumber: string;
  productThumbnail: string;
  quantity: number;
  category: string[];
  salePrice: number;
  discountedPrice: number;
  expiryDate: string;
}

export interface PointsTransaction {
  pointsId: string;
  title: string;
  description: string;
  product: PointsProduct | null;
  type: 'EARNED' | 'USED';
  amount: number;
  expiryDate: string;
  expiredAt: string;
  createdAt: string;
}

export interface PageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PointsHistoryData {
  content: PointsTransaction[];
  pageInfo: PageInfo;
}

export interface PointsHistoryResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: PointsHistoryData;
  errorId?: string;
}

export interface PointsHistoryParams {
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'amount' | 'expiryDate' | 'expiredAt';
  direction?: 'asc' | 'desc';
}

export interface PointsStats {
  totalEarnedPoints: number;
  totalUsedPoints: number;
  totalExpiredPoints: number;
  totalReferralPoints: number;
  totalUsablePoints: number;
}

export interface PointsStatsResponse {
  success: boolean;
  status: number;
  resultMsg: string;
  divisionCode: string | null;
  data: PointsStats;
  errorId?: string;
}
