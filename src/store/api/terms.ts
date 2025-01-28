import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["term", "about", "privacy"],
});
export const TermsApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createterms: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/terms/create-terms",
        method: "PUT",

        body: credentials,
      }),

      invalidatesTags: ["term"],
    }),
    createPaymentIntent: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/payment/create",
        method: "POST",

        body: credentials,
      }),

     
    }),

    createPrivacy: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/privacy",
        method: "PUT",

        body: credentials,
      }),

      invalidatesTags: ["term"],
    }),

    aboutTerms: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/about",
        method: "PUT",

        body: credentials,
      }),

      invalidatesTags: ["about"],
    }),
    getAbout: builder.query<void, void>({
      query: () => ({
        url: "/api/v1/about",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["term"],
    }),
    getPrivacy: builder.query<void, void>({
      query: () => ({
        url: "/api/v1/privacy",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["term"],
    }),
    getTerms: builder.query<void, void>({
      query: () => ({
        url: "/api/v1/terms",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["term"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTermsQuery,
  useCreatetermsMutation,
  useAboutTermsMutation,
  useCreatePrivacyMutation,
  useGetPrivacyQuery,
  useCreatePaymentIntentMutation,
  useGetAboutQuery,
} = TermsApiSlice;
