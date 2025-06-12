
import React from 'react';
import { motion } from 'framer-motion';

const categories = ['All', 'One Day Tours', 'Stay Package', 'Domestic Tours'];

export const TripFilters = ({ filterTrips, selectedCategory }: { filterTrips: (category: string) => void; selectedCategory: string }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-10">
      {categories.map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => filterTrips(category)}
          className={`px-6 py-3 rounded-lg shadow-sm transition-all duration-200 font-medium text-base ${
            selectedCategory === category
              ? 'bg-orange-100 text-orange-500 border-orange-200 font-semibold'
              : 'text-gray-600 border-gray-200 hover:text-orange-500 hover:bg-orange-50 hover:shadow-md'
          } border`}
        >
          {category}
        </motion.button>
      ))}
      <style jsx>{`
        button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TripFilters;
