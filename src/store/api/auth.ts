import {
  UserResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

import { apiSlice } from "../initalState";
const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["user", "admin-user", "product", "order"],
});

export const authApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    // Signin Endpoint
    login: builder.mutation<UserResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/api/v1/user/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: credentials,
      }),
    }),

    // Signup Endpoint
    registration: builder.mutation<UserResponse, RegisterCredentials>({
      query: (credential) => ({
        url: "/api/v1/user/register",
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: credential,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useLoginMutation, useRegistrationMutation } = authApiSlice;
