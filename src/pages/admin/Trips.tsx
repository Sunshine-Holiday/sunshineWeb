import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { TripFilters } from "../trips/TripFilters";
import { useNavigate } from "react-router-dom";
import { useDeleteTripsMutation, useGettripsQuery } from "@/store/api/trips";
import { TripCard } from "./components/trips/TripsCard";
import { toast } from "react-toastify";

const TripsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trips, setTrips] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const { data, isLoading, error } = useGettripsQuery({});
  const [deleteTrips] = useDeleteTripsMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      setTrips(data);
      console.log(data);
    }
  }, [data]);

  const filterTrips = (category) => {
    setSelectedCategory(category);
    setTrips(
      category === "All"
        ? data
        : data.filter((trip) => trip.category === category)
    );
  };

  const handleAddTrip = (path) => {
    setIsAddMenuOpen(false);
    navigate(path);
  };

  const toggleAddMenu = () => {
    setIsAddMenuOpen(!isAddMenuOpen);
  };

  const confirmDelete = (trip) => {
    setTripToDelete(trip);
    setIsModalOpen(true);
  };

  const onEdit = (trip) => {
    console.log(trip._id);
    if (trip.readonly) {
      navigate(`/admin/trips/edit-readonly`, { state: { id: trip._id } });
    } else {
      navigate(`/admin/trips/edit`, { state: { id: trip._id } });
    }
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
      setIsModalOpen(false);
      setTripToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTripToDelete(null);
    setIsModalOpen(false);
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
          <div className="text-center mt-8 text-red-600">
            Error loading trips.
          </div>
        ) : (
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {trips.map((trip) => (
              <motion.div key={trip._id} variants={fadeInUp}>
                <TripCard
                  trip={trip}
                  onDelete={() => confirmDelete(trip)}
                  onEdit={() => onEdit(trip)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Floating Action Button with Dropdown */}
      <div className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8">
        <button
          onClick={toggleAddMenu}
          className="bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Add New Trip"
        >
          <FaPlus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        {isAddMenuOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg w-48 z-50">
            <button
              onClick={() => handleAddTrip("/admin/trips/add-trips")}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Create Trip
            </button>
            <button
              onClick={() => handleAddTrip("/admin/trips/add-readonlytrips")}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Create Read-Only Trip
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the trip{" "}
              <span className="font-semibold">{tripToDelete?.name}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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

export default TripsPage;