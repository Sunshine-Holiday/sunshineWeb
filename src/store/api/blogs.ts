import { blogCredential, BlogResponse } from "@/types/blogs";
import { apiSlice } from "../initalState";

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ["blog"],
});
export const blogApiSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    createBlog: builder.mutation<BlogResponse, blogCredential>({
      query: (credentials) => ({
        url: "/api/v1/blog/create-blogs",
        method: "POST",

        body: credentials,
      }),

      invalidatesTags: ["blog"],
    }),
    updateBlogs: builder.mutation<BlogResponse, { form: blogCredential; id: string }>({
        query: (credentials) => {
          console.log('Blog ID:', credentials.id);  // Log the ID here
          return {
            url: `/api/v1/blog/update-blog/${credentials.id}`,
            method: "PUT",
            body: credentials.form,
          };
        },
        invalidatesTags: ["blog"],
      }),
      
    deleteBlog: builder.mutation<
      BlogResponse,
      {
        id: string;
      }
    >({
      query: (credentials) => ({
        url: `/api/v1/blog/delete-blog/${credentials.id}`,
        method: "DELETE",

        body: credentials,
      }),

      invalidatesTags: ["blog"],
    }),
    getAllBlogs: builder.query<void, void>({
      query: () => ({
        url: "/api/v1/blog/blogs",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
      providesTags: ["blog"],
    }),
    getBlogsID: builder.query<BlogResponse, { id: string }>({
      query: (credential: { id: string }) => {
        console.log("Fetching blog with ID:", credential.id);
        return {
          url: `/api/v1/blog/blogs/${credential.id}`,
          method: "GET",
        };
      },
      keepUnusedDataFor: 0,
      providesTags: ["blog"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateBlogMutation,
  useGetAllBlogsQuery,
  useGetBlogsIDQuery,
  useDeleteBlogMutation,
  useUpdateBlogsMutation,
} = blogApiSlice;
