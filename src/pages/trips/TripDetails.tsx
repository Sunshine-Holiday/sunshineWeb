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
  const bannerURL = IMAGE_URL + trip.banner;

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

  // Slick carousel settings - Fixed to display horizontally
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
  const approvedReviews = reviews.filter(
    (review: Review) => review.isAdminApproved && !review.isAdminDisApproved
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-Column Grid for Main Info and Booking Card */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column - Main Info (2/3 width) */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 order-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-64 relative">
                  <img
                    src={
                      bannerURL ||
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{trip.location}</span>
                    </div>

                    <div className="flex items-start text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <div className="w-full">
                        <label
                          htmlFor="dateSelect"
                          className="block text-sm font-medium text-gray-700 mb-1"
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
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                      <h2 className="text-xl font-semibold mb-4">
                        Description
                      </h2>
                      <div
                        className=""
                        dangerouslySetInnerHTML={{ __html: trip.description }}
                      />
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Right Column - Booking Card (1/3 width) */}
            <motion.div variants={fadeInUp} className="lg:col-span-1 order-2">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Price Details
                </h2>

                {selectedDate && (
                  <div className="mb-4">
                    <p className="text-gray-600">Selected Date:</p>
                    <p className="font-medium">
                      {formatDateWithSeats(selectedDate)}
                    </p>
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

                <Button
                  onClick={handleBookNow}
                  disabled={!selectedDate || availableDates.length === 0}
                  className={`w-full ${
                    !selectedDate || availableDates.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {availableDates.length === 0
                    ? "No Available Dates"
                    : "Book Now"}
                </Button>

                <div className="mt-6 text-sm text-gray-500">
                  <p className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    75% refund within 5-7 working days, if notified 8 or more
                    days prior to the event date.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

  
        </div>
      </div>
      <motion.div
            variants={fadeInUp}
            className="mt-12"
            initial="initial"
            animate="animate"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ReviewCarousel reviews={reviews} />
            </div>
          </motion.div>
    </>
  );
};

export default TripDetails;
