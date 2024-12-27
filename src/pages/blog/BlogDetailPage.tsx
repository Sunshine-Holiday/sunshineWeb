import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { posts } from '../../constants/trip'; // Assuming you have posts in a constants file
import { fadeInUp } from '../../utils/animations';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null); // State for the blog post
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Simulate fetching the data
    const fetchData = async () => {
      setLoading(true);
      // Mock fetching the blog post
      setTimeout(() => {
        const fetchedPost = posts.find(post => post.id === parseInt(id)); // Find the post by ID
        setPost(fetchedPost);
        setLoading(false);
      }, 2000);
    };
    
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton height={300} width="100%" />
            <div className="space-y-4">
              <Skeleton height={50} width="80%" />
              <Skeleton count={5} />
            </div>
          </div>
        ) : (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-white rounded-xl h-screen shadow-lg overflow-hidden"
          >
            {/* Image Section */}
            <div className="relative h-72 overflow-hidden rounded-t-xl">
              <img
                src={post.image || 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b'}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop if the default image also fails
                  e.target.src = 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b'; // Default image if original fails
                }}
              />
              {/* <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                {post.category}
              </span> */}
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
                By <span className="font-semibold">{post.author}</span> | {post.date}
              </p>

              {/* Description Section */}
              <motion.p
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="text-lg text-gray-700 mb-6"
              >
                {post.description}
              </motion.p>

              {/* Main Content Section */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="text-gray-700 leading-relaxed"
              >
                <p>{post.excerpt}</p>
                {/* Additional content can go here, such as paragraphs or other components */}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
