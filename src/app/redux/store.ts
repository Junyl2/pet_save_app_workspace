import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/cache/productSlice';
import orderReducer from './slices/cache/orderSlice';
import pointsReducer from './slices/cache/pointsSlice';
import reviewReducer from './slices/cache/reviewSlice';
import userReducer from './slices/cache/userSlice';
import loadingReducer from './slices/auth/ui/loadingSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    orders: orderReducer,
    points: pointsReducer,
    reviews: reviewReducer,
    user: userReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
