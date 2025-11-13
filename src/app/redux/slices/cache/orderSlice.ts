import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  OrderItemResponse,
  OrderHistoryApiResponse,
  OrderHistoryQueryParams,
} from '@/app/api/types/member/order/orderDetails';
import { orderDetailsService } from '@/app/api/services/client/memberService/order/oderDetailsService';

/** Cached single order details */
export interface CachedOrderData {
  orderItems: OrderItemResponse[];
  timestamp: number;
  lastFetched: number;
  isPartial?: boolean; // Used for shallow entries from list view
}

/** Cached paginated order history */
export interface CachedOrderHistoryData {
  data: OrderHistoryApiResponse;
  timestamp: number;
  lastFetched: number;
}

/** Redux state shape */
interface OrderState {
  orderDetailsCache: Record<string, CachedOrderData>;
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

/** Cache duration (ms) */
const CACHE_DURATION = 10 * 1000;

/** Create a unique cache key per query */
export const createOrderHistoryCacheKey = (
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

/** Cache helpers */
const isCacheValid = (timestamp: number): boolean =>
  Date.now() - timestamp < CACHE_DURATION;
const isCacheStale = (timestamp: number): boolean =>
  Date.now() - timestamp >= CACHE_DURATION;

/** Fetch full order details */
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { orders: OrderState };
      const cached = state.orders.orderDetailsCache[orderId];

      // Use cached data only if valid & not partial
      if (cached && isCacheValid(cached.timestamp) && !cached.isPartial) {
        return { orderId, data: cached, fromCache: true };
      }

      const response = await orderDetailsService.getOrderDetails(orderId);
      if (response.error) throw new Error(response.error);

      const orderItems = response.data?.data?.content;
      if (!orderItems) throw new Error('No order data found');

      const data: CachedOrderData = {
        orderItems,
        timestamp: Date.now(),
        lastFetched: Date.now(),
        isPartial: false,
      };

      return { orderId, data, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch order details'
      );
    }
  }
);

/** Fetch order details by orderItemId */
export const fetchOrderDetailsByItemId = createAsyncThunk(
  'orders/fetchOrderDetailsByItemId',
  async (orderItemId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { orders: OrderState };
      const existing = Object.values(state.orders.orderDetailsCache).find(
        (entry) => entry.orderItems.some((i) => i.orderItemId === orderItemId)
      );
      if (existing && isCacheValid(existing.timestamp) && !existing.isPartial) {
        const parentOrderId = existing.orderItems[0].orderId;
        return { orderId: parentOrderId, data: existing, fromCache: true };
      }

      const response = await orderDetailsService.getOrderDetailsByItemId(
        orderItemId
      );
      if (response.error) throw new Error(response.error);

      const orderItem = response.data?.data;
      if (!orderItem) throw new Error('No order data found');

      const parentOrderId = orderItem.orderId;
      const data: CachedOrderData = {
        orderItems: [orderItem],
        timestamp: Date.now(),
        lastFetched: Date.now(),
        isPartial: false,
      };

      return { orderId: parentOrderId, data, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error
          ? err.message
          : 'Failed to fetch order details by item ID'
      );
    }
  }
);

/** Fetch order history list */
export const fetchOrderHistory = createAsyncThunk(
  'orders/fetchOrderHistory',
  async (
    params: OrderHistoryQueryParams | undefined,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { orders: OrderState };
      const cacheKey = createOrderHistoryCacheKey(params);
      const cached = state.orders.orderHistoryCache[cacheKey];

      if (cached && isCacheValid(cached.timestamp)) {
        return { cacheKey, data: cached, fromCache: true };
      }

      const response = await orderDetailsService.getMyOrderHistory(params);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('No order history data found');

      const data: CachedOrderHistoryData = {
        data: response.data,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to fetch order history'
      );
    }
  }
);

/** Background revalidation */
export const revalidateOrderHistoryInBackground = createAsyncThunk(
  'orders/revalidateOrderHistoryInBackground',
  async (params: OrderHistoryQueryParams | undefined, { rejectWithValue }) => {
    try {
      const response = await orderDetailsService.getMyOrderHistory(params);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('No order history data found');

      const cacheKey = createOrderHistoryCacheKey(params);
      const data: CachedOrderHistoryData = {
        data: response.data,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Background revalidation failed'
      );
    }
  }
);

/** Manual refresh */
export const refreshOrderHistory = createAsyncThunk(
  'orders/refreshOrderHistory',
  async (params: OrderHistoryQueryParams | undefined, { rejectWithValue }) => {
    try {
      const response = await orderDetailsService.getMyOrderHistory(params);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('No order history data found');

      const cacheKey = createOrderHistoryCacheKey(params);
      const data: CachedOrderHistoryData = {
        data: response.data,
        timestamp: Date.now(),
        lastFetched: Date.now(),
      };

      return { cacheKey, data, fromCache: false };
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Failed to refresh order history'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderCache(state) {
      state.orderDetailsCache = {};
      state.orderHistoryCache = {};
      state.currentOrderId = null;
      state.isStale = false;
    },
    clearOrderDetailsCache(state) {
      state.orderDetailsCache = {};
    },
    clearOrderHistoryCache(state) {
      state.orderHistoryCache = {};
    },
    clearCacheForOrder(state, action: PayloadAction<string>) {
      delete state.orderDetailsCache[action.payload];
    },
    setCurrentOrderId(state, action: PayloadAction<string | null>) {
      state.currentOrderId = action.payload;
    },
    setStale(state, action: PayloadAction<boolean>) {
      state.isStale = action.payload;
    },
    checkStaleStatus(state) {
      const key = state.currentCacheKey;
      if (key && state.orderHistoryCache[key]) {
        const cached = state.orderHistoryCache[key];
        state.isStale = isCacheStale(cached.timestamp);
      } else state.isStale = false;
    },
  },
  extraReducers: (builder) => {
    builder
      /** Order Details */
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentOrderId = action.payload.orderId;

        if (!action.payload.fromCache) {
          state.orderDetailsCache[action.payload.orderId] = action.payload.data;
        }
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /** Order Details by Item ID */
      .addCase(fetchOrderDetailsByItemId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetailsByItemId.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentOrderId = action.payload.orderId;

        if (!action.payload.fromCache) {
          state.orderDetailsCache[action.payload.orderId] = action.payload.data;
        }
      })
      .addCase(fetchOrderDetailsByItemId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /** Order History */
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        if (!action.payload.fromCache) {
          state.orderHistoryCache[action.payload.cacheKey] =
            action.payload.data;

          /** Safely extract paginated content */
          const historyData = action.payload.data.data as {
            content?: OrderItemResponse[];
          };

          const content: OrderItemResponse[] = Array.isArray(
            historyData?.content
          )
            ? historyData.content
            : [];

          /** Seed shallow entries into detail cache */
          content.forEach((item) => {
            const orderId = item.orderId;
            if (orderId && !state.orderDetailsCache[orderId]) {
              state.orderDetailsCache[orderId] = {
                orderItems: [item],
                timestamp: Date.now(),
                lastFetched: Date.now(),
                isPartial: true, // mark as shallow
              };
            }
          });
        }

        if (action.payload.fromCache) {
          const cached = state.orderHistoryCache[action.payload.cacheKey];
          state.isStale = cached ? isCacheStale(cached.timestamp) : false;
        } else {
          state.isStale = false;
        }
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /** Background revalidation */
      .addCase(revalidateOrderHistoryInBackground.pending, (state) => {
        state.backgroundLoading = true;
      })
      .addCase(
        revalidateOrderHistoryInBackground.fulfilled,
        (state, action) => {
          state.backgroundLoading = false;
          state.error = null;
          if (!action.payload.fromCache) {
            state.orderHistoryCache[action.payload.cacheKey] =
              action.payload.data;
            state.isStale = false;
          }
        }
      )
      .addCase(revalidateOrderHistoryInBackground.rejected, (state) => {
        state.backgroundLoading = false;
      })

      /** Manual refresh */
      .addCase(refreshOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;
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
