import React from 'react';
import { motion } from 'framer-motion';

const categories = ['All', 'Day Trips', 'Night Stays', 'National', 'International'];

export const TripFilters = () => {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {categories.map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 rounded-full bg-white shadow-sm hover:shadow-md text-gray-700 hover:text-blue-600 transition-colors"
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};