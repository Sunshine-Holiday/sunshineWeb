import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["trips"],
});
export const TripsApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createtrips: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/trips",
        method: "post",

        body: credentials,
      }),

      invalidatesTags: ["trips"],
    }),
    editTrips: builder.mutation<any, any>({
      query: (credentials) => {
        const { _id } = Object.fromEntries(credentials);

        return {
          url: `/api/v1/trips/${_id}`,
          method: "PUT",
          body: credentials,
        };
      },

      invalidatesTags: ["trips"],
    }),
    selectedDateBooking: builder.query<any, any>({
      query: ({ trip_id, selectedDate, leg }: any) => {
        const params = new URLSearchParams();
        if (selectedDate) params.set("selectedDate", selectedDate);
        if (leg) params.set("leg", leg);
        return {
          url: `/api/v1/booking/stats/trip-date/${trip_id}?${params.toString()}`,
          method: "GET",
        };
      },
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
    gettripsID: builder.query<any, any>({
      query: (credentials: any) => ({
        url: `/api/v1/trips/${credentials.id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
    gettrips: builder.query<any, any>({
      query: (credentials: any) => ({
        url: `/api/v1/trips`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
    special_sections: builder.query<any, any>({
      query: (credentials: any) => ({
        url: `/api/v1/special-sections`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
    special_sectionsID: builder.query<any, any>({
      query: (credentials: any) => ({
        url: `/api/v1/special-sections/${credentials.id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["trips"],
    }),
    create_special_sections: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "/api/v1/special-sections",
        method: "POST",

        body: credentials,
      }),
      invalidatesTags: ["trips"],
    }),
    UpdateSpecialSection: builder.mutation<any, any>({
      query: (credentials) => ({
        url: `/api/v1/special-sections/${credentials.id}`,
        method: "PUT",

        body: credentials,
      }),
      invalidatesTags: ["trips"],
    }),
    DeleteSpecialSection: builder.mutation<any, any>({
      query: (credentials) => ({
        url: `/api/v1/special-sections/${credentials.id}`,
        method: "Delete",

        body: credentials,
      }),
      invalidatesTags: ["trips"],
    }),
    deleteTrips: builder.mutation<any, any>({
      query: (id) => ({
        url: `/api/v1/trips/trip/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["trips"],
    }),
    /** Update trip preference order; other trips auto-reorder */
    updateTripDisplayIndex: builder.mutation<
      any,
      { id: string; displayIndex: number }
    >({
      query: ({ id, displayIndex }) => ({
        url: `/api/v1/trips/${id}/display-index`,
        method: "PUT",
        body: { displayIndex },
      }),
      invalidatesTags: ["trips"],
    }),
    deleteBooking: builder.mutation<any, any>({
      query: (id) => ({
        url: `/api/v1/booking/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["trips"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreatetripsMutation,
  useGettripsQuery,
  useGettripsIDQuery,
  useDeleteTripsMutation,
  useEditTripsMutation,
  useSelectedDateBookingQuery,
  useCreate_special_sectionsMutation,
  useSpecial_sectionsQuery,
  useSpecial_sectionsIDQuery,
  useUpdateSpecialSectionMutation,
  useDeleteSpecialSectionMutation,
  useUpdateTripDisplayIndexMutation,
  useDeleteBookingMutation,
} = TripsApiSlice;
