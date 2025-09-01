import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import authReducer from './slices/authSlice';  // 👈 add this

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    auth: authReducer,  // 👈 add this
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
