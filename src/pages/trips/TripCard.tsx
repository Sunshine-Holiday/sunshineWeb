import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scaleOnHover } from '../../utils/animations';

interface TripCardProps {
  trip: {
    id: number;
    title: string;
    image: string;
    location: string;
    duration: string;
    groupSize: string;
    startDate: string;
    price: number;
  };
}

export const TripCard = ({ trip }: TripCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trips/${trip.id}`, { state: { trip } });
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
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{trip.title}</h3>
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
            <span>{trip.groupSize}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{trip.startDate}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-600">₹{trip.price.toLocaleString('en-IN')}</span>
          <motion.button
            {...scaleOnHover}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/booking', { state: { tripId: trip.id } });
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