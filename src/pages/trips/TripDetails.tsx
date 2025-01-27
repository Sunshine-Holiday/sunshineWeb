import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Bus,
  Wifi,
  Coffee,
  Snowflake,
  Power,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { useGettripsIDQuery } from "@/store/api/trips";

interface Amenity {
  icon: React.ElementType;
  name: string;
}

// Define available amenities with their icons
const amenitiesList: Amenity[] = [
  { icon: Wifi, name: "Free WiFi" },
  { icon: Coffee, name: "Refreshments" },
  { icon: Snowflake, name: "AC" },
  { icon: Power, name: "Charging Points" },
];

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrips] = useState<any>({});
  // const { _id } = location.state?.trip;
  const { id } = useParams();
  const { data, isLoading, isError } = useGettripsIDQuery({ id: id });

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    if (data) {
      setTrips(data);
    }
  }, [data]);

  const handleBookNow = () => {
    navigate("/booking", { state: { tripId: trip._id } });
  };

  // Find the icon for a specific amenity
  const getAmenityIcon = (amenityName: string) => {
    const amenity = amenitiesList.find(
      (item) => item.name.toLowerCase() === amenityName.toLowerCase()
    );
    return amenity ? amenity.icon : HelpCircle; // Fallback to HelpCircle icon
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Skeleton Left Column */}
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </motion.div>

            {/* Skeleton Right Column */}
            <motion.div variants={fadeInUp} className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 mt-4"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!trip || !trip.price || isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-4xl font-bold text-gray-600">Trip not found</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Info */}
          <motion.div variants={fadeInUp} className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 relative">
                <img
                  src={
                    trip?.image ||
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
                  }
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full">
                  ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {trip.title}
                </h1>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <div>
                      {trip.startDates.map((item, index) => (
                        <p key={index}>{formatDate(item)}</p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{trip.busSize} seats</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Bus Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Bus className="h-5 w-5 mr-2" />
                      <span>AC Sleeper</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span>2x2 Configuration</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trip.amenities.map((amenity: string) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={amenity}
                          className="flex items-center text-gray-600"
                        >
                          <Icon className="h-5 w-5 mr-2" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Boarding Points
                  </h2>
                  <div className="space-y-4">
                    {trip.boardingPoints?.map((point: any) => (
                      <div key={point._id} className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{point.location}</h3>
                          <p className="text-sm text-gray-600">
                            {point.time} - {point.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Booking Card */}
          <motion.div variants={fadeInUp} className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Price Details
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span>
                    ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>
                    ₹
                    {trip.price
                      ? (trip.price * 0.18).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div> */}
                <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span>
                    ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Book Now
              </motion.button>

              <div className="mt-6 text-sm text-gray-500">
                <p className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Free cancellation up to 24 hours before departure
                </p>
                <p className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Instant confirmation
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripDetails;
