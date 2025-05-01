import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { fadeInUp } from "@/utils/animations";
import { FaSpinner } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";

interface BookingSummaryProps {
  tripDetails: {
    from: string;
    to: string;
    date: string[];
    time: string;
    busType: string;
  };
  selectedDate: string;
  setSelectedData: (date: string) => void;
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
  const totalAmount = selectedSeats.length * seatPrice;
  const gst = totalAmount * 0.05; // 5% GST
  const finalAmount = totalAmount + gst;

  // Format date to "dd-MM-yyyy"
  const formatDateToString = (dateInput: string): string => {
    try {
      const date = parse(dateInput, "dd-MM-yyyy", new Date());
      if (!isValid(date)) {
        console.warn("Invalid date format:", dateInput);
        return "Invalid Date";
      }
      return format(date, "dd-MM-yyyy");
    } catch (error) {
      console.error("Error parsing date:", dateInput, error);
      return "Invalid Date";
    }
  };

  // Filter dates to only include valid, present, or future dates
  const validDates = (tripDetails.date || []).filter((date) => {
    // Ensure date is a string and not empty
    if (typeof date !== "string" || !date.trim()) {
      console.warn("Non-string or empty date detected:", date);
      return false;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = parse(date, "dd-MM-yyyy", new Date());
      return isValid(checkDate) && checkDate >= today;
    } catch (error) {
      console.error("Error parsing date in filter:", date, error);
      return false;
    }
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
            {tripDetails.from || "N/A"} → {tripDetails.to || "N/A"}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          <select
            className="border p-2 rounded-md w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={selectedDate}
            onChange={(e) => !disabled && setSelectedData(e.target.value)}
            disabled={disabled || loading || validDates.length === 0}
          >
            {validDates.length === 0 ? (
              <option value="">No available dates</option>
            ) : (
              validDates.map((date) => (
                <option key={date} value={date}>
                  {formatDateToString(date)}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span>Selected Seats</span>
          <span>{selectedSeats.join(", ") || "None"}</span>
        </div>
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
          <span>₹{gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4">
          <span>Total Amount</span>
          <span>₹{finalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: !disabled && !loading ? 1.02 : 1 }}
        whileTap={{ scale: !disabled && !loading ? 0.98 : 1 }}
        onClick={() => !disabled && onProceed()}
        disabled={selectedSeats.length === 0 || loading || disabled || !validDates.length}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed relative"
      >
        {loading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <FaSpinner className="animate-spin text-white" />
          </div>
        ) : (
          "Proceed to Block"
        )}
      </motion.button>
    </motion.div>
  );
};