import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { BlogCard } from "./components/BlogsCard";

import { Plus } from "lucide-react";
import { useDeleteBlogMutation, useGetAllBlogsQuery } from "@/store/api/blogs";
import { toast } from "react-toastify";

const SkeletonLoader = () => {
  return (
    <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg shadow-md"></div>
  );
};

const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const { data, isLoading } = useGetAllBlogsQuery();
  const [deleteBlogsID] = useDeleteBlogMutation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  useEffect(() => {
    if (data) {
      setBlogs(data?.blogs);
    }
  }, [data]);

  const handleCreateBlog = () => {
    navigate("/admin/blog/create");
  };

  const confirmDelete = (id) => {
    setBlogToDelete(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setBlogToDelete(null);
  };

  const deleteBlog = async () => {
    if (blogToDelete) {
      try {
        const resp = await deleteBlogsID({ id: blogToDelete }).unwrap();
        toast.success(resp.message);
        setBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => blog._id !== blogToDelete)
        );
        closeModal();
      } catch (error) {
        toast.error("Failed to delete the blog");
        console.error(error);
      }
    }
  };
  
  const editBlogs = (id) => {
    navigate(`/admin/blog/edit/${id}`);
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
            : blogs.map((post) => (
                <motion.div
                  key={post._id}
                  variants={fadeInUp}
                  className="w-full"
                >
                  <BlogCard
                    post={post}
                    onDelete={() => confirmDelete(post._id)}
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

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this blog?
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={deleteBlog}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
