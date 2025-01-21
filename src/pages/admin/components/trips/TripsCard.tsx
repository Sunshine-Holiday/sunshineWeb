import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scaleOnHover } from "@/utils/animations";

interface TripCardProps {
  trip: {
    id: number;
    title: string;
    image: string;
    location: string;
    duration: string;
    busSize: string; // Fixed typo from Busize to busSize
    startDates: string[]; // Modified to startDates array
    price: number;
  };
  onDelete: (id: number) => void; // Add delete handler
}

const isValidStartDate = (startDate: string) => {
  const today = new Date();
  const tripDate = new Date(startDate);
  return tripDate >= today; // Only show trips with a start date >= today
};

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options); // Format date as "March 15, 2024"
};

export const TripCard = ({ trip, onDelete }: TripCardProps) => {
  const navigate = useNavigate();

  // Check if any of the trip's start dates are valid
  const isValid = trip.startDates.some(isValidStartDate);

  if (!isValid) return null; // If no valid start date, return null

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/edit-trip/${trip_.id}`, { state: { trip } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this trip?")) {
      onDelete(trip.id); // Trigger delete function
    }
  };

  const handleCardClick = () => {
    navigate(`/trips/${trip.id}`, { state: { trip } });
  };

  return (
    <motion.div
      variants={scaleOnHover}
   
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
    >
      <motion.div
        className="relative h-48 overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
      >
        <img
        
          src={
            trip?.image ||
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
          }
          alt={trip.title}
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {trip.title}
        </h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{trip.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{trip.duration}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{trip.busSize}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(trip.startDates.find(isValidStartDate)!)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-600">
            ₹{trip.price.toLocaleString("en-IN")}
          </span>
          <div className="flex gap-2">
            <motion.button
              {...scaleOnHover}
              onClick={handleEdit}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Edit
            </motion.button>
            <motion.button
              {...scaleOnHover}
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
