import React from "react";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";

interface SeatProps {
  id: string;
  isBooked: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
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
  totalSeats: 20 | 32;
}

export const SeatLayout = ({
  selectedSeats,
  onSeatSelect,
  bookedSeats,
  totalSeats,
}: SeatLayoutProps) => {

  const generateSeatLayout = () => {
    const layout = [];
  
    // First row (Driver and Coordinator)
    layout.push([
      { id: "coordinator", type: "text" },
      { id: "", type: "empty" },
      { id: "", type: "empty" },
      { id: "driver", type: "text" },
    ]);
  
    // Door row
    layout.push([
      { id: "door", type: "text" },
      { id: "", type: "empty" },
      { id: "2", type: "seat" },
      { id: "1", type: "seat" },
    ]);
  
    // Generate remaining seat rows
    let seatNumber = 3;
    const rows = totalSeats === 20 ? 5 : 8;
  
    for (let i = 0; i < rows; i++) {
      layout.push([
        { id: seatNumber.toString(), type: "seat" },
        { id: (seatNumber + 1).toString(), type: "seat" },
        { id: (seatNumber + 2).toString(), type: "seat" },
        { id: (seatNumber + 3).toString(), type: "seat" },
      ]);
      seatNumber += 4;
    }
  
    return layout;
  };
  
  const seatLayout = generateSeatLayout();

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
      </div>

      {/* Seat Layout */}
      <div className="flex flex-col gap-4">
        {seatLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-4">
            {row.map((seat, seatIndex) => (
              <div key={`${rowIndex}-${seatIndex}`} className="w-12">
                {seat.type === "seat" ? (
                  <Seat
                    id={seat.id}
                    isBooked={bookedSeats.includes(seat.id)}
                    isSelected={selectedSeats.includes(seat.id)}
                    onSelect={onSeatSelect}
                  />
                ) : seat.type === "text" ? (
                  <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-600">
                    {seat.id.charAt(0).toUpperCase() + seat.id.slice(1)}
                  </div>
                ) : (
                  <div className="w-12 h-12" /> // Empty space
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatLayout;
