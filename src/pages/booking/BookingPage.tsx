import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SeatLayout } from "./components/SeatLayout";
import { BookingSummary } from "./components/BookingSummary";
import { PassengerForm, PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "../../utils/animations";
import { useLocation } from "react-router-dom";
import { useGettripsIDQuery } from "@/store/api/trips";
import { toast } from "react-toastify";
import { useCreatebookingMutation } from "@/store/api/booking";
import { useCreatePaymentIntentMutation } from "@/store/api/terms";
import { RAZORPAY_API_KEY } from "@/store/store";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";

const SEAT_PRICE = 1499;
const INITIAL_STEP = "select-seats";
const BOOKED_SEATS = ["3", "8", "12", "15", "22"];

const BookingPage = () => {
  const location = useLocation();
  const userDetails = useSelector(selectCurrentUser);
  const { tripId } = location.state;

  const [createBooking] = useCreatebookingMutation();
  const [createPayment] = useCreatePaymentIntentMutation();

  const [trip, setTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP
  );
  const [loading, setLoading] = useState(false);

  const { data, isLoading, isError } = useGettripsIDQuery({ id: tripId });

  useEffect(() => {
    if (data) setTrip(data);
  }, [data]);

  const isTripToday = () => {
    const today = new Date().toDateString();
    return trip?.startDates?.some(
      (date: string) => new Date(date).toDateString() === today
    );
  };

  useEffect(() => {
    if (trip && isTripToday()) {
      console.log("Trip is happening today!");
    }
  }, [trip]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId].sort()
    );
  };

  const handlePassengerChange = (index: number, data: PassengerData) => {
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
            selectedDate: Date.now(),
            passengers,
            price: finalAmount,
          }).unwrap();
          console.log(resp);
          toast.success("Trip booked successfully");
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
      },method: {
        netbanking: true,
        card: true,
        wallet: true,
        upi: true, // UPI is enabled here
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleProceed = async () => {
    if (step === "select-seats") {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat.");
        return;
      }
      setStep("passenger-details");
    } else {
      if (!validatePassengerDetails()) {
        toast.error("Please fill in all the passenger details.");
        return;
      }

      setLoading(true);
      try {
        const totalAmount = selectedSeats.length * trip.price;
        const gst = totalAmount * 0.18; // 18% GST
        const finalAmount = totalAmount + gst;

        const respPayment = await createPayment({ amount: finalAmount }).unwrap();
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

  if (isLoading) {
    return <div className="text-center">Loading trip details...</div>;
  }

  if (isError || !trip) {
    return <div className="text-center">Failed to load trip details.</div>;
  }

  const tripDetails = {
    from: trip.location || "Unknown",
    to: trip.category || "Unknown",
    date: new Date(trip.startDates[0]).toLocaleDateString(),
    time: trip.duration,
    busType: trip.busSize || "Standard",
    amenities: trip.amenities || [],
    price: trip?.price || SEAT_PRICE,
    boardingPoints: trip?.boardingPoints || [],
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
            {step === "select-seats" ? "Select Your Seats" : "Passenger Details"}
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
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={BOOKED_SEATS}
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
              onProceed={handleProceed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
