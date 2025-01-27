import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SeatLayout } from "./components/SeatLayout";
import { BookingSummary } from "./components/BookingSummary";
import { PassengerForm, PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "../../utils/animations";
import { useLocation } from "react-router-dom";
import { useGettripsIDQuery } from "@/store/api/trips";

const SEAT_PRICE = 1499;
const INITIAL_STEP = "select-seats";

// Simulated booked seats
const BOOKED_SEATS = ["3", "8", "12", "15", "22"];

const BookingPage = () => {
  const location = useLocation();
  const { tripId } = location.state;

  const [trip, setTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([
    
  ]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP
  );

  const { data, isLoading, isError } = useGettripsIDQuery({ id: tripId });

  useEffect(() => {
    if (data) {
      console.log(data)
      setTrip(data);
    }
  }, [data]);

  const isTripToday = () => {
    const today = new Date().toDateString(); // Current date
    if (
      trip?.startDates?.some(
        (date: string) => new Date(date).toDateString() === today
      )
    ) {
      console.log("One of the trip dates matches today's date!");
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (trip) {
      const matchFound = isTripToday();
      if (matchFound) {
        console.log("Trip is happening today!");
      }
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
      updatedPassengers[index] = data; // Update the passenger data at the specified index
      return updatedPassengers;
    });
  };

  const handleProceed = () => {
    if (step === "select-seats") {
      setStep("passenger-details");
    } else {
      console.log("Proceeding to payment", { selectedSeats, passengers });
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
    time: "21:00", // Placeholder
    busType: trip.busSize || "Standard",
    amenities: trip.amenities || [],
    price: trip?.price,
    boardingPoints: trip?.boardingPoints || []
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
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={BOOKED_SEATS}
                seatPrice={tripDetails.price}
              />
            ) : (
              <div className="space-y-4">
                {selectedSeats.map((seat, index) => (
                  <PassengerForm
                    tripDetails={tripDetails}
                    key={seat}
                    seatNumber={seat}
                    index={index}
                    onChange={handlePassengerChange}
                    passengers={passengers} // Passing passengers state to form
                  />
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <BookingSummary
              tripDetails={tripDetails}
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
