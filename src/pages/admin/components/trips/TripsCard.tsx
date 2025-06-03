import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parse, isValid } from "date-fns";
import { scaleOnHover } from "@/utils/animations";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";

interface StartDate {
  date?: string;
  seats?: number | "block";
}

interface TripCardProps {
  trip?: {
    _id?: number;
    title?: string;
    image?: string;
    location?: string;
    duration?: string;
    busSize?: string;
    startDates?: (StartDate | null | undefined)[];
    price?: number;
  };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
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

  // Allow any positive number for seats or "block"
  if (seats !== "block" && (typeof seats !== "number" || seats < 0)) {
    return null;
  }

  return { date: parsedDate, seats };
};

// Format date as "dd-MM-yyyy" with seats
const formatDateWithSeats = (date?: Date): string => {
  if (!date || !isValid(date)) {
    return "N/A";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const TripCard = ({ trip, onDelete, onEdit }: TripCardProps) => {
  console.log("TripCard rendered with trip:", trip);
  const navigate = useNavigate();
  const today = new Date();
  const bannerURL = trip?.image ? `${IMAGE_URL}${trip.image}` : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";

  // Convert all start dates to objects with Date and seats, filter valid ones
  const validStartDates = (trip?.startDates ?? [])
    .map(isValidStartDate)
    .filter((item): item is { date: Date; seats: number | "block" } => item !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find if today matches any start date
  const todayMatch = validStartDates.find(
    (item) => item.date.toDateString() === today.toDateString()
  );

  // If today matches, use it; otherwise, find the next date after today
  const displayDate = todayMatch || validStartDates.find((item) => item.date > today) || validStartDates[0];

  // Handle case with no valid trip data
  if (!trip?._id || !trip?.title) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-red-600">
        No valid trip data available.
      </div>
    );
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(trip._id!);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(trip._id!);
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
          src={bannerURL}
          alt={trip.title ?? "Trip"}
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {trip.title ?? "N/A"}
        </h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{trip.location ?? "N/A"}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{displayDate?.seats ?? "N/A"}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{displayDate ? formatDateWithSeats(displayDate.date) : "N/A"}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-600">
            ₹{trip.price?.toLocaleString("en-IN") ?? "N/A"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleEdit}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};