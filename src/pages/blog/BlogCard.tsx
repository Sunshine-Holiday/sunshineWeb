import React from "react";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import { scaleOnHover } from "../../utils/animations";

interface BlogCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    image: {
      public_id: String;
      url: String;
    };
    createdAt: string; // Change to createdAt to match the field from your data
    author: string;
    category: string;
  };
}

export const BlogCard = ({ post }: BlogCardProps) => {
  // Format the date
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.article
      variants={scaleOnHover}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-200 hover:scale-105"
    >
      {/* Image Section */}
      <motion.div
        className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={
            post.image.url ||
            "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"
          }
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop if the default image fails
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"; // Default image URL
          }}
        />
        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
          Read More
        </span>
      </motion.div>

      {/* Content Section */}
      <div className="flex flex-col justify-between p-3 sm:p-4 flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm truncate">
          {post.excerpt}
        </p>

        {/* Author and Date Section */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formattedDate} {/* Use formatted date here */}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
