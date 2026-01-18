import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Armchair } from "lucide-react";

interface SeatProps {
  id: string;
  isBooked: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  price: number;
  disabled?: boolean;
  totalSeats: number;
}

const Seat = ({ id, isBooked, isSelected, onSelect, disabled }: SeatProps) => {
  return (
    <div className="items-center flex flex-col">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      onClick={() => !isBooked && !disabled && onSelect(id)}

        disabled={isBooked}
        className={`w-10 h-16 rounded-lg m-1 flex flex-col items-center justify-center transition-colors
        ${
          isBooked
            ? "bg-gray-300 cursor-not-allowed"
            : isSelected
            ? "bg-blue-600 text-white"
            : "bg-white hover:bg-blue-50"
        }`}
      >
        <Armchair
          size={20}
          className={`mt-1 ${
            isBooked
              ? "text-gray-400"
              : isSelected
              ? "text-white"
              : "text-gray-600"
          }`}
        />
      </motion.button>
      <span className="text-sm font-medium">{id}</span>
    </div>
  );
};

interface SeatLayoutProps {
  selectedSeats: string[];
  onSeatSelect: (id: string) => void;
  bookedSeats: string[];
  seatPrice: number;
  totalSeats: number;
  disabled?: boolean; // ✅ ADD THIS
    currentBus: number;          // ✅
  numberOfBuses: number;       // ✅
  onBusChange: (n: number) => void; // ✅
}

export const SeatLayout = ({
  selectedSeats,
  onSeatSelect,
  bookedSeats,
  seatPrice,
  totalSeats,
  disabled,
  currentBus,
  numberOfBuses,
  onBusChange,
}: SeatLayoutProps) => {
  const [isTwoSeaterLayout, setIsTwoSeaterLayout] = useState(
    totalSeats !== 20 ? true : false
  );
  const [showLayoutModal, setShowLayoutModal] = useState(false);
useEffect(() => {
    setIsTwoSeaterLayout(totalSeats === 32);
  }, [totalSeats]);
  // Define seat layout
  const seats = isTwoSeaterLayout
    ? [
        ["", "", "", "1", "2"],
        ["3", "4", "", "5", "6"],
        ["7", "8", "", "9", "10"],
        ["11", "12", "", "13", "14"],
        ["15", "16", "", "17", "18"],
        ["19", "20", "", "21", "22"],
        ["23", "24", "", "25", "26"],
        ["27", "28", "29", "30", "31"],
        
      ]
    : [
        ["1", "", "2", "3"],
        ["4", "", "5", "6"],
        ["7", "", "8", "9"],
        ["10", "", "11", "12"],
        ["13", "", "14", "15"],
        ["16", "17", "18", "19"],
      ];

  // Condition to show modal when more than 15 seats are selected
  const shouldShowLayoutChange = selectedSeats.length > 11;
useEffect(() => {
  const bookedForCurrentBus = bookedSeats.filter(
    s => s.startsWith(`${currentBus}-`)
  );

  if (
    bookedForCurrentBus.length >= totalSeats &&
    currentBus < numberOfBuses - 1
  ) {
    onBusChange(currentBus + 1);
  }
}, [bookedSeats, currentBus, numberOfBuses, totalSeats]);

useEffect(() => {
  const bookedForCurrentBus = bookedSeats.filter(
    s => s.startsWith(`${currentBus}-`)
  );

  if (
    bookedForCurrentBus.length >= totalSeats &&
    currentBus < numberOfBuses - 1
  ) {
    onBusChange(currentBus + 1);
  }
}, [bookedSeats, currentBus, numberOfBuses, totalSeats]);

  useEffect(() => {
    if (bookedSeats.length === seats.flat().filter(Boolean).length) {
      setShowLayoutModal(true); // All seats booked, show modal
    }
  }, [bookedSeats, seats]);

  const handleLayoutChange = () => {
    setIsTwoSeaterLayout(true);
    setShowLayoutModal(false);
  };

  const handleIconClick = () => {
    if (shouldShowLayoutChange) {
      setShowLayoutModal(true); // Show modal when more than 15 seats are selected
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-xl">
      {/* Legend */}
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
          Price per seat: ₹{seatPrice.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Seat layout */}
      <div className="flex flex-col items-center">
        <div className="my-3">
          <p className="text-red-600">Your seats can be changed by admin</p>
        </div>
        {/* Driver's cabin */}
        <div className="flex flex-row gap-10 items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            {isTwoSeaterLayout ? 32 : 20}
          </div>
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            Driver
          </div>
        </div>
        {/* Seats */}
        <div
          className={`grid ${
            isTwoSeaterLayout ? "grid-cols-5" : "grid-cols-4"
          } gap-2`}
        >
          {seats.flatMap((row, rowIndex) =>
            row.map((seatId, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex justify-center"
              >
                {seatId ? (
                  <Seat
                  disabled={disabled}
                    id={seatId}
       isBooked={bookedSeats.includes(`${currentBus}-${seatId}`)}

                 isSelected={selectedSeats.includes(`${currentBus}-${seatId}`)}

                   onSelect={() => onSeatSelect(`${currentBus}-${seatId}`)}

                    price={seatPrice}
                    totalSeats={totalSeats}
                  />
                ) : (
                  <div className="w-10 h-16"></div> // Empty space for aisle
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
  <button
    onClick={() => onBusChange(Math.max(0, currentBus - 1))}
    disabled={currentBus === 0}
    className="px-4 py-2 border rounded disabled:opacity-50"
  >
    Previous Bus
  </button>

  <span className="font-semibold">
    Bus {currentBus + 1} of {numberOfBuses}
  </span>

  <button
    onClick={() =>
      onBusChange(Math.min(numberOfBuses - 1, currentBus + 1))
    }
    disabled={currentBus === numberOfBuses - 1}
    className="px-4 py-2 border rounded disabled:opacity-50"
  >
    Next Bus
  </button>
</div>

    </div>
  );
};
