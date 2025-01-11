import {
  UserResponse,
  LoginCredentials,
  RegisterCredentials,
  forgetPasswordCredentails,
  DataResponse,
  verifyforgetPasswordlOTP,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: credential,
      }),
    }),

    forgetPassword: builder.mutation<DataResponse, forgetPasswordCredentails>({
      query: (credential) => ({
        url: "/api/v1/user/forgotpassword",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: credential,
      }),
    }),

    otpVerify: builder.mutation<DataResponse, verifyforgetPasswordlOTP>({
      query: (credential) => ({
        url: "/api/v1/user/otp-check",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: credential,
      }),
    }),

    resetPassword: builder.mutation<DataResponse, verifyforgetPasswordlOTP>({
      query: (credential) => ({
        url: "/api/v1/user/reset-password",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: credential,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegistrationMutation,
  useForgetPasswordMutation,
  useOtpVerifyMutation,
  useResetPasswordMutation
} = authApiSlice;
