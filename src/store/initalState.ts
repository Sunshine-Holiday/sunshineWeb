import { CustomError } from "@/types/auth";
import {
  BaseQueryFn,
  FetchArgs,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const SERVER_URL = import.meta.env.VITE_API_SERVER;
console.log(SERVER_URL); // Make sure this prints the correct URL

// Function to get token from localStorage
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Base query with token preparation
const baseQuery = fetchBaseQuery({
  baseUrl: SERVER_URL as string,
  credentials: "include", // Ensures cookies are sent if needed
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Define the API slice
export const apiSlice = createApi({
  baseQuery: baseQuery as BaseQueryFn<
    string | FetchArgs,
    unknown,
    CustomError,
    {}
  >,
  
  endpoints: (builder) => ({
    userDetail: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),

    }),
  }),
});

// Export hooks for usage in components
export const { useUserDetailQuery } = apiSlice;
