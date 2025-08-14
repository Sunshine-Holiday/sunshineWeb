import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeatProps {
  id: string;
  isBooked: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  price: number;
  totalSeats: number;
}

const Seat = ({ id, isBooked, isSelected, onSelect }: SeatProps) => {
  return (
    <div className="items-center flex flex-col">
      <motion.div
        whileHover={{ scale: isBooked ? 1 : 1.1 }}
        whileTap={{ scale: isBooked ? 1 : 0.95 }}
      >
        <Button
          onClick={() => !isBooked && onSelect(id)}
          disabled={isBooked}
          className={`w-10 h-16 rounded-lg m-1 flex flex-col items-center justify-center transition-colors
            ${
              isBooked
                ? "bg-gray-300 cursor-not-allowed"
                : isSelected
                ? "bg-blue-600 text-white hover:bg-blue-600"
                : "bg-white hover:bg-blue-50 text-gray-600"
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
        </Button>
      </motion.div>
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
  disabled?: boolean;
}

export const SeatLayout = ({
  selectedSeats,
  onSeatSelect,
  bookedSeats,
  seatPrice,
  totalSeats=32,
  disabled = false,
}: SeatLayoutProps) => {
  const [isTwoSeaterLayout, setIsTwoSeaterLayout] = useState(
    totalSeats !== 20 ? true : false
  );
  console.log(`isTwoSeaterLayout: ${totalSeats}`);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  const isBlockBooking = selectedSeats.includes("block");

  if (totalSeats !== 20 && totalSeats !== 32) {
    console.warn(`Invalid totalSeats value: ${totalSeats}. Expected 20 or 32.`);
    return null;
  }

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

  useEffect(() => {
    if (
      !isBlockBooking &&
      bookedSeats.length === seats.flat().filter(Boolean).length
    ) {
      setShowLayoutModal(true);
    }
  }, [bookedSeats, seats, isBlockBooking]);

  const handleLayoutChange = () => {
    setIsTwoSeaterLayout(true);
    setShowLayoutModal(false);
  };

  const handleIconClick = () => {
    if (!isBlockBooking && selectedSeats.length > 11) {
      setShowLayoutModal(true);
    }
  };

  if (isBlockBooking) {
    return (
      <div className="bg-gray-100 p-6 rounded-xl text-center">
        <h3 className="text-xl font-semibold mb-4">Block Booking (1 Seat)</h3>
        <p className="text-gray-600 mb-4">
          This is a full bus booking, treated as a single seat for pricing.
        </p>
        <div className="text-sm font-medium">
          Total Price: ₹
          {seatPrice.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-100 p-6 rounded-xl ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
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
          Price per seat: ₹
          {seatPrice.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="my-3">
          <p className="text-red-600">Your seats can be changed by admin</p>
        </div>
        <div className="flex flex-row gap-10 items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            {totalSeats}
          </div>
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            Driver
          </div>
        </div>
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
                    id={seatId}
                    isBooked={bookedSeats.includes(seatId)}
                    isSelected={selectedSeats.includes(seatId)}
                    onSelect={onSeatSelect}
                    price={seatPrice}
                    totalSeats={totalSeats}
                  />
                ) : (
                  <div className="w-10 h-16"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};