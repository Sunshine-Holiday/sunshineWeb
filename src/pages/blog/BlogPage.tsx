import React from 'react';
import { motion } from 'framer-motion';
import { BlogCard } from './BlogCard';
import { fadeInUp, staggerChildren } from '../../utils/animations';

const posts = [
  {
    id: 1,
    title: 'Top 10 Hidden Gems in Southeast Asia',
    excerpt: 'Discover the unexplored wonders of Southeast Asia...',
    image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b',
    date: 'Feb 28, 2024',
    author: 'Sarah Johnson',
    category: 'Travel Tips',
  },
  // Add more posts...
];

 const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Travel Blog
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stories, tips, and insights from our travel experts
          </p>
        </motion.div>

        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={fadeInUp}>
              <BlogCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage