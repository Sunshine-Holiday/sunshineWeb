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
    editTrips: builder.mutation<void, void>({
      query: (credentials) =>{
        console.log("cred",credentials)
        return({
        url: `/api/v1/trips/${credentials._id}`,
        method: "PUT",
        body: credentials,
      })},

      invalidatesTags: ["trips"],
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
    deleteTrips: builder.mutation<void, void>({
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
  useEditTripsMutation
} = TripsApiSlice;
