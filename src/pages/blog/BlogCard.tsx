import React from "react";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import { scaleOnHover } from "../../utils/animations";

interface BlogCardProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    date: string;
    author: string;
    category: string;
  };
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <motion.article
      variants={scaleOnHover}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
    >
      {/* Image Section */}
      <motion.div
        className="relative w-full h-56 overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={
            post.image ||
            "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"
          }
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if the default image fails
            e.target.src =
              "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"; // Default image URL
          }}
        />
        <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          Read More
        </span>
      </motion.div>

      {/* Content Section */}
      <div className="flex flex-col justify-between p-4 flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 text-sm truncate">{post.excerpt}</p>

        {/* Author and Date Section */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {post.date}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
