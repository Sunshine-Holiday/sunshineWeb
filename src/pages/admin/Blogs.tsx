import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { BlogCard } from "./components/BlogsCard";

import { Plus } from "lucide-react";
import { useDeleteBlogMutation, useGetAllBlogsQuery } from "@/store/api/blogs";
import { toast } from "react-toastify";

// Skeleton loader component for the blog cards
const SkeletonLoader = () => {
  return (
    <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg shadow-md"></div>
  );
};

const BlogPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllBlogsQuery();
  const [deleteBlogsID] = useDeleteBlogMutation();
  const handleCreateBlog = () => {
    navigate("/admin/blog/create"); // Redirect to the blog creation page
  };
  const deleteBlog = async (id: string) => {
    console.log("Deleting blog with id:", id); // Log the id to the console
    try {
      const resp = await deleteBlogsID({ id }).unwrap();
      toast.success(resp.message);
      console.log(resp);
    } catch (error) {
      console.log(error);
    }
  };

  const editBlogs = (id:string) => {
    navigate(`/admin/blog/edit/${id}`);
    console.log("edit blog with id:", id); // Log the id to the console
  };
  return (
    <div className="relative min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Travel Blog
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Stories, tips, and insights from our travel experts
          </p>
        </motion.div>

        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Show skeleton loader while data is loading */}
          {isLoading
            ? Array(6)
                .fill(0)
                .map((_, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="w-full"
                  >
                    <SkeletonLoader />
                  </motion.div>
                ))
            : data?.blogs.map((post) => (
                <motion.div
                  key={post._id}
                  variants={fadeInUp}
                  className="w-full"
                >
                  <BlogCard
                    post={post}
                    onDelete={(id) => {
                      deleteBlog(id);
                    }}
                    onEdit={(id) => {
                      editBlogs(id);
                    }}
                  />
                </motion.div>
              ))}
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleCreateBlog}
        className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Create New Blog"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default BlogPage;
