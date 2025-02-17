import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Wifi,
  Coffee,
  Snowflake,
  Power,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { useGettripsIDQuery } from "@/store/api/trips";

interface Amenity {
  icon: React.ElementType;
  name: string;
}

const amenitiesList: Amenity[] = [
  { icon: Wifi, name: "Free WiFi" },
  { icon: Coffee, name: "Refreshments" },
  { icon: Snowflake, name: "AC" },
  { icon: Power, name: "Charging Points" },
];

const TripDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrips] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const { data, isLoading, isError } = useGettripsIDQuery({ id: id });

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const isDateValid = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    return checkDate >= today;
  };

  const getAvailableDates = () => {
    if (!trip.startDates) return [];
    return trip.startDates.filter((date: string) => isDateValid(date));
  };

  useEffect(() => {
    if (data) {
      setTrips(data);
      const availableDates = data.startDates?.filter((date: string) => isDateValid(date));
      if (availableDates?.length > 0) {
        setSelectedDate(availableDates[0]);
      }
    }
  }, [data]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      alert("Please select a valid travel date");
      return;
    }
    navigate("/booking", { state: { tripId: trip._id, selectedDate } });
  };

  const getAmenityIcon = (amenityName: string) => {
    const amenity = amenitiesList.find(
      (item) => item.name.toLowerCase() === amenityName.toLowerCase()
    );
    return amenity ? amenity.icon : HelpCircle;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
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

  const availableDates = getAvailableDates();

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
                  src={trip?.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"}
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

                  <div className="flex items-start text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <div className="w-full">
                      <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Travel Date
                      </label>
                      <select
                        id="dateSelect"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Choose a date</option>
                        {trip.startDates.map((date: string, index: number) => (
                          <option 
                            key={index} 
                            value={date}
                            disabled={!isDateValid(date)}
                          >
                            {formatDate(date)} {!isDateValid(date) ? '(Past date)' : ''}
                          </option>
                        ))}
                      </select>
                      {availableDates.length === 0 && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          No future dates available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{trip.busSize} seats</span>
                  </div>
                </div>

                {trip.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-600">{trip.description}</p>
                  </div>
                )}

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
                  <h2 className="text-xl font-semibold mb-4">Boarding Points</h2>
                  <div className="space-y-4">
                    {trip.boardingPoints?.map((point: any) => (
                      <a
                        href={point.maplink}
                        key={point._id}
                        className="flex items-start cursor-pointer"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg mr-4">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{point.location}</h3>
                          <p className="text-sm text-gray-600">
                            {point.time} - {point.details}
                          </p>
                        </div>
                      </a>
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

              {selectedDate && (
                <div className="mb-4">
                  <p className="text-gray-600">Selected Date:</p>
                  <p className="font-medium">{formatDate(selectedDate)}</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span>
                    ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>
          
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
                disabled={!selectedDate || availableDates.length === 0}
                className={`w-full py-3 rounded-lg font-medium ${
                  !selectedDate || availableDates.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {availableDates.length === 0 ? 'No Available Dates' : 'Book Now'}
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