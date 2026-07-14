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
import {
  useCreatebookingMutation,
  useDeleteBookingMutation,
} from "@/store/api/booking";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { FaSpinner } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";
import { MapPin } from "lucide-react";

interface StartDate {
  date: string;
  seats: number | "block";
  numberOfBusesAvailable?: number;
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
  const [deleteblock] = useDeleteBookingMutation();
  // State variables
  const [selectedDate, setSelectedDate] = useState<string>(
    startDate?.date || "",
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showSeatLayout, setShowSeatLayout] = useState<boolean>(false);
  const [blockReason, setBlockReason] = useState("");

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
    { skip: !tripId || !selectedDate },
  );
  console.log("Booking Data:", bookingData);
  const [createBooking] = useCreatebookingMutation();
  const [currentBus, setCurrentBus] = useState(0);

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
  const seatsPerBus = typeof totalSeats === "number" ? totalSeats : 0;

  const numberOfBuses = Math.max(
    1,
    Number(
      trip?.startDates?.find((d) => d.date === selectedDate)
        ?.numberOfBusesAvailable || 1,
    ) || 1,
  );

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
      (item) => formatDateToString(item.date) === today,
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
    if (!bookingData?.selectedSeatsByBus) {
      setBookedSeats([]);
      return;
    }

    const mapped: string[] = [];

    Object.entries(bookingData.selectedSeatsByBus).forEach(
      ([busIndex, seats]: any) => {
        seats.forEach((seat: string) => {
          mapped.push(`${busIndex}-${seat}`);
        });
      },
    );

    setBookedSeats(mapped);
  }, [bookingData]);

  // Auto-open first bus that still has free seats
  useEffect(() => {
    if (!showSeatLayout || !seatsPerBus || numberOfBuses <= 1) return;
    for (let bus = 0; bus < numberOfBuses; bus++) {
      const bookedOnBus = bookedSeats.filter((s) =>
        s.startsWith(`${bus}-`),
      ).length;
      if (bookedOnBus < seatsPerBus) {
        if (currentBus !== bus) setCurrentBus(bus);
        return;
      }
    }
  }, [bookedSeats, seatsPerBus, numberOfBuses, showSeatLayout, selectedDate]);

  // Handlers
  const changeDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSeats([]); // Reset selected seats when date changes
    setCurrentBus(0);
  };

  const handleSeatSelect = (seatKey: string) => {
    if (isSubmitting) return;

    if (bookedSeats.includes(seatKey)) {
      toast.error("This seat is already booked");
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatKey)
        ? prev.filter((s) => s !== seatKey)
        : [...prev, seatKey],
    );
  };

  const handleProceed = async () => {
    if (isSubmitting) return;

    if (!tripId || !selectedDate) {
      toast.error("Invalid trip or date selected.");
      return;
    }

    // ✅ For seat-layout trips, must pick seats
    if (showSeatLayout && selectedSeats.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    const reason = blockReason.trim();
    if (reason.length < 3) {
      toast.error("Please add a reason for blocking the seat(s).");
      return;
    }

    setIsSubmitting(true);

    // ✅ seats payload for backend (MULTI BUS supported)
    const formattedSeats = showSeatLayout
      ? selectedSeats.map((s) => {
          const [busIndex, seat] = s.split("-");
          return { seat, busIndex: Number(busIndex) };
        })
      : [{ seat: "N/A", busIndex: 0 }]; // block booking

    // ✅ Backend REQUIRES passengers[] with valid fields — even for admin blocking
    const adminName =
      userDetails?.name ||
      userDetails?.fullName ||
      userDetails?.username ||
      "Admin";
    const adminEmail = userDetails?.email || "admin@blocked.local";
    const adminPhone =
      userDetails?.phoneNumber ||
      userDetails?.phone ||
      userDetails?.mobile ||
      "9999999999";

    // ✅ must be valid as per backend validation rules
    const dummyPassengers = [
      {
        name: `${adminName} (Block)`,
        age: 25, // required
        gender: "male", // must be: "male" | "female" | "other"
        idProof: "aadhar", // must be: "aadhar" | "pan"
        idProofNumber: "000000000000", // required (string)
        phoneNumber: String(adminPhone),
        email: String(adminEmail),
      },
    ];

    // ✅ amount calculation (keep your logic)
    const totalAmount =
      (showSeatLayout ? selectedSeats.length : 1) * Number(trip.price);
    const gst = totalAmount * 0.05;
    const finalAmount = totalAmount + gst;

    try {
      const resp = await createBooking({
        tripId,
        selectedSeats: formattedSeats,
        selectedDate: formatDateToString(selectedDate), // DD-MM-YYYY
        passengers: dummyPassengers, // ✅ FIX: not empty
        price: finalAmount,
        isadminBooking: true,
        blockReason: reason,
      }).unwrap();

      toast.success("Trip blocked / booked successfully");
      navigate("/admin/booked", {
        state: { bookingDetails: resp },
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error?.data?.message || "Failed to process booking. Please try again.",
      );
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
                totalSeats={totalSeats as number}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={bookedSeats}
                seatPrice={tripDetails.price}
                currentBus={currentBus}
                numberOfBuses={numberOfBuses}
                onBusChange={setCurrentBus}
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
          {selectedSeats.length === 1 && selectedSeats[0] === "N/A" && (
            <div className="flex justify-between mb-2">
              <span>Seat Type</span>
              <span>Block Booking</span>
            </div>
          )}

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
              blockReason={blockReason}
              onBlockReasonChange={setBlockReason}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
