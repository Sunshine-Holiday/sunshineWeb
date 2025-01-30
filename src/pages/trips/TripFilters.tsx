import React from 'react';
import { motion } from 'framer-motion';

const categories = ['All', 'One Trips', 'Night Stays', 'National', ];

export const TripFilters = ({ filterTrips, selectedCategory }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {categories.map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => filterTrips(category)}
          className={`px-6 py-2 rounded-full shadow-sm hover:shadow-md text-gray-700 transition-colors ${
            selectedCategory === category ? 'bg-black text-white ' : 'hover:text-blue-600'
          } ${selectedCategory === category ? 'bg-black  text-white ' : ''}`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};
