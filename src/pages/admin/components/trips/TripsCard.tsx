import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scaleOnHover } from "@/utils/animations";
import { IMAGE_URL } from "@/store/store";

interface TripCardProps {
  trip: {
    _id: number;
    title: string;
    image: string;
    location: string;
    duration: string;
    busSize: string;
    startDates: string[]; // e.g., ["04-03-2025", "06-03-2025", ...]
    price: number;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

// Validate and parse a date string in "dd-mm-yyyy" format
const isValidStartDate = (startDate: string): Date | null => {
  const [day, month, year] = startDate.split("-").map(Number);
  const tripDate = new Date(year, month - 1, day); // month - 1 because months are 0-based
  return isNaN(tripDate.getTime()) ? null : tripDate;
};

// Format date as "dd-mm-yyyy"
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const TripCard = ({ trip, onDelete, onEdit }: TripCardProps) => {
  const navigate = useNavigate();
  const today = new Date(); // Dynamically get today's date
  const bannerURL = IMAGE_URL + trip.banner;
  // Convert all start dates to Date objects and filter valid ones
  const validStartDates = trip.startDates
    .map(isValidStartDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime()); // Sort dates chronologically

  // Find if today matches any start date
  const todayMatch = validStartDates.find((date) => date.toDateString() === today.toDateString());

  // If today matches, use it; otherwise, find the next date after today
  const displayDate = todayMatch || 
    validStartDates.find((date) => date > today) || 
    validStartDates[0];

  // If no valid dates exist, return null
  if (!displayDate) return null;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(trip._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(trip._id);
  };

  const handleCardClick = () => {
    navigate(`/trips/${trip._id}`, { state: { trip } });
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
            bannerURL||
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
            <Users className="h-4 w-4 mr-2" />
            <span>{trip.busSize}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(displayDate)}</span>
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