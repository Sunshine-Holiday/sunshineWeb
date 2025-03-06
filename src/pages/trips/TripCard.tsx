import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scaleOnHover } from "@/utils/animations";
import { format, parse, isSameDay, isAfter } from "date-fns"; // Add isSameDay import
import { IMAGE_URL } from "@/store/store";

interface TripCardProps {
  trip: {
    _id: string;
    title: string;
    image: string;
    location: string;
    duration: string;
    busSize: string;
    startDates: string[];
    price: number;
    banner: string;
  };
}

// Function to validate and parse a date string
const isValidStartDate = (startDate: string): Date | null => {
  const parsedDate = parse(startDate, "dd-MM-yyyy", new Date());
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// Format a Date object to "dd-MM-yyyy"
const formatDateToString = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return format(date, "dd-MM-yyyy");
};

export const TripCard = ({ trip }: TripCardProps) => {
  const navigate = useNavigate();
  const today = new Date(); // Dynamically get today's date
  const bannerURL = IMAGE_URL + trip.banner;
  // Convert all start dates to Date objects and filter valid ones
  const validStartDates = trip.startDates
    .map(isValidStartDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime()); // Sort dates chronologically

  // Find if today matches any start date
  const todayMatch = validStartDates.find((date) => isSameDay(date, today));

  // If today matches, use it; otherwise, find the next date after today
  const displayDate =
    todayMatch ||
    validStartDates.find((date) => isAfter(date, today)) ||
    validStartDates[0];

  // If no valid dates exist, return null
  if (!displayDate) return null;

  const handleClick = () => {
    navigate(`/trips/${trip._id}`, { state: { trip } });
  };

  return (
    <motion.div
      variants={scaleOnHover}
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
    >
      <motion.div
        className="relative h-48 overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={
            bannerURL ||
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
            <span>{formatDateToString(displayDate)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-600">
            ₹{trip.price.toLocaleString("en-IN")}
          </span>
          <motion.button
            {...scaleOnHover}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/${trip._id}`, { state: { tripId: trip._id } });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
