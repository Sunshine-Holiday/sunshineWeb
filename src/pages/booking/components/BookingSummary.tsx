import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { fadeInUp } from "../../../utils/animations";
import { FaSpinner } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";
import { Button } from "@/components/ui/button";

interface StartDate {
  date: string;
  seats: number;
}

interface BookingSummaryProps {
  tripDetails: {
    from: string;
    to: string;
    date: StartDate[];
    time: string;
    busType: string;
  };
  selectedDate: StartDate | null;
  setSelectedData: (date: StartDate) => void;
  selectedSeats: string[];
  seatPrice: number;
  onProceed: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const BookingSummary = ({
  loading,
  tripDetails,
  selectedSeats,
  seatPrice,
  selectedDate,
  setSelectedData,
  onProceed,
  disabled = false,
}: BookingSummaryProps) => {
  const totalSeats = selectedDate?.seats || 0;
  const isSeatSelection = totalSeats === 20 || totalSeats === 32;
  const totalAmount = selectedSeats.length * seatPrice;
  const gst = Number(totalAmount) * 0.05;
  const finalAmount = Number(totalAmount) + gst;

  if (isNaN(totalAmount) || isNaN(gst) || isNaN(finalAmount)) {
    console.warn("Invalid amount calculation:", { totalAmount, gst, finalAmount, seatPrice, selectedSeats });
  }

  const formatDateWithSeats = (startDate: StartDate): string => {
    const date = parse(startDate.date, "dd-MM-yyyy", new Date());
    if (!isValid(date)) {
      console.error("Invalid date:", startDate.date);
      return "Invalid Date";
    }
    const formattedDate = format(date, "dd-MM-yyyy");
    return `${formattedDate} (${startDate.seats} Seats)`;
  };

  const validDates = tripDetails.date.filter((startDate) => {
    if (!startDate || typeof startDate !== "object" || !("date" in startDate)) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parse(startDate.date, "dd-MM-yyyy", new Date());
    return isValid(checkDate) && checkDate >= today;
  });

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={`bg-white rounded-xl shadow-lg p-6 ${disabled ? "opacity-50" : ""}`}
    >
      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

      <div className="space-y-4 mb-6">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-5 h-5 mr-2" />
          <span>
            {tripDetails.from} → {tripDetails.to}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          <select
            className="border p-2 rounded-md w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={selectedDate ? formatDateWithSeats(selectedDate) : ""}
            onChange={(e) => {
              if (disabled) return;
              const selected = validDates.find(
                (date) => formatDateWithSeats(date) === e.target.value
              );
              if (selected) setSelectedData(selected);
            }}
            disabled={disabled || loading}
          >
            {validDates.length === 0 ? (
              <option value="">No available dates</option>
            ) : (
              <>
                <option value="">Select a date</option>
                {validDates.map((date) => (
                  <option key={date.date} value={formatDateWithSeats(date)}>
                    {formatDateWithSeats(date)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        {isSeatSelection && (
          <div className="flex justify-between mb-2">
            <span>Selected Seats</span>
            <span>{selectedSeats.join(", ") || "None"}</span>
          </div>
        )}
        <div className="flex justify-between mb-2">
          <span>Price per Seat</span>
          <span>₹{seatPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>₹{totalAmount.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>GST (5%)</span>
          <span>₹{gst.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4">
          <span>Total Amount</span>
          <span>₹{finalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <Button
        onClick={() => !disabled && onProceed()}
        disabled={(isSeatSelection && selectedSeats.length === 0) || loading || disabled}
        className={`w-full relative ${
          (isSeatSelection && selectedSeats.length === 0) || loading || disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading && <FaSpinner className="animate-spin inline mr-2" />}
        Proceed to {isSeatSelection ? "Passenger Details" : "Payment"}
      </Button>
    </motion.div>
  );
};