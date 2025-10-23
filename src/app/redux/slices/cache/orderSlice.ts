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
}

export interface CachedOrderHistoryData {
  data: OrderHistoryApiResponse;
  timestamp: number;
}

interface OrderState {
  // Cache for individual order details by orderId
  orderDetailsCache: Record<string, CachedOrderData>;
  // Cache for order history by query params
  orderHistoryCache: Record<string, CachedOrderHistoryData>;
  loading: boolean;
  error: string | null;
  currentOrderId: string | null;
}

const initialState: OrderState = {
  orderDetailsCache: {},
  orderHistoryCache: {},
  loading: false,
  error: null,
  currentOrderId: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

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
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch order history'
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

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.orderHistoryCache[action.payload.cacheKey] =
            action.payload.data;
        }
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
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
} = orderSlice.actions;
export default orderSlice.reducer;
