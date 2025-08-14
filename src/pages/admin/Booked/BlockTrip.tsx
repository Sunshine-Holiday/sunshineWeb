import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SeatLayout } from "./components/SeatLayout";
import { BookingSummary } from "./components/BookingSummary";
import { fadeInUp } from "@/utils/animations";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGettripsIDQuery,
  useSelectedDateBookingQuery,
} from "@/store/api/trips";
import { toast } from "react-toastify";
import { useCreatebookingMutation } from "@/store/api/booking";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { FaSpinner } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";
import { MapPin } from "lucide-react";

interface StartDate {
  date: string;
  seats: number | "block";
}

interface Trip {
  _id: string;
  location: string;
  category: string;
  startDates: StartDate[];
  duration: string;
  busSize: string;
  amenities: string[];
  price: string;
  boardingPoints: Array<{
    location: string;
    time: string;
    details: string;
    maplink: string;
  }>;
}

interface TripDetails {
  from: string;
  to: string;
  date: string[];
  time: string;
  busType: string;
  amenities: string[];
  price: number;
  boardingPoints: Array<{
    location: string;
    time: string;
    details: string;
    maplink: string;
  }>;
  busSize: string;
}

const BookingPage = () => {
  const { state } = useLocation();
  const userDetails = useSelector(selectCurrentUser);
  const tripId = state?.trip?._id;
  const startDate: StartDate | undefined = state?.startDate;
  const navigate = useNavigate();

  // State variables
  const [selectedDate, setSelectedDate] = useState<string>(
    startDate?.date || ""
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showSeatLayout, setShowSeatLayout] = useState<boolean>(false);

  // Date formatting functions
  const formatDateToString = (dateInput: string | Date): string => {
    try {
      const date =
        typeof dateInput === "string"
          ? parse(dateInput, "dd-MM-yyyy", new Date())
          : dateInput;
      return isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";
    } catch (error) {
      console.warn("Error formatting date:", dateInput, error);
      return "Invalid Date";
    }
  };

  const formatDateForAPI = (dateInput: string | Date): string => {
    try {
      const date =
        typeof dateInput === "string"
          ? parse(dateInput, "dd-MM-yyyy", new Date())
          : dateInput;
      return isValid(date) ? format(date, "dd-MM-yyyy") : "";
    } catch (error) {
      console.warn("Error formatting date for API:", dateInput, error);
      return "";
    }
  };

  // API queries and mutations
  const {
    data: tripData,
    isLoading: tripLoading,
    isError: tripError,
  } = useGettripsIDQuery({ id: tripId }, { skip: !tripId });

  const {
    data: bookingData,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useSelectedDateBookingQuery(
    {
      trip_id: tripId,
      selectedDate: selectedDate ? formatDateForAPI(selectedDate) : "",
    },
    { skip: !tripId || !selectedDate }
  );

  const [createBooking] = useCreatebookingMutation();

  // Get totalSeats from startDate or trip
  const getTotalSeats = (): number | "block" | undefined => {
    if (trip?.startDates) {
      const matchingDate = trip.startDates.find((d) => d.date === selectedDate);
      return matchingDate?.seats;
    }
    return undefined;
  };

  const totalSeats = getTotalSeats();

  console.log("Total Seats:", totalSeats);

  // Effect to update showSeatLayout when totalSeats changes
  useEffect(() => {
    const isValidSeatCount =
      typeof totalSeats === "number" &&
      (totalSeats === 20 || totalSeats === 32);
    setShowSeatLayout(isValidSeatCount);
  }, [totalSeats]);

  // Date checking function
  const checkAndUpdateDate = (startDates: StartDate[]) => {
    const today = format(new Date(), "dd-MM-yyyy");

    // Validate and filter valid dates
    const validDates = (startDates || []).filter((item): item is StartDate => {
      if (!item || typeof item.date !== "string" || !item.date.trim()) {
        console.warn("Invalid or non-string date:", item);
        return false;
      }
      return true;
    });

    // Check if today is in valid dates
    const currentDate = validDates.find(
      (item) => formatDateToString(item.date) === today
    );
    if (currentDate) {
      setSelectedDate(currentDate.date);
      return;
    }

    // Sort valid dates and find the next future date
    const sortedDates = [...validDates].sort((a, b) => {
      const dateA = parse(a.date, "dd-MM-yyyy", new Date());
      const dateB = parse(b.date, "dd-MM-yyyy", new Date());
      return dateA.getTime() - dateB.getTime();
    });

    const nextDate = sortedDates.find((item) => {
      const parsedDate = parse(item.date, "dd-MM-yyyy", new Date());
      return isValid(parsedDate) && parsedDate > new Date();
    });

    if (nextDate) {
      setSelectedDate(nextDate.date);
    }
  };

  // Effects
  useEffect(() => {
    if (bookingError) setBookedSeats([]);
  }, [bookingError]);

  useEffect(() => {
    if (tripData) setTrip(tripData.trip);
  }, [tripData]);

  useEffect(() => {
    if (trip?.startDates && !selectedDate) {
      checkAndUpdateDate(trip.startDates);
    }
  }, [trip?.startDates, selectedDate]);

  useEffect(() => {
    if (bookingData?.selectedSeats) {
      setBookedSeats(bookingData.selectedSeats);
    } else {
      setBookedSeats([]);
    }
  }, [bookingData]);

  // Handlers
  const changeDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSeats([]); // Reset selected seats when date changes
  };

  const handleSeatSelect = (seatId: string) => {
    if (isSubmitting) return;
    if (bookedSeats.includes(seatId)) {
      toast.error("This seat is already booked");
      return;
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId].sort()
    );
  };

  const handleProceed = async () => {
    if (isSubmitting) return;

    if (!tripId || !selectedDate) {
      toast.error("Invalid trip or date selected.");
      return;
    }

    if (showSeatLayout && selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    setIsSubmitting(true);

    const totalAmount =
      (showSeatLayout ? selectedSeats.length : 1) * Number(trip.price);
    const gst = totalAmount * 0.05;
    const finalAmount = totalAmount + gst;

    try {
      const resp = await createBooking({
        tripId,
        selectedSeats: showSeatLayout ? selectedSeats : ["N/A"],
        selectedDate: formatDateToString(selectedDate),
        passengers: [],
        price: finalAmount,
      }).unwrap();

      toast.success("Trip booked successfully");
      navigate("/admin/booked", {
        state: {
          bookingDetails: resp,
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tripId) {
    return (
      <div className="text-center">Invalid trip ID. Please select a trip.</div>
    );
  }

  if (tripLoading || (bookingLoading && selectedDate)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (tripError || !trip) {
    return <div className="text-center">Failed to load trip details.</div>;
  }

  const tripDetails: TripDetails = {
    from: trip.location || "Unknown",
    to: trip.category || "Unknown",
    date: trip.startDates?.map((item: StartDate) => item.date) || [],
    time: trip.duration || "N/A",
    busType: trip.busSize || "Standard",
    amenities: trip.amenities || [],
    price: Number(trip.price) || 1499,
    boardingPoints: trip.boardingPoints || [],
    busSize: trip.busSize || "20",
  };
console.log("Trip Details:", trip);
  return (
    <div className="">
      {isSubmitting && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center space-x-4">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="text-lg">Processing your booking...</span>
          </div>
        </div>
      )}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isSubmitting ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {showSeatLayout ? "Select Your Seats" : "Block Seat Booking"}
          </h1>
          <p className="text-gray-600">
            {showSeatLayout
              ? "Choose your preferred seats for a comfortable journey"
              : "This is a block seat booking. No seat selection is required."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {showSeatLayout ? (
              <SeatLayout
                totalSeats={totalSeats as number} // Safe cast since showSeatLayout ensures number
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={bookedSeats}
                seatPrice={tripDetails.price}
              />
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {totalSeats === "block"
                    ? "This is a Block seat booking. No seat selection is available."
                    : `Seat selection is not available for this trip (${totalSeats} seats).`}
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <BookingSummary
              tripDetails={tripDetails}
              loading={isSubmitting}
              selectedSeats={selectedSeats}
              seatPrice={tripDetails.price}
              setSelectedData={changeDate}
              selectedDate={selectedDate}
              onProceed={handleProceed}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
