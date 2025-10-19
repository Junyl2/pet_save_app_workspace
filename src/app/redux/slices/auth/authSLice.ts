import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '@/app/api/services/client/auth/authService';
/* import { LogoutResponse } from '@/app/api/types/auth/Login'; */
import { clearCache as clearProductCache } from '../cache/productSlice';
import { clearOrderCache } from '../cache/orderSlice';
import { clearCache as clearReviewCache } from '../cache/reviewSlice';
import { clearUserCache } from '../cache/userSlice';
import { clearPointsCache } from '../cache/pointsSlice';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
};

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      console.log('Starting logout process...');

      const response = await AuthService.logout();

      if (response.error) {
        console.error('Logout API failed:', response.error);
        // Still proceed with logout even if API fails
      } else {
        console.log('Logout successful:', response.data);
      }

      // Clear all cached data from all slices
      console.log('Clearing all cached data...');
      dispatch(clearProductCache());
      dispatch(clearOrderCache());
      dispatch(clearReviewCache());
      dispatch(clearUserCache());
      dispatch(clearPointsCache());

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('sellerId');
      localStorage.removeItem('favorites');
      sessionStorage.clear();

      console.log('All cached data cleared successfully');
      return { success: true, message: 'Logout completed successfully' };
    } catch (error) {
      console.error('Logout error:', error);

      // Still clear all cached data even if there's an error
      console.log('Clearing all cached data despite error...');
      dispatch(clearProductCache());
      dispatch(clearOrderCache());
      dispatch(clearReviewCache());
      dispatch(clearUserCache());
      dispatch(clearPointsCache());

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('sellerId');
      localStorage.removeItem('favorites');
      sessionStorage.clear();

      return { success: true, message: 'Logout completed locally' };
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Still clear auth state even on error
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { setAuthenticated, setUser, clearAuth, setError, clearError } =
  authSlice.actions;

export default authSlice.reducer;
