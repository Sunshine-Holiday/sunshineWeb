import React, { useState } from "react";
import { motion } from "framer-motion";
import { TripCard } from "./TripCard";
import { TripFilters } from "./TripFilters";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { allTrips } from "../../constants/trip";



const TripsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trips, setTrips] = useState(allTrips);

  // Handle category filter
  const filterTrips = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setTrips(allTrips);
    } else {
      setTrips(allTrips.filter((trip) => trip.category === category));
    }
  };

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

        <TripFilters
          filterTrips={filterTrips}
          selectedCategory={selectedCategory}
        />

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

export default TripsPage;
