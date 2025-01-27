import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { fadeInUp } from "../../../utils/animations";
import { FaSpinner } from "react-icons/fa";

interface BookingSummaryProps {
  tripDetails: {
    from: string;
    to: string;
    date: string;
    time: string;
    busType: string;
  };
  selectedSeats: string[];
  seatPrice: number;
  onProceed: () => void;
  loading: boolean;
}

export const BookingSummary = ({
  loading,
  tripDetails,
  selectedSeats,
  seatPrice,
  onProceed,
}: BookingSummaryProps) => {
  const totalAmount = selectedSeats.length * seatPrice;
  const gst = totalAmount * 0.18; // 18% GST
  const finalAmount = totalAmount + gst;

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="bg-white rounded-xl shadow-lg p-6"
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
          <span>{tripDetails.date}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          <span>{tripDetails.time}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span>Selected Seats</span>
          <span>{selectedSeats.join(", ")}</span>
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
          <span>GST (18%)</span>
          <span>₹{gst.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4">
          <span>Total Amount</span>
          <span>₹{finalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onProceed}
        disabled={selectedSeats.length === 0 || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium
          hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed relative"
      >
        {loading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <FaSpinner className="animate-spin text-white" />
          </div>
        ) : (
          "Proceed to Payment"
        )}
      </motion.button>
    </motion.div>
  );
};
