import React from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parse, isValid, format } from "date-fns";
import { scaleOnHover } from "@/utils/animations";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";

interface StartDate {
  date: string;
  _id?: string;
  seats?: number | "block";
}

interface TripCardProps {
  trip: {
    _id: string;
    title: string;
    location: string;
    duration: string;
    busSize: string;
    startDates: (StartDate | null | undefined)[];
    price: number;
    banner: string;
  };
}

// Validate and parse a date string in "dd-MM-yyyy" format
const isValidStartDate = (startDate: unknown): { date: Date; seats: number | "block" | "N/A" } | null => {
  if (!startDate || typeof startDate !== "object" || !("date" in startDate)) {
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

  // If seats is undefined, default to "N/A"; otherwise, allow any positive number or "block"
  if (seats === undefined) {
    return { date: parsedDate, seats: "N/A" };
  }

  if (seats !== "block" && (typeof seats !== "number" || seats < 0)) {
    return null;
  }

  return { date: parsedDate, seats };
};

// Format a Date object to "dd-MM-yyyy"
const formatDateWithSeats = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "N/A";
  }
  return format(date, "dd-MM-yyyy");
};

export const TripCard = ({ trip }: TripCardProps) => {
  const navigate = useNavigate();
  const bannerURL = IMAGE_URL + trip.banner;

  // Debug: Log startDates to identify issues
  console.log(`Trip ${trip.title} startDates:`, trip.startDates);

  // Convert all start dates to objects with Date and seats, filter valid ones
  const validStartDates = trip.startDates
    .map(isValidStartDate)
    .filter((item): item is { date: Date; seats: number | "block" | "N/A" } => item !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Select the first valid start date that is today or in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
  const displayDate = validStartDates.find(
    (item) => item.date >= today
  );

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
            <span>{displayDate ? displayDate.seats : "N/A"}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{displayDate ? formatDateWithSeats(displayDate.date) : "N/A"}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-600">
            ₹{trip.price.toLocaleString("en-IN")}
          </span>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/trips/${trip._id}`, { state: { tripId: trip._id } });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};