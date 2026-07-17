import { apiSlice } from "../initalState";

export type Brochure = {
  _id: string;
  title: string;
  image: string;
  originalName?: string;
  createdAt?: string;
  updatedAt?: string;
};

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["brochures"],
});

export const BrochuresApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    getBrochures: builder.query<
      { success: boolean; brochures: Brochure[]; count: number },
      void
    >({
      query: () => ({
        url: "/api/v1/brochures",
        method: "GET",
      }),
      providesTags: ["brochures"],
    }),
    createBrochure: builder.mutation<any, FormData>({
      query: (body) => ({
        url: "/api/v1/brochures",
        method: "POST",
        body,
      }),
      invalidatesTags: ["brochures"],
    }),
    updateBrochure: builder.mutation<
      any,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/api/v1/brochures/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["brochures"],
    }),
    deleteBrochure: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/brochures/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["brochures"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBrochuresQuery,
  useCreateBrochureMutation,
  useUpdateBrochureMutation,
  useDeleteBrochureMutation,
} = BrochuresApiSlice;
