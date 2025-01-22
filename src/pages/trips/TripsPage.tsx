import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa"; // Import the plus icon

import { fadeInUp, staggerChildren } from "../../utils/animations";
import { TripFilters } from "../trips/TripFilters";
import { useNavigate } from "react-router-dom";
import { useGettripsQuery } from "@/store/api/trips";
import { TripCard } from "./TripCard";

const TripsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trips, setTrips] = useState([]);
  const { data, isLoading, error } = useGettripsQuery();

  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      console.log(data);
      setTrips(data);
    }
  }, [data]);

  // Handle category filter
  const filterTrips = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setTrips(data); // Use the fetched data instead of `allTrips`
    } else {
      setTrips(data.filter((trip) => trip.category === category));
    }
  };

  // Handle adding a new trip (for logging purposes)
  const handleAddTrip = () => {
    console.log("Add new trip clicked");
    navigate("/admin/trips/add-trips");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 relative">
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

        {isLoading ? (
          <div className="text-center mt-8 text-gray-600">Loading trips...</div>
        ) : error ? (
          <div className="text-center mt-8 text-red-600">Error loading trips.</div>
        ) : trips.length > 0 ? (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {trips.map((trip) => (
              <motion.div key={trip._id} variants={fadeInUp}>
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center mt-8 text-gray-600">
            Upcoming trips coming soon.
          </div>
        )}
      </div>

    </div>
  );
};

export default TripsPage;
