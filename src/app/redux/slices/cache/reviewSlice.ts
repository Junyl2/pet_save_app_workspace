import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Review,
  ReviewSearchParams,
  ReviewSearchResponse,
  MyReviewsParams,
} from '@/app/api/types/member/review/review';
import { ReviewService } from '@/app/api/services/client/memberService/review/reviewService';

export interface ReviewCacheKey {
  page: number;
  size: number;
  sortBy: string;
  direction: string;
  productId?: string;
  minRating?: number;
  maxRating?: number;
}

export interface CachedReviewData {
  reviews: Review[];
  pageInfo: ReviewSearchResponse['pageInfo'];
  timestamp: number;
}

interface ReviewState {
  cache: Record<string, CachedReviewData>;
  loading: boolean;
  error: string | null;
  currentCacheKey: string | null;
}

const initialState: ReviewState = {
  cache: {},
  loading: false,
  error: null,
  currentCacheKey: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to create cache key
const createCacheKey = (params: ReviewCacheKey): string => {
  const { page, size, sortBy, direction, productId, minRating, maxRating } =
    params;
  return `${productId || 'all'}_${minRating || 'all'}_${
    maxRating || 'all'
  }_${page}_${size}_${sortBy}_${direction}`;
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Async thunk for fetching reviews
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params: ReviewCacheKey, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { reviews: ReviewState };
      const cacheKey = createCacheKey(params);
      const cachedData = state.reviews.cache[cacheKey];

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { cacheKey, data: cachedData, fromCache: true };
      }

      const searchParams: ReviewSearchParams = {
        page: params.page,
        size: params.size,
        sortBy: params.sortBy as 'createdAt' | 'rating',
        direction: params.direction as 'asc' | 'desc',
        productId: params.productId,
        minRating: params.minRating,
        maxRating: params.maxRating,
      };

      const res = await ReviewService.searchReviews(searchParams);

      if (res.error) {
        throw new Error(res.error);
      }

      const reviews = res.data?.content || [];
      const pageInfo = res.data?.pageInfo || {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
        first: true,
        last: false,
        hasNext: false,
        hasPrevious: false,
      };

      const data: CachedReviewData = {
        reviews,
        pageInfo,
        timestamp: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch reviews'
      );
    }
  }
);

// Async thunk for fetching my reviews
export const fetchMyReviews = createAsyncThunk(
  'reviews/fetchMyReviews',
  async (params: MyReviewsParams, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { reviews: ReviewState };
      const cacheKey = `my_reviews_${params.page || 0}_${params.size || 10}_${
        params.sortBy || 'createdAt'
      }_${params.direction || 'desc'}`;
      const cachedData = state.reviews.cache[cacheKey];

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { cacheKey, data: cachedData, fromCache: true };
      }

      const res = await ReviewService.getMyReviews(params);

      if (res.error) {
        throw new Error(res.error);
      }

      const reviews = res.data?.content || [];
      const pageInfo = res.data?.pageInfo || {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
        first: true,
        last: false,
        hasNext: false,
        hasPrevious: false,
      };

      const data: CachedReviewData = {
        reviews,
        pageInfo,
        timestamp: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch my reviews'
      );
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearCache: (state) => {
      state.cache = {};
      state.currentCacheKey = null;
    },
    clearCacheForProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const keysToDelete = Object.keys(state.cache).filter((key) => {
        const keyParts = key.split('_');
        const keyProductId = keyParts[0];
        return keyProductId === productId;
      });

      keysToDelete.forEach((key) => {
        delete state.cache[key];
      });
    },
    setCurrentCacheKey: (state, action: PayloadAction<string | null>) => {
      state.currentCacheKey = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.cache[action.payload.cacheKey] = action.payload.data;
        }
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.cache[action.payload.cacheKey] = action.payload.data;
        }
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCache, clearCacheForProduct, setCurrentCacheKey } =
  reviewSlice.actions;
export default reviewSlice.reducer;
