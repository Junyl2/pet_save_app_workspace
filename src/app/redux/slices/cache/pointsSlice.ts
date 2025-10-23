import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  PointsStatsResponse,
  PointsHistoryResponse,
  PointsHistoryParams,
} from '@/app/api/types/member/points/points';
import { PointsService } from '@/app/api/services/client/memberService/points/pointsService';

export interface CachedPointsStatsData {
  data: PointsStatsResponse;
  timestamp: number;
}

export interface CachedPointsHistoryData {
  data: PointsHistoryResponse;
  timestamp: number;
}

interface PointsState {
  // Cache for points stats
  statsCache: CachedPointsStatsData | null;
  // Cache for points history by query params
  historyCache: Record<string, CachedPointsHistoryData>;
  loading: boolean;
  error: string | null;
}

const initialState: PointsState = {
  statsCache: null,
  historyCache: {},
  loading: false,
  error: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to create cache key for points history
const createPointsHistoryCacheKey = (params?: PointsHistoryParams): string => {
  if (!params) return 'default';

  const {
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc',
  } = params;

  return `${page}_${size}_${sortBy}_${direction}`;
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Async thunk for fetching points stats
export const fetchPointsStats = createAsyncThunk(
  'points/fetchPointsStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { points: PointsState };
      const cachedData = state.points.statsCache;

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { data: cachedData, fromCache: true };
      }

      const response = await PointsService.getPointsStats();
      console.log('PointsService response in slice:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No points stats data found');
      }

      console.log('PointsService response.data:', response.data);
      console.log('PointsService response.data.data:', response.data.data);

      const data: CachedPointsStatsData = {
        data: response.data,
        timestamp: Date.now(),
      };

      return { data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch points stats'
      );
    }
  }
);

// Async thunk for fetching points history
export const fetchPointsHistory = createAsyncThunk(
  'points/fetchPointsHistory',
  async (
    params: PointsHistoryParams | undefined,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { points: PointsState };
      const cacheKey = createPointsHistoryCacheKey(params);
      const cachedData = state.points.historyCache[cacheKey];

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { cacheKey, data: cachedData, fromCache: true };
      }

      const response = await PointsService.getPointsHistory(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No points history data found');
      }

      const data: CachedPointsHistoryData = {
        data: response.data,
        timestamp: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to fetch points history'
      );
    }
  }
);

const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    clearPointsCache: (state) => {
      state.statsCache = null;
      state.historyCache = {};
    },
    clearPointsStatsCache: (state) => {
      state.statsCache = null;
    },
    clearPointsHistoryCache: (state) => {
      state.historyCache = {};
    },
    clearCacheForHistory: (state, action: PayloadAction<string>) => {
      const cacheKey = action.payload;
      delete state.historyCache[cacheKey];
    },
  },
  extraReducers: (builder) => {
    builder
      // Points Stats
      .addCase(fetchPointsStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPointsStats.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.statsCache = action.payload.data;
        }
      })
      .addCase(fetchPointsStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Points History
      .addCase(fetchPointsHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPointsHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.historyCache[action.payload.cacheKey] = action.payload.data;
        }
      })
      .addCase(fetchPointsHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearPointsCache,
  clearPointsStatsCache,
  clearPointsHistoryCache,
  clearCacheForHistory,
} = pointsSlice.actions;
export default pointsSlice.reducer;
