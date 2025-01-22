import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["term", "about"],
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
  useGetAboutQuery,
} = TermsApiSlice;
