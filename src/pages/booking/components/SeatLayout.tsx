import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Armchair } from "lucide-react";

interface SeatProps {
  id: string;
  isBooked: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  price: number;
}

const Seat = ({ id, isBooked, isSelected, onSelect }: SeatProps) => {
  return (
    <div className="flex flex-col items-center">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => !isBooked && onSelect(id)}
        disabled={isBooked}
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors
          ${
            isBooked
              ? "bg-gray-300 cursor-not-allowed"
              : isSelected
              ? "bg-blue-600 text-white"
              : "bg-white hover:bg-blue-50"
          }`}
      >
        <Armchair
          size={28}
          className={
            isBooked
              ? "text-gray-500"
              : isSelected
              ? "text-white"
              : "text-blue-600"
          }
        />
      </motion.button>
      <span className="text-xs mt-1 text-gray-700">{id}</span>
    </div>
  );
};

interface SeatLayoutProps {
  selectedSeats: string[];
  onSeatSelect: (id: string) => void;
  bookedSeats: string[];
  seatPrice: number;
  totalSeats: 20 | 32;
}

export const SeatLayout = ({
  selectedSeats,
  onSeatSelect,
  bookedSeats,
  seatPrice,
  totalSeats,
}: SeatLayoutProps) => {
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  // Generate seat layout dynamically based on totalSeats
  const generateSeatLayout = (totalSeats: number) => {
    const layout = [];
    let seatNumber = 1;

    for (let i = 0; i < totalSeats / 4; i++) {
      const row = [];

      for (let j = 0; j < 4; j++) {
        if (j === 1) {
          row.push(""); // Aisle
        } else if (seatNumber <= totalSeats) {
          row.push(seatNumber.toString());
          seatNumber++;
        }
      }
      layout.push(row);
    }
    return layout;
  };

  const seats = generateSeatLayout(Number(totalSeats));

  useEffect(() => {
    if (bookedSeats.length === seats.flat().length) {
      setShowLayoutModal(true);
    }
  }, [bookedSeats, seats]);

  return (
    <div className="bg-gray-100 p-6 rounded-xl">
      {/* Legend */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center">
            <Armchair className="text-blue-600 mr-2" size={20} />
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <Armchair className="text-gray-500 mr-2" size={20} />
            <span className="text-sm">Booked</span>
          </div>
          <div className="flex items-center">
            <Armchair className="text-blue-600 opacity-50 mr-2" size={20} />
            <span className="text-sm">Available</span>
          </div>
        </div>
        <div className="text-sm font-medium">
          Price per seat: ₹{seatPrice.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Seat layout */}
      <div className="flex flex-col items-center">
        {/* Driver's cabin */}
        <div className="flex flex-row gap-10 items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            {totalSeats}
          </div>
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            Driver
          </div>
        </div>
        {/* Seats */}
        <div className="grid grid-cols-4 gap-4">
          {seats.flatMap((row, rowIndex) =>
            row.map((seatId, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex justify-center"
              >
                {seatId ? (
                  <Seat
                    id={seatId}
                    isBooked={bookedSeats.includes(seatId)}
                    isSelected={selectedSeats.includes(seatId)}
                    onSelect={onSeatSelect}
                    price={seatPrice}
                  />
                ) : (
                  <div className="w-12 h-12"></div> // Empty space for aisle
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
