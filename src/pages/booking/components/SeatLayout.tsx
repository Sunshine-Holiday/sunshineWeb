import React from 'react';
import { motion } from 'framer-motion';

interface SeatProps {
  id: string;
  isBooked: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  price: number;
}

const Seat = ({ id, isBooked, isSelected, onSelect, price }: SeatProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => !isBooked && onSelect(id)}
      disabled={isBooked}
      className={`w-10 h-10 rounded-lg m-1 flex items-center justify-center text-sm font-medium transition-colors
        ${isBooked ? 'bg-gray-300 cursor-not-allowed' : 
          isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}
    >
      {id}
    </motion.button>
  );
};

interface SeatLayoutProps {
  selectedSeats: string[];
  onSeatSelect: (id: string) => void;
  bookedSeats: string[];
  seatPrice: number;
}

export const SeatLayout = ({ selectedSeats, onSeatSelect, bookedSeats, seatPrice }: SeatLayoutProps) => {
  // Generate seat layout for a bus with 3x3 and 2x2 configuration
  const leftSeats = Array.from({ length: 12 }, (_, i) => ({
    id: String.fromCharCode(65 + Math.floor(i / 3)) + (i % 3 + 1),
    price: seatPrice
  }));

  const rightSeats = Array.from({ length: 12 }, (_, i) => ({
    id: String.fromCharCode(65 + Math.floor(i / 3)) + (i % 3 + 4),
    price: seatPrice
  }));

  return (
    <div className="bg-gray-100 p-6 rounded-xl">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white rounded mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>
        <div className="text-sm font-medium">
          Price per seat: ₹{seatPrice.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="flex justify-between">
        {/* Left side - 3 seats */}
        <div className="grid grid-cols-3 gap-1">
          {leftSeats.map((seat) => (
            <Seat
              key={seat.id}
              id={seat.id}
              isBooked={bookedSeats.includes(seat.id)}
              isSelected={selectedSeats.includes(seat.id)}
              onSelect={onSeatSelect}
              price={seat.price}
            />
          ))}
        </div>

        {/* Aisle */}
        <div className="w-16 flex items-center justify-center">
          <div className="text-sm text-gray-500 rotate-90">Aisle</div>
        </div>

        {/* Right side - 3 seats */}
        <div className="grid grid-cols-3 gap-1">
          {rightSeats.map((seat) => (
            <Seat
              key={seat.id}
              id={seat.id}
              isBooked={bookedSeats.includes(seat.id)}
              isSelected={selectedSeats.includes(seat.id)}
              onSelect={onSeatSelect}
              price={seat.price}
            />
          ))}
        </div>
      </div>

      {/* Driver's cabin */}
      <div className="mt-8 flex justify-end">
        <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600">
          Driver
        </div>
      </div>
    </div>
  );
};