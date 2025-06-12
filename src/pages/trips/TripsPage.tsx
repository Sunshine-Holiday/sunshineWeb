
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo1 from "../../asserts/logo_sunshine.gif"; // Video logo import
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
  const filterTrips = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") {
      setTrips(data);
    } else {
      setTrips(data.filter((trip: any) => trip.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-semibold text-gray-800 mb-4">
            Discover Our Trips
          </h1>
          <p className="text-base font-medium text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated selection of adventures
          </p>
        </motion.div>

        <TripFilters
          filterTrips={filterTrips}
          selectedCategory={selectedCategory}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-8 text-red-500 text-base font-medium">
            Error loading trips.
          </div>
        ) : trips.length > 0 ? (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {trips.map((trip: any) => (
              <motion.div key={trip._id} variants={fadeInUp}>
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-12 text-gray-600">
            <img
              src={logo1}
              alt="Sunshine Holiday Packages Logo"
              className="w-48 mx-auto mb-6 rounded-lg border border-orange-200 shadow-md"
            />
            <div className="text-xl font-semibold text-gray-800">
              Upcoming trips soon.
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        h1, p, div {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TripsPage;
