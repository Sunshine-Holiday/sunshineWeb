import React from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar } from "lucide-react";
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
    startDates: (string | null | undefined)[];
    price: number;
    banner?: string;
  };
}

// Validate and parse a date string in "dd-mm-yyyy" format
const isValidStartDate = (startDate: string | null | undefined): Date | null => {
  if (typeof startDate !== "string" || !startDate.trim()) {
    console.warn("Invalid startDate:", startDate);
    return null;
  }

  const [day, month, year] = startDate.split("-").map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.warn(`Invalid date format for startDate: ${startDate}`);
    return null;
  }

  const tripDate = new Date(year, month - 1, day);
  return isNaN(tripDate.getTime()) ? null : tripDate;
};

// Format date as "dd-mm-yyyy"
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const TripCard = ({ trip }: TripCardProps) => {
  const navigate = useNavigate();
  const today = new Date();
  const bannerURL = trip.banner ? IMAGE_URL + trip.banner : undefined;

  // Convert all start dates to Date objects and filter valid ones
  const validStartDates = trip.startDates
    .map(isValidStartDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  // Find if today matches any start date
  const todayMatch = validStartDates.find(
    (date) => date.toDateString() === today.toDateString()
  );

  // If today matches, use it; otherwise, find the next date after today, or use first available date
  const displayDate = todayMatch ||
    validStartDates.find((date) => date > today) ||
    validStartDates[0];

  // If no valid dates exist, display a message but still render the card
  const hasValidDate = !!displayDate;

  const handleCardClick = () => {
    console.log(trip._id);
    navigate(`/admin/block-trip/${trip._id}`, {
      state: {
        trip,
        startDate: displayDate ? formatDate(displayDate) : null,
      },
    });
  };

  const handleViewBooked = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/booked-data/${trip._id}`, {
      state: {
        trip,
        startDate: displayDate ? formatDate(displayDate) : null,
      },
    });
  };

  const handleBlockSeat = () => {
    navigate(`/admin/block-trip/${trip._id}`, {
      state: {
        trip,
        startDate: displayDate ? formatDate(displayDate) : null,
      },
    });
  };

  return (
    <motion.div
      variants={scaleOnHover}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
    >
      <motion.div
        className="relative h-40 sm:h-44 md:h-48 overflow-hidden"
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
          loading="lazy"
        />
      </motion.div>
      <div className="p-4 sm:p-5 md:p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
            {trip.title}
          </h3>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{trip.location}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{trip.busSize}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm sm:text-base">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {hasValidDate ? formatDate(displayDate) : "No valid dates available"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <span className="text-xl sm:text-2xl font-bold text-blue-600">
            ₹{trip.price.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <motion.button
            {...scaleOnHover}
            onClick={handleViewBooked}
            className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base w-full sm:w-auto text-center"
          >
            View Booked
          </motion.button>
          <motion.button
            {...scaleOnHover}
            onClick={handleBlockSeat}
            className="bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Block Seat
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};