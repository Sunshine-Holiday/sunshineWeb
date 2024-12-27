import React from 'react';
import { motion } from 'framer-motion';
import { BlogCard } from './BlogCard';
import { fadeInUp, staggerChildren } from '../../utils/animations';
import { posts } from '../../constants/trip';
import { Link } from 'react-router-dom';

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
              <Link to={`/blog/${post.id}`}>
                <BlogCard post={post} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;
