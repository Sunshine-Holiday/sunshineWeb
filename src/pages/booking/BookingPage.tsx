import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SeatLayout } from "./components/SeatLayout";
import { BookingSummary } from "./components/BookingSummary";
import { PassengerForm, PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "../../utils/animations";
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
import { Button } from "@/components/ui/button";

const INITIAL_STEP = "select-seats";

interface StartDate {
  date: string;
  seats: number; // As per Trip model, seats is a Number
}

const BookingPage = () => {
  const location = useLocation();
  const userDetails = useSelector(selectCurrentUser);
  const tripId = location.state?.tripId;
  const [selectedDate, setSelectedDate] = useState<StartDate | null>(
    location.state?.selectedDate || null
  );
  const navigate = useNavigate();

  // State variables
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trip, setTrip] = useState<any>(null);

  // Date formatting functions
  const formatDateToString = (dateInput: StartDate | string | Date): string => {
    let date: Date;
    if (typeof dateInput === "object" && "date" in dateInput) {
      date = parse(dateInput.date, "dd-MM-yyyy", new Date());
    } else if (typeof dateInput === "string") {
      date = parse(dateInput, "dd-MM-yyyy", new Date());
    } else {
      date = dateInput;
    }
    return isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";
  };

  const formatDateForAPI = (dateInput: StartDate | string | Date): string => {
    let date: Date;
    if (typeof dateInput === "object" && "date" in dateInput) {
      date = parse(dateInput.date, "dd-MM-yyyy", new Date());
    } else if (typeof dateInput === "string") {
      date = parse(dateInput, "dd-MM-yyyy", new Date());
    } else {
      date = dateInput;
    }
    return isValid(date) ? format(date, "dd-MM-yyyy") : "";
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

  // Effects
  useEffect(() => {
    if (bookingError) setBookedSeats([]);
  }, [bookingError]);

  useEffect(() => {
    if (tripData) setTrip(tripData.trip);
  }, [tripData]);

  useEffect(() => {
    if (bookingData?.selectedSeats) {
      setBookedSeats(bookingData.selectedSeats);
      console.log("Booked seats:", bookingData?.selectedSeats);
    } else {
      setBookedSeats([]);
    }
  }, [bookingData]);

  useEffect(() => {
    if (selectedDate) {
      const totalSeats = selectedDate.seats;
      // If totalSeats is not 20 or 32, skip seat selection and go to passenger details
      if (totalSeats !== 20 && totalSeats !== 32) {
        setStep("passenger-details");
        setSelectedSeats([]); // No specific seats for non-20/32
        setPassengers([
          {
            name: "",
            age: "",
            gender: "",
            idProof: "",
            idProofNumber: "",
            address: "",
          },
        ]);
      } else {
        setStep(INITIAL_STEP);
        setSelectedSeats([]);
        setPassengers([]);
      }
    }
  }, [selectedDate]);

  // Handlers
  const changeDate = (date: StartDate) => {
    setSelectedDate(date);
  };

  const isTripToday = () => {
    const today = format(new Date(), "dd-MM-yyyy");
    return trip?.startDates?.some(
      (date: StartDate) => formatDateToString(date) === today
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

  const addPassenger = () => {
    if (isSubmitting) return;
    const maxAvailableSeats = selectedDate
      ? selectedDate.seats - bookedSeats.length
      : 0;
    if (passengers.length >= maxAvailableSeats) {
      toast.error(`Cannot add more passengers. Only ${maxAvailableSeats} seats available.`);
      return;
    }
    setPassengers((prev) => [
      ...prev,
      {
        name: "",
        age: "",
        gender: "",
        idProof: "",
        idProofNumber: "",
        address: "",
      },
    ]);
  };

  const removePassenger = (index: number) => {
    if (isSubmitting) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
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
        name: "Sunshine Holiday Packages",
        description: "Seat Booking",
        order_id: paymentDetail.id,
        handler: async (response: any) => {
          try {
            const resp = await createBooking({
              tripId,
              selectedSeats:
                selectedDate?.seats !== 20 && selectedDate?.seats !== 32
                  ? Array(passengers.length).fill("N/A") // No specific seats for non-20/32
                  : selectedSeats,
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
            setIsSubmitting(false);
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
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info("Payment cancelled by user");
            reject(new Error("Payment cancelled"));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast.error("Payment failed. Please try again.");
        setIsSubmitting(false);
        reject(response);
      });
      razorpay.open();
    });
  };

  const handleProceed = async () => {
    if (isSubmitting) return;

    if (step === "select-seats") {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat.");
        return;
      }
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

      setIsSubmitting(true);
      try {
        if (typeof trip.price !== "string" || isNaN(Number(trip.price))) {
          throw new Error("Invalid trip price");
        }

        const totalAmount = passengers.length * Number(trip.price);
        const gst = totalAmount * 0.05;
        const finalAmount = totalAmount + gst;

        if (isNaN(totalAmount) || isNaN(gst) || isNaN(finalAmount)) {
          console.warn("Invalid amount calculation:", { totalAmount, gst, finalAmount, tripPrice: trip.price });
          throw new Error("Invalid amount calculation");
        }

        const respPayment = await createPayment({
          amount: finalAmount,
        }).unwrap();

        if (respPayment.success) {
          await handlePayment(respPayment.paymentDetail, finalAmount);
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        toast.error(error.message || error.data?.message || "Payment processing failed.");
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
    price: Number(trip.price) || 0,
    boardingPoints: trip.boardingPoints || [],
    busSize: trip.busSize || "20",
  };

  const totalSeats = selectedDate?.seats || Number(tripDetails.busSize);
  const maxAvailableSeats = totalSeats - bookedSeats.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 relative">
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
            {step === "select-seats" ? "Select Your Seats" : "Passenger Details"}
          </h1>
          <p className="text-gray-600">
            {step === "select-seats"
              ? "Choose your preferred seats for a comfortable journey"
              : `Enter details for up to ${maxAvailableSeats} passenger(s)`}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === "select-seats" && (totalSeats === 20 || totalSeats === 32) ? (
              <SeatLayout
                totalSeats={totalSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={bookedSeats}
                seatPrice={tripDetails.price}
                disabled={isSubmitting}
              />
            ) : (
              <div className="space-y-4">
                {passengers.map((_, index) => (
                  <div key={index} className="relative">
                    <PassengerForm
                      tripDetails={tripDetails}
                      seatNumber={`Passenger ${index + 1}`}
                      index={index}
                      onChange={handlePassengerChange}
                      passengers={passengers}
                    />
                    {passengers.length > 1 && (
                      <Button
                        onClick={() => removePassenger(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {maxAvailableSeats > passengers.length &&totalSeats!==32 && totalSeats!==20 &&(
                  <Button
                    onClick={addPassenger}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={isSubmitting}
                  >
                    Add Passenger
                  </Button>
                )}
                <p className="text-sm text-gray-600">
                  {maxAvailableSeats} seat(s) available
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