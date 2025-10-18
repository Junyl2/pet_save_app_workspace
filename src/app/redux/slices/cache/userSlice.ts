import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MemberInfo, MemberApiResponse } from '@/app/api/types/member/member';
import { MemberService } from '@/app/api/services/client/memberService/memberService';

export interface CachedUserData {
  userInfo: MemberInfo;
  timestamp: number;
}

interface UserState {
  userInfo: MemberInfo | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 10 minutes (user data changes less frequently)
const CACHE_DURATION = 10 * 60 * 1000;

// Helper function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserCache: (state) => {
      state.userInfo = null;
      state.lastFetched = null;
      state.error = null;
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
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserCache, updateUserInfo, setUserInfo } =
  userSlice.actions;
export default userSlice.reducer;
