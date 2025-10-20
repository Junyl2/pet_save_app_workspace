import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductPageInfo } from '@/app/api/types/products/products';
import { ProductService } from '@/app/api/services/client/productService/productService';
import { SellerProductListService } from '@/app/api/services/client/productService/sellerProductListService';

export interface ProductCacheKey {
  category?: string;
  searchTerm?: string;
  storeId?: string;
  page: number;
}

export interface CachedProductData {
  products: Product[];
  pageInfo: ProductPageInfo;
  timestamp: number;
  lastFetched: number;
  locationHash?: string; // Track location for cache invalidation
}

interface ProductState {
  cache: Record<string, CachedProductData>;
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
  currentCacheKey: string | null;
  isStale: boolean;
  lastLocationHash: string | null;
}

const initialState: ProductState = {
  cache: {},
  loading: false,
  backgroundLoading: false,
  error: null,
  currentCacheKey: null,
  isStale: false,
  lastLocationHash: null,
};

// Cache duration: 10 seconds (configurable) - much faster for better UX
const CACHE_DURATION = 10 * 1000;

// Helper function to create cache key
const createCacheKey = (params: ProductCacheKey): string => {
  const { category, searchTerm, storeId, page } = params;
  return `${storeId || 'general'}_${category || 'all'}_${
    searchTerm || ''
  }_${page}`;
};

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Helper function to check if cache is stale
const isCacheStale = (timestamp: number): boolean => {
  return Date.now() - timestamp >= CACHE_DURATION;
};

// Helper function to get current location hash
const getCurrentLocationHash = (): string => {
  const selectedLat = localStorage.getItem('selectedLocationLat');
  const selectedLong = localStorage.getItem('selectedLocationLong');
  return `${selectedLat || 'none'}_${selectedLong || 'none'}`;
};

// Helper function to check if location has changed
const hasLocationChanged = (
  currentLocationHash: string,
  lastLocationHash: string | null
): boolean => {
  return lastLocationHash !== null && currentLocationHash !== lastLocationHash;
};

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: ProductCacheKey, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { products: ProductState };
      const cacheKey = createCacheKey(params);
      const cachedData = state.products.cache[cacheKey];
      const currentLocationHash = getCurrentLocationHash();

      // Check if location has changed - if so, invalidate cache
      if (
        hasLocationChanged(currentLocationHash, state.products.lastLocationHash)
      ) {
        console.log('📍 Location changed, invalidating product cache');
        // Don't return cached data if location changed
      } else if (cachedData && isCacheValid(cachedData.timestamp)) {
        return { cacheKey, data: cachedData, fromCache: true };
      }

      const { category, searchTerm, storeId, page } = params;
      let res;

      if (storeId) {
        // Use store-specific API when storeId is provided
        const storeParams = {
          storeId,
          keyword: searchTerm?.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page,
          size: 10,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        res = await SellerProductListService.getProductsByStoreId(storeParams);
      } else {
        // Use general product search API
        const searchParams = {
          keyword: searchTerm?.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page,
          size: 10,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        res = await ProductService.searchProducts(searchParams);
      }

      if (res.error) {
        throw new Error(res.error);
      }

      const products = res.data?.data?.content || [];
      const pageInfo = res.data?.data?.pageInfo || {
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
        first: true,
        last: false,
        hasNext: false,
        hasPrevious: false,
      };

      const data: CachedProductData = {
        products,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
        locationHash: currentLocationHash,
      };

      return {
        cacheKey,
        data,
        fromCache: false,
        locationHash: currentLocationHash,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch products'
      );
    }
  }
);

// Background revalidation thunk for products
export const revalidateProductsInBackground = createAsyncThunk(
  'products/revalidateProductsInBackground',
  async (params: ProductCacheKey, { rejectWithValue }) => {
    try {
      console.log('🔄 Background revalidating products...');
      const currentLocationHash = getCurrentLocationHash();

      const { category, searchTerm, storeId, page } = params;
      let res;

      if (storeId) {
        // Use store-specific API when storeId is provided
        const storeParams = {
          storeId,
          keyword: searchTerm?.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page,
          size: 10,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        res = await SellerProductListService.getProductsByStoreId(storeParams);
      } else {
        // Use general product search API
        const searchParams = {
          keyword: searchTerm?.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page,
          size: 10,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        res = await ProductService.searchProducts(searchParams);
      }

      if (res.error) {
        throw new Error(res.error);
      }

      const products = res.data?.data?.content || [];
      const pageInfo = res.data?.data?.pageInfo || {
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
      const data: CachedProductData = {
        products,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
        locationHash: currentLocationHash,
      };

      console.log('✅ Background revalidation completed, new data:', data);
      return {
        cacheKey,
        data,
        fromCache: false,
        locationHash: currentLocationHash,
      };
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

// Manual refresh thunk for products
export const refreshProducts = createAsyncThunk(
  'products/refreshProducts',
  async (params: ProductCacheKey, { rejectWithValue }) => {
    try {
      console.log('🔄 Manual refresh of products...');
      const currentLocationHash = getCurrentLocationHash();

      const { category, searchTerm, storeId, page } = params;
      let res;

      if (storeId) {
        // Use store-specific API when storeId is provided
        const storeParams = {
          storeId,
          keyword: searchTerm?.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page,
          size: 10,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        res = await SellerProductListService.getProductsByStoreId(storeParams);
      } else {
        // Use general product search API
        const searchParams = {
          keyword: searchTerm?.trim() || undefined,
          categoryName: category || undefined,
          registrationStatus: 'ONSALE' as const,
          page,
          size: 10,
          sortBy: 'createdAt' as const,
          direction: 'desc' as const,
        };

        res = await ProductService.searchProducts(searchParams);
      }

      if (res.error) {
        throw new Error(res.error);
      }

      const products = res.data?.data?.content || [];
      const pageInfo = res.data?.data?.pageInfo || {
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
      const data: CachedProductData = {
        products,
        pageInfo,
        timestamp: Date.now(),
        lastFetched: Date.now(),
        locationHash: currentLocationHash,
      };

      return {
        cacheKey,
        data,
        fromCache: false,
        locationHash: currentLocationHash,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh products'
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCache: (state) => {
      state.cache = {};
      state.currentCacheKey = null;
      state.isStale = false;
      state.lastLocationHash = null;
    },
    clearCacheForCategory: (
      state,
      action: PayloadAction<{ category?: string; storeId?: string }>
    ) => {
      const { category, storeId } = action.payload;
      const keysToDelete = Object.keys(state.cache).filter((key) => {
        const keyParts = key.split('_');
        const keyStoreId = keyParts[0];
        const keyCategory = keyParts[1];
        return (
          (storeId ? keyStoreId === storeId : keyStoreId === 'general') &&
          (category ? keyCategory === category : keyCategory === 'all')
        );
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
    invalidateCacheForLocationChange: (state) => {
      // Clear all cache when location changes
      state.cache = {};
      state.currentCacheKey = null;
      state.isStale = false;
      state.lastLocationHash = getCurrentLocationHash();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Only update cache if data is not from cache
        if (!action.payload.fromCache) {
          state.cache[action.payload.cacheKey] = action.payload.data;
          state.lastLocationHash =
            action.payload.locationHash || getCurrentLocationHash();
          state.isStale = false;
        } else {
          // Check if cached data is stale
          const cachedData = state.cache[action.payload.cacheKey];
          if (cachedData) {
            state.isStale = isCacheStale(cachedData.timestamp);
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Background Revalidation
      .addCase(revalidateProductsInBackground.pending, (state) => {
        state.backgroundLoading = true;
      })
      .addCase(revalidateProductsInBackground.fulfilled, (state, action) => {
        state.backgroundLoading = false;
        state.error = null;

        // Always update cache with fresh data
        if (!action.payload.fromCache) {
          state.cache[action.payload.cacheKey] = action.payload.data;
          state.lastLocationHash =
            action.payload.locationHash || getCurrentLocationHash();
          state.isStale = false;
        }
      })
      .addCase(revalidateProductsInBackground.rejected, (state, action) => {
        state.backgroundLoading = false;
        // Don't set error for background revalidation failures
        console.warn('Background revalidation failed:', action.payload);
      })
      // Manual Refresh
      .addCase(refreshProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentCacheKey = action.payload.cacheKey;

        // Always update cache with fresh data
        state.cache[action.payload.cacheKey] = action.payload.data;
        state.lastLocationHash =
          action.payload.locationHash || getCurrentLocationHash();
        state.isStale = false;
      })
      .addCase(refreshProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearCache,
  clearCacheForCategory,
  setCurrentCacheKey,
  setStale,
  checkStaleStatus,
  invalidateCacheForLocationChange,
} = productSlice.actions;
export default productSlice.reducer;
