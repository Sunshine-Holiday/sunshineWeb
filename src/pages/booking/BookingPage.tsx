import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SeatLayout } from './components/SeatLayout';
import { BookingSummary } from './components/BookingSummary';
import { PassengerForm, PassengerData } from './components/PassengerForm';
import { fadeInUp } from '../../utils/animations';

const SEAT_PRICE = 1499;

// Simulated booked seats
const BOOKED_SEATS = ['3', '8', '12', '15', '22'];

export const BookingPage = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<'select-seats' | 'passenger-details'>('select-seats');

  const tripDetails = {
    from: 'Mumbai',
    to: 'Bangalore',
    date: 'March 15, 2024',
    time: '21:00',
    busType: 'AC Sleeper',
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId].sort()
    );
  };

  const handlePassengerChange = (index: number, data: PassengerData) => {
    setPassengers(prev => {
      const newPassengers = [...prev];
      newPassengers[index] = data;
      return newPassengers;
    });
  };

  const handleProceed = () => {
    if (step === 'select-seats') {
      setStep('passenger-details');
    } else {
      // Handle payment
      console.log('Proceeding to payment', { selectedSeats, passengers });
    }
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
            {step === 'select-seats' ? 'Select Your Seats' : 'Passenger Details'}
          </h1>
          <p className="text-gray-600">
            {step === 'select-seats' 
              ? 'Choose your preferred seats for a comfortable journey'
              : 'Please fill in the details for all passengers'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === 'select-seats' ? (
              <SeatLayout
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={BOOKED_SEATS}
                seatPrice={SEAT_PRICE}
              />
            ) : (
              <div className="space-y-4">
                {selectedSeats.map((seat, index) => (
                  <PassengerForm
                    key={seat}
                    seatNumber={seat}
                    index={index}
                    onChange={handlePassengerChange}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <BookingSummary
              tripDetails={tripDetails}
              selectedSeats={selectedSeats}
              seatPrice={SEAT_PRICE}
              onProceed={handleProceed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage