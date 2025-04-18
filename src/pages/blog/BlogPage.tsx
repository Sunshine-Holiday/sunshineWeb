import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { useGetAllBlogsQuery } from "@/store/api/blogs";
import { BlogCard } from "./BlogCard";
import logo1 from "../../asserts/MRNJ1288.MP4"; // Video logo import

// Skeleton loader component for the blog cards
const SkeletonLoader = () => (
  <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg shadow-md"></div>
);

const BlogPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllBlogsQuery();

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
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <motion.div key={index} variants={fadeInUp} className="w-full">
                  <SkeletonLoader />
                </motion.div>
              ))
          ) : data?.blogs?.length ? (
            data.blogs.map((post) => (
              <motion.div
                key={post._id}
                variants={fadeInUp}
                onClick={() => navigate(`/blog/${post._id}`)}
                className="w-full"
              >
                <BlogCard post={post} />
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={fadeInUp}
              className="col-span-full text-center text-gray-600 text-4xl flex flex-col items-center space-y-4"
            >
              <video
                src={logo1}
                className="w-64 mx-auto mb-6 rounded-lg shadow-lg"
                autoPlay
                loop
                muted
                playsInline
              />
              <p className="text-2xl">Adding Blogs soon. Stay tuned!</p>{" "}
              {/* Larger text */}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;
