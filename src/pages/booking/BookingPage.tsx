import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SeatLayout } from "./components/SeatLayout";
import { BookingSummary } from "./components/BookingSummary";
import { PassengerForm, PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "../../utils/animations";
import { useLocation, useNavigate } from "react-router-dom";
import { useGettripsIDQuery } from "@/store/api/trips";
import { toast } from "react-toastify";
import { useCreatebookingMutation } from "@/store/api/booking";
import { useCreatePaymentIntentMutation } from "@/store/api/terms";
import { RAZORPAY_API_KEY } from "@/store/store";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { FaSpinner } from "react-icons/fa";
import { useSelectedDateBookingQuery } from "@/store/api/auth";

const INITIAL_STEP = "select-seats";

const BookingPage = () => {
  const location = useLocation();
  const userDetails = useSelector(selectCurrentUser);
  const tripId = location.state?.tripId;
  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate || ""
  );
  const navigate = useNavigate();

  // State variables
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP
  );
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  function formatDate(dateInput, format = "yyyy-mm-dd") {
    // Convert input to Date object
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date input");
    }

    // Get date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Pad single digits with leading zero
    const pad = (num) => num.toString().padStart(2, "0");

    // Replace format tokens with actual values
    return format
      .replace("yyyy", year)
      .replace("mm", pad(month))
      .replace("dd", pad(day))
      .replace("HH", pad(hours))
      .replace("MM", pad(minutes))
      .replace("SS", pad(seconds));
  }
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
  } = useSelectedDateBookingQuery(
    {
      trip_id: tripId,
      selectedDate: formatDate(selectedDate),
    },
  
  );

  const [createBooking] = useCreatebookingMutation();
  const [createPayment] = useCreatePaymentIntentMutation();

  // Update trip data when API response is received
  useEffect(() => {
    if (tripData) setTrip(tripData);
  }, [tripData]);

  // Update booked seats when booking data is received
  useEffect(() => {
    if (bookingData?.selectedSeats) {
      console.log(bookingData)
      setBookedSeats(bookingData.selectedSeats);
    }
  }, [bookingData]);

  // Handle date change
  const changeDate = (date) => {
    setSelectedDate(date);
  };

  // Check if trip is scheduled for today
  const isTripToday = () => {
    const today = new Date().toDateString();
    return trip?.startDates?.some(
      (date: string) => new Date(date).toDateString() === today
    );
  };

  // Handle seat selection
  const handleSeatSelect = (seatId: string) => {
    if (bookedSeats.includes(seatId)) {
      // Seat is already booked, don't allow selection
      toast.error("This seat is already booked");
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId].sort()
    );
  };

  // Update passenger data
  const handlePassengerChange = (index: number, data: PassengerData) => {
    setPassengers((prev) => {
      const updatedPassengers = [...prev];
      updatedPassengers[index] = data;
      return updatedPassengers;
    });
  };

  // Validate passenger details
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

  // Initialize Razorpay payment
  const handlePayment = async (paymentDetail: any, finalAmount: number) => {
    const options = {
      key: RAZORPAY_API_KEY,
      amount: paymentDetail.amount,
      currency: paymentDetail.currency,
      name: "Your Store Name",
      description: "Purchase Description",
      order_id: paymentDetail.id,
      handler: async (response: any) => {
        console.log("Payment Successful:", response);
        try {
          const resp = await createBooking({
            tripId,
            selectedSeats,
            selectedDate: selectedDate,
            passengers,
            price: finalAmount,
          }).unwrap();
          console.log(resp);
          toast.success("Trip booked successfully");
          navigate("/booked");
        } catch (error) {
          console.error(error);
          toast.error("Order failed!");
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
    razorpay.open();
  };

  // Handle proceed button clicks
  const handleProceed = async () => {
    if (step === "select-seats") {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat.");
        return;
      }

      // Initialize passenger data array with empty objects
      setPassengers(
        Array(selectedSeats.length).fill({
          name: "",
          age: "",
          gender: "",
          idProof: "",
          idProofNumber: "",
          address: "",
        })
      );

      setStep("passenger-details");
    } else {
      if (!validatePassengerDetails()) {
        toast.error("Please fill in all the passenger details.");
        return;
      }

      setLoading(true);
      try {
        const totalAmount = selectedSeats.length * trip.price;
        const gst = totalAmount * 0.05; // 5% GST
        const finalAmount = totalAmount + gst;

        const respPayment = await createPayment({
          amount: finalAmount,
        }).unwrap();
        if (respPayment.success) {
          handlePayment(respPayment.paymentDetail, finalAmount);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.data?.message || "Payment processing failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Loading state
  if (tripLoading || (bookingLoading && selectedDate)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  // Error state
  if (tripError || !trip) {
    return <div className="text-center">Failed to load trip details.</div>;
  }

  // Trip details object
  const tripDetails = {
    from: trip.location || "Unknown",
    to: trip.category || "Unknown",
    date: trip.startDates,
    time: trip.duration,
    busType: trip.busSize || "Standard",
    amenities: trip.amenities || [],
    price: trip?.price || 1499,
    boardingPoints: trip?.boardingPoints || [],
    busSize: trip.busSize || 20,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {step === "select-seats" ? (
              <SeatLayout
                totalSeats={Number(tripDetails?.busSize)}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={bookedSeats}
                seatPrice={tripDetails.price}
              />
            ) : (
              <div className="space-y-4">
                {selectedSeats.map((seat, index) => (
                  <PassengerForm
                  
                    key={seat}
                    tripDetails={tripDetails}
                    seatNumber={seat}
                    index={index}
                    onChange={handlePassengerChange}
                    passengers={passengers}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <BookingSummary
              tripDetails={tripDetails}
              loading={loading}
              selectedSeats={selectedSeats}
              seatPrice={tripDetails.price}
              setSelectedData={changeDate}
              selectedDate={selectedDate}
              onProceed={handleProceed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
