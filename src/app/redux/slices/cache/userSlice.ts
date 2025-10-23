import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MemberInfo } from '@/app/api/types/member/member';
import { MemberService } from '@/app/api/services/client/memberService/memberService';

export interface CachedUserData {
  userInfo: MemberInfo;
  timestamp: number;
}

interface UserState {
  userInfo: MemberInfo | null;
  loading: boolean;
  backgroundLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  isStale: boolean;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  backgroundLoading: false,
  error: null,
  lastFetched: null,
  isStale: false,
};

// Cache duration: 10 seconds (configurable) - much faster for better UX
const CACHE_DURATION = 10 * 1000;

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Helper function to check if cache is stale
const isCacheStale = (timestamp: number): boolean => {
  return Date.now() - timestamp >= CACHE_DURATION;
};

// Async thunk for fetching user info
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const { userInfo, lastFetched } = state.user;

      // Return cached data if it exists and is valid
      if (userInfo && lastFetched && isCacheValid(lastFetched)) {
        return { userInfo, fromCache: true };
      }

      console.log('🔄 Fetching user info from API...');
      const response = await MemberService.getMyInfo();

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.success || !response.data?.data) {
        throw new Error('Failed to get user information');
      }

      const userData = response.data.data;
      console.log('✅ User info fetched successfully:', userData);

      return { userInfo: userData, fromCache: false };
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch user info'
      );
    }
  }
);

// Background revalidation thunk for user info
export const revalidateUserInfoInBackground = createAsyncThunk(
  'user/revalidateUserInfoInBackground',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Background revalidating user info...');
      const response = await MemberService.getMyInfo();

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.success || !response.data?.data) {
        throw new Error('Failed to get user information');
      }

      const userData = response.data.data;
      console.log(
        '✅ Background revalidation completed, new user info:',
        userData
      );
      return { userInfo: userData, fromCache: false };
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

// Manual refresh thunk for user info
export const refreshUserInfo = createAsyncThunk(
  'user/refreshUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Manual refresh of user info...');
      const response = await MemberService.getMyInfo();

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data?.success || !response.data?.data) {
        throw new Error('Failed to get user information');
      }

      const userData = response.data.data;
      return { userInfo: userData, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh user info'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserCache: (state) => {
      state.userInfo = null;
      state.lastFetched = null;
      state.error = null;
      state.isStale = false;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<MemberInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        state.lastFetched = Date.now();
      }
    },
    setUserInfo: (state, action: PayloadAction<MemberInfo>) => {
      state.userInfo = action.payload;
      state.lastFetched = Date.now();
      state.error = null;
    },
    setStale: (state, action: PayloadAction<boolean>) => {
      state.isStale = action.payload;
    },
    checkStaleStatus: (state) => {
      if (state.lastFetched) {
        state.isStale = isCacheStale(state.lastFetched);
      } else {
        state.isStale = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.userInfo = action.payload.userInfo;

        // Only update timestamp if data is not from cache
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
          state.isStale = false;
        } else {
          // Check if cached data is stale
          if (state.lastFetched) {
            state.isStale = isCacheStale(state.lastFetched);
          }
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Background Revalidation
      .addCase(revalidateUserInfoInBackground.pending, (state) => {
        state.backgroundLoading = true;
      })
      .addCase(revalidateUserInfoInBackground.fulfilled, (state, action) => {
        state.backgroundLoading = false;
        state.error = null;

        // Always update with fresh data
        if (!action.payload.fromCache) {
          state.userInfo = action.payload.userInfo;
          state.lastFetched = Date.now();
          state.isStale = false;
        }
      })
      .addCase(revalidateUserInfoInBackground.rejected, (state, action) => {
        state.backgroundLoading = false;
        // Don't set error for background revalidation failures
        console.warn('Background revalidation failed:', action.payload);
      })
      // Manual Refresh
      .addCase(refreshUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Always update with fresh data
        state.userInfo = action.payload.userInfo;
        state.lastFetched = Date.now();
        state.isStale = false;
      })
      .addCase(refreshUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearUserCache,
  updateUserInfo,
  setUserInfo,
  setStale,
  checkStaleStatus,
} = userSlice.actions;
export default userSlice.reducer;
