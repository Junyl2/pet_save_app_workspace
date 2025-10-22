import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  OrderItemResponse,
  OrderHistoryApiResponse,
  OrderHistoryQueryParams,
} from '@/app/api/types/member/order/orderDetails';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';

export interface CachedOrderData {
  orderItems: OrderItemResponse[];
  timestamp: number;
  lastFetched: number;
}

export interface CachedOrderHistoryData {
  data: OrderHistoryApiResponse;
  timestamp: number;
  lastFetched: number;
}

interface OrderState {
  // Cache for individual order details by orderId
  orderDetailsCache: Record<string, CachedOrderData>;
  // Cache for order history by query params
  orderHistoryCache: Record<string, CachedOrderHistoryData>;
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
  currentOrderId: string | null;
  currentCacheKey: string | null;
  isStale: boolean;
}

const initialState: OrderState = {
  orderDetailsCache: {},
  orderHistoryCache: {},
  loading: false,
  backgroundLoading: false,
  error: null,
  currentOrderId: null,
  currentCacheKey: null,
  isStale: false,
};

// Cache duration: 10 seconds (configurable) - much faster for better UX
const CACHE_DURATION = 10 * 1000;

// Helper function to create cache key for order history
const createOrderHistoryCacheKey = (
  params?: OrderHistoryQueryParams
): string => {
  if (!params) return 'default';

  const {
    keyword,
    status,
    dateStart,
    dateEnd,
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    direction = 'desc',
  } = params;

  return `${keyword || ''}_${status || ''}_${dateStart || ''}_${
    dateEnd || ''
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

// Async thunk for fetching order details
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { orders: OrderState };
      const cachedData = state.orders.orderDetailsCache[orderId];

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { orderId, data: cachedData, fromCache: true };
      }

      const response = await orderDetailsService.getOrderDetails(orderId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.data?.content) {
        throw new Error('No order data found');
      }

      const data: CachedOrderData = {
        orderItems: response.data.data.content,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { orderId, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch order details'
      );
    }
  }
);

// Async thunk for fetching order history
export const fetchOrderHistory = createAsyncThunk(
  'orders/fetchOrderHistory',
  async (
    params: OrderHistoryQueryParams | undefined,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { orders: OrderState };
      const cacheKey = createOrderHistoryCacheKey(params);
      const cachedData = state.orders.orderHistoryCache[cacheKey];

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { cacheKey, data: cachedData, fromCache: true };
      }

      const response = await orderDetailsService.getMyOrderHistory(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No order history data found');
      }

      const data: CachedOrderHistoryData = {
        data: response.data,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch order history'
      );
    }
  }
);

// Background revalidation thunk for order history
export const revalidateOrderHistoryInBackground = createAsyncThunk(
  'orders/revalidateOrderHistoryInBackground',
  async (params: OrderHistoryQueryParams | undefined, { rejectWithValue }) => {
    try {
      console.log('🔄 Background revalidating order history...');
      const response = await orderDetailsService.getMyOrderHistory(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No order history data found');
      }

      const cacheKey = createOrderHistoryCacheKey(params);
      const data: CachedOrderHistoryData = {
        data: response.data,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      console.log(
        '✅ Background revalidation completed, new data:',
        response.data
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

// Manual refresh thunk for order history
export const refreshOrderHistory = createAsyncThunk(
  'orders/refreshOrderHistory',
  async (params: OrderHistoryQueryParams | undefined, { rejectWithValue }) => {
    try {
      console.log('🔄 Manual refresh of order history...');
      const response = await orderDetailsService.getMyOrderHistory(params);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No order history data found');
      }

      const cacheKey = createOrderHistoryCacheKey(params);
      const data: CachedOrderHistoryData = {
        data: response.data,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to refresh order history'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderCache: (state) => {
      state.orderDetailsCache = {};
      state.orderHistoryCache = {};
      state.currentOrderId = null;
      state.isStale = false;
    },
    clearOrderDetailsCache: (state) => {
      state.orderDetailsCache = {};
    },
    clearOrderHistoryCache: (state) => {
      state.orderHistoryCache = {};
    },
    clearCacheForOrder: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      delete state.orderDetailsCache[orderId];
    },
    setCurrentOrderId: (state, action: PayloadAction<string | null>) => {
      state.currentOrderId = action.payload;
    },
    setStale: (state, action: PayloadAction<boolean>) => {
      state.isStale = action.payload;
    },
    checkStaleStatus: (state) => {
      const currentCacheKey = state.currentCacheKey;
      if (currentCacheKey && state.orderHistoryCache[currentCacheKey]) {
        const cachedData = state.orderHistoryCache[currentCacheKey];
        state.isStale = isCacheStale(cachedData.timestamp);
      } else {
        state.isStale = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentOrderId = action.payload.orderId;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.orderDetailsCache[action.payload.orderId] = action.payload.data;
        }
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Order History
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.orderHistoryCache[action.payload.cacheKey] =
            action.payload.data;
        }

        // Check if data is stale
        if (action.payload.fromCache) {
          const cachedData = state.orderHistoryCache[action.payload.cacheKey];
          state.isStale = cachedData
            ? isCacheStale(cachedData.timestamp)
            : false;
        } else {
          state.isStale = false;
        }
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Background Revalidation
      .addCase(revalidateOrderHistoryInBackground.pending, (state) => {
        state.backgroundLoading = true;
      })
      .addCase(
        revalidateOrderHistoryInBackground.fulfilled,
        (state, action) => {
          state.backgroundLoading = false;
          state.error = null;

          // Always update cache with fresh data
          if (!action.payload.fromCache) {
            state.orderHistoryCache[action.payload.cacheKey] =
              action.payload.data;
            state.isStale = false;
          }
        }
      )
      .addCase(revalidateOrderHistoryInBackground.rejected, (state, action) => {
        state.backgroundLoading = false;
        // Don't set error for background revalidation failures
        console.warn('Background revalidation failed:', action.payload);
      })
      // Manual Refresh
      .addCase(refreshOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Always update cache with fresh data
        state.orderHistoryCache[action.payload.cacheKey] = action.payload.data;
        state.isStale = false;
      })
      .addCase(refreshOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearOrderCache,
  clearOrderDetailsCache,
  clearOrderHistoryCache,
  clearCacheForOrder,
  setCurrentOrderId,
  setStale,
  checkStaleStatus,
} = orderSlice.actions;
export default orderSlice.reducer;
