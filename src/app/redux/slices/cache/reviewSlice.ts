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
  lastFetched: number;
}

interface ReviewState {
  cache: Record<string, CachedReviewData>;
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
  currentCacheKey: string | null;
  isStale: boolean;
}

const initialState: ReviewState = {
  cache: {},
  loading: false,
  backgroundLoading: false,
  error: null,
  currentCacheKey: null,
  isStale: false,
};

// Cache duration: 10 seconds (configurable) - much faster for better UX
const CACHE_DURATION = 10 * 1000;

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

// Helper function to check if cache is stale
const isCacheStale = (timestamp: number): boolean => {
  return Date.now() - timestamp >= CACHE_DURATION;
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
        lastFetched: Date.now(),
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
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch my reviews'
      );
    }
  }
);

// Background revalidation thunk for reviews
export const revalidateReviewsInBackground = createAsyncThunk(
  'reviews/revalidateReviewsInBackground',
  async (params: ReviewCacheKey, { rejectWithValue }) => {
    try {
      console.log('🔄 Background revalidating reviews...');

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

      const cacheKey = createCacheKey(params);
      const data: CachedReviewData = {
        reviews,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      console.log(
        ' Background revalidation completed, new reviews:',
        reviews.length
      );
      return { cacheKey, data, fromCache: false };
    } catch (error) {
      console.error(' Background revalidation failed:', error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Background revalidation failed'
      );
    }
  }
);

// Background revalidation thunk for my reviews
export const revalidateMyReviewsInBackground = createAsyncThunk(
  'reviews/revalidateMyReviewsInBackground',
  async (params: MyReviewsParams, { rejectWithValue }) => {
    try {
      console.log('🔄 Background revalidating my reviews...');

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

      const cacheKey = `my_reviews_${params.page || 0}_${params.size || 10}_${
        params.sortBy || 'createdAt'
      }_${params.direction || 'desc'}`;
      const data: CachedReviewData = {
        reviews,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      console.log(
        '✅ Background revalidation completed, new my reviews:',
        reviews.length
      );
      return { cacheKey, data, fromCache: false };
    } catch (error) {
      console.error('❌ Background revalidation failed:', error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Background revalidation failed'
      );
    }
  }
);

// Manual refresh thunk for reviews
export const refreshReviews = createAsyncThunk(
  'reviews/refreshReviews',
  async (params: ReviewCacheKey, { rejectWithValue }) => {
    try {
      console.log('🔄 Manual refresh of reviews...');

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

      const cacheKey = createCacheKey(params);
      const data: CachedReviewData = {
        reviews,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh reviews'
      );
    }
  }
);

// Manual refresh thunk for my reviews
export const refreshMyReviews = createAsyncThunk(
  'reviews/refreshMyReviews',
  async (params: MyReviewsParams, { rejectWithValue }) => {
    try {
      console.log('🔄 Manual refresh of my reviews...');

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

      const cacheKey = `my_reviews_${params.page || 0}_${params.size || 10}_${
        params.sortBy || 'createdAt'
      }_${params.direction || 'desc'}`;
      const data: CachedReviewData = {
        reviews,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh my reviews'
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
      state.isStale = false;
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
    setStale: (state, action: PayloadAction<boolean>) => {
      state.isStale = action.payload;
    },
    checkStaleStatus: (state) => {
      const currentCacheKey = state.currentCacheKey;
      if (currentCacheKey && state.cache[currentCacheKey]) {
        const cachedData = state.cache[currentCacheKey];
        state.isStale = isCacheStale(cachedData.timestamp);
      } else {
        state.isStale = false;
      }
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

        // Check if data is stale
        if (action.payload.fromCache) {
          const cachedData = state.cache[action.payload.cacheKey];
          state.isStale = cachedData
            ? isCacheStale(cachedData.timestamp)
            : false;
        } else {
          state.isStale = false;
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

        // Check if data is stale
        if (action.payload.fromCache) {
          const cachedData = state.cache[action.payload.cacheKey];
          state.isStale = cachedData
            ? isCacheStale(cachedData.timestamp)
            : false;
        } else {
          state.isStale = false;
        }
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Background Revalidation for Reviews
      .addCase(revalidateReviewsInBackground.pending, (state) => {
        state.backgroundLoading = true;
      })
      .addCase(revalidateReviewsInBackground.fulfilled, (state, action) => {
        state.backgroundLoading = false;
        state.error = null;

        // Always update cache with fresh data
        if (!action.payload.fromCache) {
          state.cache[action.payload.cacheKey] = action.payload.data;
          state.isStale = false;
        }
      })
      .addCase(revalidateReviewsInBackground.rejected, (state, action) => {
        state.backgroundLoading = false;
        // Don't set error for background revalidation failures
        console.warn('Background revalidation failed:', action.payload);
      })
      // Background Revalidation for My Reviews
      .addCase(revalidateMyReviewsInBackground.pending, (state) => {
        state.backgroundLoading = true;
      })
      .addCase(revalidateMyReviewsInBackground.fulfilled, (state, action) => {
        state.backgroundLoading = false;
        state.error = null;

        // Always update cache with fresh data
        if (!action.payload.fromCache) {
          state.cache[action.payload.cacheKey] = action.payload.data;
          state.isStale = false;
        }
      })
      .addCase(revalidateMyReviewsInBackground.rejected, (state, action) => {
        state.backgroundLoading = false;
        // Don't set error for background revalidation failures
        console.warn('Background revalidation failed:', action.payload);
      })
      // Manual Refresh for Reviews
      .addCase(refreshReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Always update cache with fresh data
        state.cache[action.payload.cacheKey] = action.payload.data;
        state.isStale = false;
      })
      .addCase(refreshReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Manual Refresh for My Reviews
      .addCase(refreshMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Always update cache with fresh data
        state.cache[action.payload.cacheKey] = action.payload.data;
        state.isStale = false;
      })
      .addCase(refreshMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCache,
  clearCacheForProduct,
  setCurrentCacheKey,
  setStale,
  checkStaleStatus,
} = reviewSlice.actions;
export default reviewSlice.reducer;
