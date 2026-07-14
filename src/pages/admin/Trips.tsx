import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { TripFilters } from "../trips/TripFilters";
import { useNavigate } from "react-router-dom";
import {
  useDeleteTripsMutation,
  useGettripsQuery,
  useUpdateTripDisplayIndexMutation,
} from "@/store/api/trips";
import { TripCard } from "./components/trips/TripsCard";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

const TripsPage = () => {
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useGettripsQuery({});
  const [deleteTrips] = useDeleteTripsMutation();
  const [updateDisplayIndex, { isLoading: isUpdatingIndex }] =
    useUpdateTripDisplayIndexMutation();
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<any>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  /* ================= SORTED + FILTERED TRIPS ================= */

  const sortedTrips = useMemo(() => {
    const list = Array.isArray(data) ? [...data] : [];
    return list.sort((a: any, b: any) => {
      const ai = Number(a?.displayIndex) || 999999;
      const bi = Number(b?.displayIndex) || 999999;
      if (ai !== bi) return ai - bi;
      return String(a?._id || "").localeCompare(String(b?._id || ""));
    });
  }, [data]);

  const filteredTrips = useMemo(() => {
    return sortedTrips.filter((trip: any) => {
      const matchesCategory =
        selectedCategory === "All" || trip.category === selectedCategory;

      const matchesSearch =
        trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [sortedTrips, selectedCategory, searchQuery]);

  /* ================= HANDLERS ================= */

  const filterTrips = (category: string) => {
    setSelectedCategory(category);
  };

  const toggleAddMenu = () => {
    setIsAddMenuOpen((prev) => !prev);
  };

  const handleAddTrip = (path: string) => {
    setIsAddMenuOpen(false);
    navigate(path);
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
    } catch (err) {
      toast.error("Failed to delete trip");
      console.error(err);
    } finally {
      cancelDelete();
    }
  };

  const onEdit = (trip: any) => {
    navigate(
      trip.readonly
        ? `/admin/trips/edit-readonly`
        : `/admin/trips/edit`,
      { state: { id: trip._id } }
    );
  };

  const handleDisplayIndexChange = async (
    tripId: string | number,
    displayIndex: number
  ) => {
    setUpdatingTripId(String(tripId));
    try {
      await updateDisplayIndex({
        id: String(tripId),
        displayIndex,
      }).unwrap();
      toast.success(
        `Preference set to #${displayIndex}. Other trips reordered.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message || "Failed to update trip preference"
      );
    } finally {
      setUpdatingTripId(null);
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
            Manage Trips
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Set display preference (#1 shows first). Changing one trip
            automatically reorders the rest.
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
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
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
                <TripCard
                  trip={trip}
                  totalTrips={sortedTrips.length}
                  updatingIndex={
                    isUpdatingIndex && updatingTripId === String(trip._id)
                  }
                  onDelete={() => confirmDelete(trip)}
                  onEdit={() => onEdit(trip)}
                  onDisplayIndexChange={handleDisplayIndexChange}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center mt-12 text-gray-600 font-medium">
            No trips found.
          </div>
        )}
      </div>

      {/* FLOATING ADD BUTTON */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={toggleAddMenu}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
        >
          <FaPlus />
        </button>

        {isAddMenuOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg w-56 z-50">
            <button
              onClick={() => handleAddTrip("/admin/trips/add-trips")}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Create Trip
            </button>
            <button
              onClick={() => handleAddTrip("/admin/trips/add-readonlytrips")}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Create Read-Only Trip
            </button>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
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
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
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
