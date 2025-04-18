import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import logo1 from "../../asserts/MRNJ1288.MP4"; // Video logo import
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { TripFilters } from "../trips/TripFilters";
import { useNavigate } from "react-router-dom";
import { useGettripsQuery } from "@/store/api/trips";
import { TripCard } from "./TripCard";
import { Plane } from "lucide-react";

const TripsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trips, setTrips] = useState([]);
  const { data, isLoading, error } = useGettripsQuery({});

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
          <div className="flex flex-col items-center justify-center mt-8 text-gray-600">
            <video
              src={logo1}
              className="w-64 mx-auto mb-6 rounded-lg shadow-lg"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="text-2xl font-bold mt-4">Upcoming trips soon.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;
