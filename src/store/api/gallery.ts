import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["gallery"],
});
export const GalleryApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createGallery: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/gallery",
        method: "post",

        body: credentials,
      }),

      invalidatesTags: ["gallery"],
    }),

    getGallery: builder.query<void, void>({
      query: () => ({
        url: "/api/v1/gallery",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["gallery"],
    }),
  }),
  overrideExisting: true,
});

export const { useCreateGalleryMutation, useGetGalleryQuery } = GalleryApiSlice;
