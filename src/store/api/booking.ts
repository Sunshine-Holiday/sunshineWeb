import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["booking"],
});
export const BookingApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createbooking: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/booking",
        method: "POST",

        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),
    createReview: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/review",
        method: "POST",

        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),

    updateBooking: builder.mutation<any, any>({
      query: (credentials) => ({
        url: `/api/v1/review/bookings/${credentials.bookingId}`,
        method: "PUT",

        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),
    UpdateReview: builder.mutation<any, any>({
      query: (credentials) => ({
        url: `/api/v1/review/${credentials.reviewId}`,
        method: "PUT",

        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),



    requestCancelBooking: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/booking/request",
        method: "POST",

        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),
    processRefundAmount: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/booking/process",
        method: "POST",

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
    deleteBooking: builder.mutation<any, any>({
      query: (id) => ({
        url: `/api/v1/booking/delete/${id.deleteBookingId}`,
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
    getTripReviews: builder.query<any, any>({
      query: (credentials: any) => ({
        url: `/api/v1/review/${credentials.tripId}/date/${credentials.selectedDate}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),
    getbooking: builder.query<any, any>({
      query: ({ filter }: any) => ({
        url: `/api/v1/booking`,
        method: "GET",
        params: { filter },
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),

    getTripBookingStats: builder.query<any, any>({
      query: ({ trip }: any) => ({
        url: `/api/v1/booking/stats/${trip}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),

    getTripBookingHistory: builder.query<any, any>({
      query: ({ trip, date }: any) => ({
        url: `/api/v1/booking/history/${trip}/${date}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),
    updateTrip: builder.mutation<any, any>({
      query: (credentials) => ({
        url: `/api/v1/booking/update/${credentials.bookingId}`,
        method: "PUT",
        body: credentials,
      }),

      invalidatesTags: ["booking"],
    }),
    getIDbooking: builder.query<any, any>({
      query: ({ id }: any) => ({
        url: `/api/v1/booking/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),
    getuserAllbooking: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/booking/user`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["booking"],
    }),

    getuserAllprocessbooking: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/booking/process`,
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
  useGetuserAllbookingQuery,
  useGetIDbookingQuery,
  useGetTripBookingStatsQuery,
  useGetTripBookingHistoryQuery,
  useRequestCancelBookingMutation,
  useGetuserAllprocessbookingQuery,
  useProcessRefundAmountMutation,
  useUpdateTripMutation,
  useDeleteBookingMutation,
  useCreateReviewMutation,
  useGetTripReviewsQuery,
  useUpdateBookingMutation,
  useUpdateReviewMutation,

} = BookingApiSlice;
