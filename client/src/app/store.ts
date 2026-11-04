import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authReducer from './authSlice';

// configureStore wraps createStore with good defaults:
// Redux DevTools, thunk middleware, and serializability checks.
// Adding api.middleware enables RTK Query's caching, polling, and
// automatic cache invalidation via tags.
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
