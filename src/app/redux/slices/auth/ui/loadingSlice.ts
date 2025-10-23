import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingState {
  hasLoadedOnce: {
    [key: string]: boolean;
  };
}

const initialState: LoadingState = {
  hasLoadedOnce: {},
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setHasLoadedOnce: (state, action: PayloadAction<string>) => {
      state.hasLoadedOnce[action.payload] = true;
    },
    resetHasLoadedOnce: (state, action: PayloadAction<string>) => {
      delete state.hasLoadedOnce[action.payload];
    },
    clearAllHasLoadedOnce: (state) => {
      state.hasLoadedOnce = {};
    },
  },
});

export const { setHasLoadedOnce, resetHasLoadedOnce, clearAllHasLoadedOnce } =
  loadingSlice.actions;
export default loadingSlice.reducer;
