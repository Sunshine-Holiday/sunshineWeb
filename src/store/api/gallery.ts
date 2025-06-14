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
    deleteGallery: builder.mutation<void, void>({
      query: (credentials:any) => ({
        url: `/api/v1/gallery/${credentials._id}`,
        method: "DELETE",

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

    uploadHomeImage: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/home/upload",
        method: "POST",

        body: credentials,
      }),

      invalidatesTags: ["gallery"],
    }),

UpdateImageSequence: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/home/sequence",
        method: "PUT",

        body: credentials,
      }),

      invalidatesTags: ["gallery"],
    }),




deleteHomeImage: builder.mutation<void, void>({
      query: (credentials:any) => ({
        url: "/api/v1/home/"+credentials,
        method: "Delete",

        body: credentials,
      }),

      invalidatesTags: ["gallery"],
    }),


    getHomeImages: builder.query<void, void>({
      query: () => ({
        url: "/api/v1/home",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["gallery"],
    }),



  }),
  overrideExisting: true,
});

export const { useCreateGalleryMutation, useGetGalleryQuery,useDeleteGalleryMutation,useGetHomeImagesQuery,useDeleteHomeImageMutation,useUploadHomeImageMutation, useUpdateImageSequenceMutation} = GalleryApiSlice;
