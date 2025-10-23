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
}

interface ProductState {
  cache: Record<string, CachedProductData>;
  loading: boolean;
  error: string | null;
  currentCacheKey: string | null;
}

const initialState: ProductState = {
  cache: {},
  loading: false,
  error: null,
  currentCacheKey: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

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

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: ProductCacheKey, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { products: ProductState };
      const cacheKey = createCacheKey(params);
      const cachedData = state.products.cache[cacheKey];

      // Return cached data if it exists and is valid
      if (cachedData && isCacheValid(cachedData.timestamp)) {
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
      };

      return { cacheKey, data, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch products'
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
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCache, clearCacheForCategory, setCurrentCacheKey } =
  productSlice.actions;
export default productSlice.reducer;
