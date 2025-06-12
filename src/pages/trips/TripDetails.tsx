
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
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { fadeInUp, staggerChildren } from "../../utils/animations";
import { useGettripsIDQuery } from "@/store/api/trips";
import { format, parse, isValid, startOfDay } from "date-fns";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";
import ReviewCarousel from "@/components/ReviewCarousel";

// Interfaces
interface Amenity {
  icon: React.ElementType;
  name: string;
}

interface StartDate {
  date: string;
  seats: number | "block";
}

interface Review {
  _id: string;
  description: string;
  travelDate: string;
  bookingDate: string;
  isAdminApproved: boolean;
  isAdminDisApproved: boolean;
}

const amenitiesList: Amenity[] = [
  { icon: Wifi, name: "Free WiFi" },
  { icon: Coffee, name: "Refreshments" },
  { icon: Snowflake, name: "AC" },
  { icon: Power, name: "Charging Points" },
];

// Function to format StartDate to "dd-MM-yyyy (seats)"
const formatDateWithSeats = (startDate: StartDate): string => {
  const parsedDate = parse(startDate.date, "dd-MM-yyyy", new Date());
  if (!isValid(parsedDate)) {
    console.error("Invalid date:", startDate.date);
    return "Invalid Date";
  }
  const formattedDate = format(parsedDate, "dd-MM-yyyy");
  return `${formattedDate} (${
    startDate.seats === "block" ? "Block" : `${startDate.seats} Seats`
  })`;
};

// Function to format review date
const formatReviewDate = (dateString: string): string => {
  const parsedDate = new Date(dateString);
  return isValid(parsedDate)
    ? format(parsedDate, "dd MMM yyyy")
    : "Invalid Date";
};

const TripDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrips] = useState<any>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState<StartDate | null>(null);
  const { data, isLoading, isError } = useGettripsIDQuery({ id: id });
  const bannerURL = trip.banner ? IMAGE_URL + trip.banner : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";

  // Check if a StartDate is valid and in the future
  const isDateValid = (startDate: StartDate): boolean => {
    if (!startDate || typeof startDate !== "object" || !("date" in startDate)) {
      return false;
    }
    const today = startOfDay(new Date());
    const parsedDate = parse(startDate.date, "dd-MM-yyyy", new Date());
    return isValid(parsedDate) && parsedDate >= today;
  };

  const getAvailableDates = (): StartDate[] => {
    if (!trip.startDates) return [];
    return trip.startDates.filter((date: StartDate) => isDateValid(date));
  };

  useEffect(() => {
    if (data) {
      setTrips(data.trip);
      setReviews(data.reviews || []);
      const availableDates =
        data.trip.startDates?.filter((date: StartDate) => isDateValid(date)) ||
        [];
      if (availableDates.length > 0) {
        setSelectedDate(availableDates[0]);
      }
    }
  }, [data]);

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = trip.startDates.find(
      (date: StartDate) => formatDateWithSeats(date) === event.target.value
    );
    setSelectedDate(selected || null);
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

  // Slick carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-3xl font-semibold text-gray-800">Trip not found</div>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const approvedReviews = reviews.filter(
    (review: Review) => review.isAdminApproved && !review.isAdminDisApproved
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-Column Grid for Main Info and Booking Card */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          {/* Left Column - Main Info (2/3 width) */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 order-1">
            <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="h-64 relative">
                <img
                  src={bannerURL}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200">
                  ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-4xl font-semibold text-gray-800 mb-4">
                  {trip.title}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500 hover:text-orange-500 transition-colors duration-200" />
                    <span>{trip.location}</span>
                  </div>

                  <div className="flex items-start text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500 hover:text-orange-500 transition-colors duration-200" />
                    <div className="w-full">
                      <label
                        htmlFor="dateSelect"
                        className="block text-base font-semibold text-gray-800 mb-2"
                      >
                        Select Travel Date
                      </label>
                      <select
                        id="dateSelect"
                        value={
                          selectedDate
                            ? formatDateWithSeats(selectedDate)
                            : ""
                        }
                        onChange={handleDateChange}
                        className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-200 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg font-medium text-gray-800"
                      >
                        <option value="">Choose a date</option>
                        {trip.startDates.map(
                          (date: StartDate, index: number) => (
                            <option
                              key={index}
                              value={formatDateWithSeats(date)}
                              disabled={!isDateValid(date)}
                            >
                              {formatDateWithSeats(date)}{" "}
                              {!isDateValid(date) ? "(Past date)" : ""}
                            </option>
                          )
                        )}
                      </select>
                      {availableDates.length === 0 && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          No future dates available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {trip.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      Description
                    </h2>
                    <div
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: trip.description }}
                    />
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {trip.amenities.map((amenity: string) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={amenity}
                          className="flex items-center text-gray-600"
                        >
                          <Icon className="h-5 w-5 mr-2 text-gray-500 hover:text-orange-500 transition-colors duration-200" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Boarding Points
                  </h2>
                  <div className="space-y-4">
                    {trip.boardingPoints?.map((point: any) => (
                      <a
                        href={point.maplink}
                        key={point._id}
                        className="flex items-start cursor-pointer group"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="bg-orange-100 p-2 rounded-lg mr-4 group-hover:bg-orange-200 transition-colors duration-200">
                          <MapPin className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 group-hover:text-orange-500 transition-colors duration-200">
                            {point.location}
                          </h3>
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

          {/* Right Column - Booking Card (1/3 width) */}
          <motion.div variants={fadeInUp} className="lg:col-span-1 order-2">
            <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md p-8 sticky top-24 border border-gray-200 hover:shadow-lg transition-all duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Price Details
              </h2>

              {selectedDate && (
                <div className="mb-4">
                  <p className="text-gray-600 font-medium">Selected Date:</p>
                  <p className="font-medium text-gray-800">
                    {formatDateWithSeats(selectedDate)}
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="text-gray-800">
                    ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-500">
                    ₹{trip.price ? trip.price.toLocaleString("en-IN") : "N/A"}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleBookNow}
                disabled={!selectedDate || availableDates.length === 0}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                  !selectedDate || availableDates.length === 0
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {availableDates.length === 0
                  ? "No Available Dates"
                  : "Book Now"}
              </Button>

              <div className="mt-6 text-sm text-gray-600">
                <p className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500 hover:text-orange-500 transition-colors duration-200" />
                  75% refund within 5-7 working days, if notified 8 or more
                  days prior to the event date.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="initial"
          animate="animate"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md p-8 border border-gray-200">
            <ReviewCarousel reviews={approvedReviews} settings={settings} />
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        h1, h2, h3, p, span, button, select {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TripDetails;
