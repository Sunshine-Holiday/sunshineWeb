import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fadeInUp } from "../../utils/animations";
import { useGetBlogsIDQuery } from "@/store/api/blogs";
import { Blog } from "@/types/blogs";

const BlogDetailPage = () => {
  const state = useParams();
  console.log(state.id);
  const { data, isLoading, isError } = useGetBlogsIDQuery({ id: state.id });
  const [post, setPost] = useState<Blog>({
    author: "",
    createdAt: new Date(),
    description: "",
    image: {
      public_id: "",
      url: "",
    },
    title: "",
    userId: "",
  });
  const parsedDescription = JSON.parse;
  useEffect(() => {
    console.log(data);
    if (data && !isLoading) {
      setPost(data.blog);
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton height={300} width="100%" />
          <div className="space-y-4">
            <Skeleton height={50} width="80%" />
            <Skeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xl text-red-500">
            Failed to load the blog post. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Image Section */}
          <div className="relative h-72 overflow-hidden rounded-t-xl">
            <img
              src={
                post?.image?.url ||
                "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"
              }
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b";
              }}
            />
          </div>

          {/* Blog Content Section */}
          <div className="p-6">
            {/* Title and Author Section */}
            <motion.h1
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              {post.title}
            </motion.h1>
            <p className="text-sm text-gray-500 mb-4">
              By{" "}
              <span className="font-semibold">{post.author || "Unknown"}</span>{" "}
              {formattedDate}
            </p>

            {/* Description Section */}
            <motion.p
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="text-lg text-gray-700 mb-6"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />

            {/* Main Content Section */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="text-gray-700 leading-relaxed"
            ></motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
