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
      query: (credentials) =>{
   const {_id}= Object.fromEntries(credentials)
        
        return({
        url: `/api/v1/trips/${_id}`,
        method: "PUT",
        body: credentials,
      })},

      invalidatesTags: ["trips"],
    }),
    selectedDateBooking: builder.query<any, any>({
      query: ({ trip_id, selectedDate }: any) =>{
     
       return ({
          url: `/api/v1/booking/stats/trip-date/${trip_id}?selectedDate=${selectedDate}`,
          method: "GET",
        })
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
    deleteTrips: builder.mutation<any, any>({
      query: (id) => ({
        url: `/api/v1/trips/trip/${id}`,
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
  useSelectedDateBookingQuery
} = TripsApiSlice;
