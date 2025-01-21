import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["term"],
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

export const { useGetTermsQuery, useCreatetermsMutation } = TermsApiSlice;
