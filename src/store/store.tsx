import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./initalState";

import authReducer from "./reducer/auth";
export const RAZORPAY_API_KEY = import.meta.env.VITE_RAZORPAY_API_KEY;
export const IMAGE_URL="https://api.sunshineholidaypackages.com/"
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,

    // otp: otpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
