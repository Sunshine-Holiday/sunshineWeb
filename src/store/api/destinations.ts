import { apiSlice } from "../initalState";

export interface DestinationPage {
  _id?: string;
  slug: string;
  name: string;
  description: string;
  banner?: string;
}

const destinationsApi = apiSlice
  .enhanceEndpoints({ addTagTypes: ["destinations"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getDestinationPages: builder.query<
        { success: boolean; destinations: DestinationPage[] },
        void
      >({
        query: () => "/api/v1/destinations",
        providesTags: ["destinations"],
      }),
      getDestinationPage: builder.query<
        { success: boolean; destination: DestinationPage | null },
        string
      >({
        query: (slug) => `/api/v1/destinations/${slug}`,
        providesTags: (_result, _error, slug) => [
          { type: "destinations", id: slug },
        ],
      }),
      updateDestinationPage: builder.mutation<
        { success: boolean; destination: DestinationPage; message: string },
        { slug: string; formData: FormData }
      >({
        query: ({ slug, formData }) => ({
          url: `/api/v1/destinations/${slug}`,
          method: "PUT",
          body: formData,
        }),
        invalidatesTags: (_result, _error, { slug }) => [
          "destinations",
          { type: "destinations", id: slug },
        ],
      }),
    }),
    overrideExisting: true,
  });

export const {
  useGetDestinationPagesQuery,
  useGetDestinationPageQuery,
  useUpdateDestinationPageMutation,
} = destinationsApi;
