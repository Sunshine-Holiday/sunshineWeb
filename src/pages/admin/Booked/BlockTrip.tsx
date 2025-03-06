import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SeatLayout } from "./components/SeatLayout";
import { BookingSummary } from "./components/BookingSummary";
import { PassengerForm, PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "@/utils/animations";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGettripsIDQuery,
  useSelectedDateBookingQuery,
} from "@/store/api/trips";
import { toast } from "react-toastify";
import { useCreatebookingMutation } from "@/store/api/booking";
import { useCreatePaymentIntentMutation } from "@/store/api/terms";
import { RAZORPAY_API_KEY } from "@/store/store";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { FaSpinner } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";

const INITIAL_STEP = "select-seats";

const BookingPage = () => {
  const location = useLocation();
  const { state } = useLocation();
  const userDetails = useSelector(selectCurrentUser);

  const tripId = location.state?.trip._id;
  const startDate = state?.startDate;
  const navigate = useNavigate();
  // console.log(tripDetail.startDates)
  // State variables
  const [selectedDate, setSelectedDate] = useState<string>(startDate || "");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trip, setTrip] = useState<any>(null);

  // Date formatting functions
  const formatDateToString = (dateInput: string | Date): string => {
    const date =
      typeof dateInput === "string"
        ? parse(dateInput, "dd-MM-yyyy", new Date())
        : dateInput;
    return isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";
  };
  const formatDateForAPI = (dateInput: string | Date): string => {
    const date =
      typeof dateInput === "string"
        ? parse(dateInput, "dd-MM-yyyy", new Date())
        : dateInput;
    if (!isValid(date)) {
      //   console.error("Invalid date for API:", dateInput);
      return "";
    }
    return format(date, "dd-MM-yyy");
  };
  // API queries and mutations
  const {
    data: tripData,
    isLoading: tripLoading,
    isError: tripError,
  } = useGettripsIDQuery({ id: tripId });

  const {
    data: bookingData,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useSelectedDateBookingQuery({
    trip_id: tripId,
    selectedDate: selectedDate ? formatDateForAPI(selectedDate) : "",
  });

  const [createBooking] = useCreatebookingMutation();
  const [createPayment] = useCreatePaymentIntentMutation();

  // Date checking function
  const checkAndUpdateDate = (startDates: string[]) => {
    const today = format(new Date(), "dd-MM-yyyy");
    const currentDateIndex = startDates.findIndex(
      (date) => formatDateToString(date) === today
    );

    if (currentDateIndex !== -1) {
      setSelectedDate(startDates[currentDateIndex]);
      return;
    }

    const sortedDates = [...startDates].sort((a, b) => {
      const dateA = parse(a, "dd-MM-yyyy", new Date());
      const dateB = parse(b, "dd-MM-yyyy", new Date());
      return dateA.getTime() - dateB.getTime();
    });

    const nextDate = sortedDates.find((date) => {
      const parsedDate = parse(date, "dd-MM-yyyy", new Date());
      return parsedDate > new Date();
    });

    if (nextDate) {
      setSelectedDate(nextDate);
    }
  };

  // Effects
  useEffect(() => {
    if (bookingError) setBookedSeats([]);
  }, [bookingError]);

  useEffect(() => {
    if (tripData) setTrip(tripData);
  }, [tripData]);

  useEffect(() => {
    if (trip?.startDates && !selectedDate) {
      checkAndUpdateDate(trip.startDates);
    }
  }, [trip?.startDates]);

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
  };

  const isTripToday = () => {
    const today = format(new Date(), "dd-MM-yyyy");
    return trip?.startDates?.some(
      (date: string) => formatDateToString(date) === today
    );
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

  const handlePassengerChange = (index: number, data: PassengerData) => {
    if (isSubmitting) return;
    setPassengers((prev) => {
      const updatedPassengers = [...prev];
      updatedPassengers[index] = data;
      return updatedPassengers;
    });
  };

  const validatePassengerDetails = () => {
    return passengers.every(
      (passenger) =>
        passenger.name &&
        passenger.age &&
        passenger.gender &&
        passenger.idProof &&
        passenger.idProofNumber &&
        passenger.address
    );
  };

  const handlePayment = async (paymentDetail: any, finalAmount: number) => {
    return new Promise<void>((resolve, reject) => {
      const options = {
        key: RAZORPAY_API_KEY,
        amount: paymentDetail.amount,
        currency: paymentDetail.currency,
        name: "Your Store Name",
        description: "Purchase Description",
        order_id: paymentDetail.id,
        handler: async (response: any) => {
          try {
            const resp = await createBooking({
              tripId,
              selectedSeats,
              selectedDate: formatDateToString(selectedDate),
              passengers,
              price: finalAmount,
            }).unwrap();

            toast.success("Trip booked successfully");
            navigate("/booked", {
              state: {
                bookingDetails: resp,
                paymentResponse: response,
              },
            });
            resolve();
          } catch (error) {
            console.error("Booking error:", error);
            toast.error("Booking failed!");
            reject(error);
          }
        },
        prefill: {
          name: `${userDetails?.username}`,
          email: userDetails?.email,
          contact: "",
        },
        theme: {
          color: "#3399cc",
        },
        method: {
          netbanking: true,
          card: true,
          wallet: true,
          upi: true,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast.error("Payment failed. Please try again.");
        reject(response);
      });
      razorpay.open();
    });
  };

  const handleProceed = async () => {
    if (isSubmitting) return;
    console.log("1");
    if (step === "select-seats") {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat.");
        return;
      }
      console.log("2");

      setIsSubmitting(true);

      const totalAmount = selectedSeats.length * trip.price;
      const gst = totalAmount * 0.05;
      const finalAmount = totalAmount + gst;

      console.log(finalAmount);
      try {
        const resp = await createBooking({
          tripId,
          selectedSeats,
          selectedDate: formatDateToString(selectedDate),
          passengers,
          price: finalAmount,
        }).unwrap();

        toast.success("Trip booked successfully");
        navigate("/admin/booked");
      } catch (error) {
        console.error("Booking error:", error);
        toast.error("Booking failed!");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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

  const tripDetails = {
    from: trip.location || "Unknown",
    to: trip.category || "Unknown",
    date: trip.startDates || [],
    time: trip.duration || "N/A",
    busType: trip.busSize || "Standard",
    amenities: trip.amenities || [],
    price: trip?.price || 1499,
    boardingPoints: trip?.boardingPoints || [],
    busSize: trip.busSize || "20",
  };

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
            {step === "select-seats"
              ? "Select Your Seats"
              : "Passenger Details"}
          </h1>
          <p className="text-gray-600">
            {step === "select-seats"
              ? "Choose your preferred seats for a comfortable journey"
              : "Please fill in the details for all passengers"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SeatLayout
              totalSeats={Number(tripDetails?.busSize)}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              bookedSeats={bookedSeats}
              seatPrice={tripDetails.price}
            />
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
