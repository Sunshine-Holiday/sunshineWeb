import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["booking"],
});
export const BookingApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createbooking: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/booking",
        method: "post",

        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),
    editTtips: builder.mutation<any, any>({
      query: (credentials) => ({
        url: `/api/v1/booking/${credentials._id}`,
        method: "PUT",
        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),
    deleteTtips: builder.mutation<any, any>({
      query: (id) => ({
        url: `/api/v1/booking/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["booking"],
    }),
    getbookingID: builder.query<any, any>({
      query: (credentials: any) => ({
        url: `/api/v1/booking/${credentials.id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),
    getbooking: builder.query<void, void>({
      query: (credentials: any) => ({
        url: `/api/v1/booking`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreatebookingMutation,
  useDeleteTtipsMutation,
  useGetbookingIDQuery,
  useGetbookingQuery,
} = BookingApiSlice;
