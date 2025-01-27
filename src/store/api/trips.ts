import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["trips"],
});
export const TripsApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createtrips: builder.mutation<void, void>({
      query: (credentials) => ({
        url: "/api/v1/trips",
        method: "post",

        body: credentials,
      }),

      invalidatesTags: ["trips"],
    }),
    editTtips: builder.mutation<void, void>({
      query: (credentials) => ({
        url: `/api/v1/trips/${credentials._id}`,
        method: "PUT",
        body: credentials,
      }),

      invalidatesTags: ["trips"],
    }),
    deleteTtips: builder.mutation<void, void>({
      query: (id) => ({
        url: `/api/v1/trips/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["trips"],
    }),
    gettripsID: builder.query<void, void>({
      query: (credentials: any) => ({
        url: `/api/v1/trips/${credentials.id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
    gettrips: builder.query<void, void>({
      query: (credentials: any) => ({
        url: `/api/v1/trips`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreatetripsMutation,
  useGettripsQuery,
  useGettripsIDQuery,
  useDeleteTtipsMutation,
  useEditTtipsMutation
} = TripsApiSlice;
