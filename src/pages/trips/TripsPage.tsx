import React from 'react';
import { motion } from 'framer-motion';
import { TripCard } from './TripCard';
import { TripFilters } from './TripFilters';
import { fadeInUp, staggerChildren } from '../../utils/animations';

const trips = [
  {
    id: 1,
    title: 'Mountain Trek Adventure',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    location: 'Swiss Alps',
    duration: '5 Days',
    groupSize: '10-15 people',
    startDate: 'March 15, 2024',
    price: 1299,
  },
  // Add more trips...
];

 const TripsPage = () => {
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
            Discover Our Trips
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated selection of adventures
          </p>
        </motion.div>

        <TripFilters />

        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {trips.map((trip) => (
            <motion.div key={trip.id} variants={fadeInUp}>
              <TripCard trip={trip} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TripsPage