import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useDeleteTripsMutation,
  useGettripsQuery,
} from "@/store/api/trips";
import { toast } from "react-toastify";
import { fadeInUp, staggerChildren } from "@/utils/animations";
import { TripCard } from "../components/trips/TripCardBooked";
import { TripFilters } from "@/pages/trips/TripFilters";
import { Search } from "lucide-react";

const BookedPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useGettripsQuery({});
  const [deleteTrips] = useDeleteTripsMutation();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<any>(null);

  /* ================= FILTERED TRIPS ================= */

  const filteredTrips = useMemo(() => {
    return data.filter((trip: any) => {
      const matchesCategory =
        selectedCategory === "All" || trip.category === selectedCategory;

      const matchesSearch =
        trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategory, searchQuery]);

  /* ================= HANDLERS ================= */

  const filterTrips = (category: string) => {
    setSelectedCategory(category);
  };

  const confirmDelete = (trip: any) => {
    setTripToDelete(trip);
    setIsModalOpen(true);
  };

  const cancelDelete = () => {
    setTripToDelete(null);
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!tripToDelete) return;

    try {
      await deleteTrips(tripToDelete._id).unwrap();
      toast.success("Trip deleted successfully");
    } catch (error) {
      toast.error("Failed to delete trip");
      console.error("Error deleting trip:", error);
    } finally {
      cancelDelete();
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Our Trips
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated selection of adventures
          </p>
        </motion.div>

        {/* SEARCH BAR */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by trip name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <TripFilters
          filterTrips={filterTrips}
          selectedCategory={selectedCategory}
        />

        {/* CONTENT */}
        {isLoading ? (
          <div className="text-center mt-8 text-gray-600">
            Loading trips...
          </div>
        ) : error ? (
          <div className="text-center mt-8 text-red-600">
            Error loading trips.
          </div>
        ) : filteredTrips.length > 0 ? (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
          >
            {filteredTrips.map((trip: any) => (
              <motion.div key={trip._id} variants={fadeInUp}>
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center mt-12 text-gray-600 font-medium">
            No trips found.
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {tripToDelete?.title}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookedPage;
