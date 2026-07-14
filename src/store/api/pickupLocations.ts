import { apiSlice } from "../initalState";

export type PickupLocation = {
  _id: string;
  name: string;
  maplink?: string;
  details?: string;
  createdAt?: string;
  updatedAt?: string;
};

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["pickupLocations"],
});

export const PickupLocationsApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    getPickupLocations: builder.query<
      { success: boolean; locations: PickupLocation[]; count: number },
      void
    >({
      query: () => ({
        url: "/api/v1/pickup-locations",
        method: "GET",
      }),
      providesTags: ["pickupLocations"],
    }),
    createPickupLocation: builder.mutation<
      any,
      { name: string; maplink?: string; details?: string }
    >({
      query: (body) => ({
        url: "/api/v1/pickup-locations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["pickupLocations"],
    }),
    updatePickupLocation: builder.mutation<
      any,
      { id: string; name: string; maplink?: string; details?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/pickup-locations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["pickupLocations"],
    }),
    deletePickupLocation: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/pickup-locations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["pickupLocations"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetPickupLocationsQuery,
  useCreatePickupLocationMutation,
  useUpdatePickupLocationMutation,
  useDeletePickupLocationMutation,
} = PickupLocationsApiSlice;
