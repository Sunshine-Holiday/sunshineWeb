import React from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parse, isValid } from "date-fns";
import { scaleOnHover } from "@/utils/animations";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";

interface StartDate {
  date: string;
  seats: number | "block";
}

interface TripCardProps {
  trip: {
    _id: number;
    readonly?: boolean; // Added readonly property
    title: string;
    image: string;
    location: string;
    duration: string;
    busSize: string;
    startDates: (StartDate | null | undefined)[];
    price: number;
    banner?: string;
  };
}

// Validate and parse a date string in "dd-MM-yyyy" format
const isValidStartDate = (startDate: unknown): { date: Date; seats: number | "block" } | null => {
  if (!startDate || typeof startDate !== "object" || !("date" in startDate) || !("seats" in startDate)) {
    return null;
  }

  const { date, seats } = startDate as StartDate;
  if (typeof date !== "string" || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return null;
  }

  const parsedDate = parse(date, "dd-MM-yyyy", new Date());
  if (!isValid(parsedDate)) {
    return null;
  }

  if (seats !== "block" && seats !== 20 && seats !== 32) {
    return null;
  }

  return { date: parsedDate, seats };
};

// Format date as "dd-MM-yyyy"
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
  const readonly = trip?.readonly || false;

  // Convert all start dates to objects with Date and seats, filter valid ones
  const validStartDates = trip.startDates
    .map(isValidStartDate)
    .filter((item): item is { date: Date; seats: number | "block" } => item !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find if today matches any start date
  const todayMatch = validStartDates.find(
    (item) => item.date.toDateString() === today.toDateString()
  );

  // If today matches, use it; otherwise, find the next date after today, or use first available date
  const displayDate = todayMatch ||
    validStartDates.find((item) => item.date > today) ||
    validStartDates[0];

  const handleCardClick = () => {
    console.log(trip._id);
    navigate(`/trips/${trip._id}`, {
      state: {
        trip,
        startDate: displayDate ? formatDate(displayDate.date) : null,
      },
    });
  };

  const handleViewBooked = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/booked-data/${trip._id}`, {
      state: {
        trip,
        startDate: displayDate ? formatDate(displayDate.date) : null,
      },
    });
  };

  const handleBlockSeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/block-trip/${trip._id}`, {
      state: {
        trip,
        startDate: displayDate ? formatDate(displayDate.date) : null,
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
            {!readonly && (
              <>
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{displayDate ? displayDate.seats : "N/A"}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm sm:text-base">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    {displayDate ? formatDate(displayDate.date) : "No valid date"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          {!readonly && (
            <span className="text-xl sm:text-2xl font-bold text-blue-600">
              ₹{trip.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            onClick={handleViewBooked}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
          >
            View Booked
          </Button>
          <Button
            variant="destructive"
            onClick={handleBlockSeat}
            className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
          >
            Block Seat
          </Button>
        </div>
      </div>
    </motion.div>
  );
};