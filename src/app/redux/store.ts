import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/cache/productSlice';
import orderReducer from './slices/cache/orderSlice';
import reviewReducer from './slices/cache/reviewSlice';
import userReducer from './slices/cache/userSlice';
import pointsReducer from './slices/cache/pointsSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    orders: orderReducer,
    reviews: reviewReducer,
    user: userReducer,
    points: pointsReducer,
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
