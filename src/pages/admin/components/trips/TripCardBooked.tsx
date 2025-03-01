import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scaleOnHover } from "@/utils/animations";

interface TripCardProps {
  trip: {
    _id: number;
    title: string;
    image: string;
    location: string;
    duration: string;
    busSize: string;
    startDates: string[];
    price: number;
  };
}

const isValidStartDate = (startDate: string) => {
  const tripDate = new Date(startDate);
  return tripDate;
};

const formatDate = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options);
};

export const TripCard = ({ trip }: TripCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    console.log(trip._id);
    // navigate(`/admin/booked-data/${trip._id}`, { state: { trip } });
  };

  const handleViewBooked = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/booked-data/${trip._id}`, { state: { trip } });
  };

  return (
    <motion.div
      variants={scaleOnHover}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
    >
      <motion.div
        className="relative h-40 sm:h-44 md:h-48 overflow-hidden"
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
                {trip.startDates && trip.startDates.length > 0
                  ? formatDate(
                      trip.startDates.find(isValidStartDate) ||
                        trip.startDates[0]
                    )
                  : "No dates available"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <span className="text-xl sm:text-2xl font-bold text-blue-600">
            ₹{trip.price.toLocaleString("en-IN")}
          </span>
          <motion.button
            {...scaleOnHover}
            onClick={handleViewBooked}
            className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base w-full sm:w-auto text-center"
          >
            View Booked
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
