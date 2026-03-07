import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import logo1 from "../../asserts/logo_sunshine.gif";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { TripFilters } from "../trips/TripFilters";
import { useGettripsQuery } from "@/store/api/trips";
import { TripCard } from "./TripCard";
import { Plane, Search } from "lucide-react";

const TripsPage = () => {
  const { data, isLoading, error } = useGettripsQuery({});
 const [selectedCategory, setSelectedCategory] = useState("One Day Tours");
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= FILTERED TRIPS ================= */

  const filteredTrips = useMemo(() => {
    if (!data) return [];

    return data.filter((trip: any) => {
      const matchesCategory =
        selectedCategory === "All" || trip.category === selectedCategory;

      const matchesSearch =
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategory, searchQuery]);

  /* ================= HANDLERS ================= */

  const filterTrips = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-semibold text-gray-800 mb-4">
            Discover Our Trips
          </h1>
          <p className="text-base font-medium text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated selection of adventures
          </p>
        </motion.div>

        {/* ================= SEARCH BAR ================= */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by destination or trip name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
            />
          </div>
        </div>

        {/* ================= CATEGORY FILTER ================= */}
        <TripFilters
          filterTrips={filterTrips}
          selectedCategory={selectedCategory}
        />

        {/* ================= CONTENT ================= */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center mt-8 text-red-500 font-medium">
            Error loading trips.
          </div>
        ) : filteredTrips.length > 0 ? (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-8"
          >
            {filteredTrips.map((trip: any) => (
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
              No trips found.
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Try changing filters or search keywords.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        h1,
        p,
        div,
        input {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TripsPage;
