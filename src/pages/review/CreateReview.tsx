import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import {
  FaSpinner,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaBus,
  FaRupeeSign,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import {
  useCreateReviewMutation,
  useGetbookingIDQuery,
} from "@/store/api/booking";
import { IMAGE_URL } from "@/store/store";

const ReviewCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [createReview] = useCreateReviewMutation();
  const {
    data,
    isLoading: bookingLoading,
    error: bookingError,
  } = useGetbookingIDQuery({ id });
  const { booking } = data || {};
  const user = useSelector(selectCurrentUser);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookingError) {
      toast.error("Error loading booking details");
    }
  }, [bookingError]);

  const handleDescriptionChange = (value:any) => {
    setDescription(value);
  };

  const handleFormSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reviewData = {
        bookingId:id,
        description,
      };

      const response = await createReview(reviewData).unwrap();
      toast.success("Review submitted successfully!");
      navigate("/booked");
    } catch (error:any) {
      console.error(error);
      toast.error(error?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }
  console.log(booking.trip);
  if (!booking?.trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't find the booking you're looking for.
          </p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }
// console.log(IMAGE_URL+booking.trip.banner)
  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Banner Image with optional chaining */}
          {booking?.trip?.banner && (
            <div className="relative h-48 md:h-64 w-full overflow-hidden">
              <img
                src={IMAGE_URL+booking.trip.banner}
                alt={booking.trip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {booking.trip.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">
                    {booking.trip.title}
                  </h1>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg space-y-4">
                <h2 className="font-bold text-lg text-gray-800 border-b border-blue-200 pb-2">
                  Trip Details
                </h2>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-gray-600">{booking?.trip?.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaCalendarAlt className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Travel Date</p>
                    <p className="text-gray-600">{booking?.selectedDate}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaUsers className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Selected Seats</p>
                    <p className="text-gray-600">
                      {booking?.selectedSeats?.join(", ")}
                      <span className="text-gray-500 text-sm">
                        ({booking?.selectedSeats?.length}{" "}
                        {booking?.selectedSeats?.length === 1
                          ? "seat"
                          : "seats"}
                        )
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-lg space-y-4">
                <h2 className="font-bold text-lg text-gray-800 border-b border-green-200 pb-2">
                  Booking Information
                </h2>

                <div className="flex items-start">
                  <FaRupeeSign className="text-green-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Total Price</p>
                    <p className="text-gray-600">₹{booking?.price}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaBus className="text-green-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Bus Size</p>
                    <p className="text-gray-600">
                      {booking?.trip?.busSize} Seater
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Status</p>
                    <p className="capitalize font-medium text-green-600">
                      {booking?.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 pt-4">
              Write Your Review
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Share Your Experience
                </label>
                <ReactQuill
                  value={description}
                  onChange={handleDescriptionChange}
                  className="bg-white"
                  placeholder="Tell us about your travel experience, what you enjoyed, and any suggestions for improvement..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Your honest feedback helps other travelers make informed
                  decisions
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !description.trim()}
                  className={`w-full py-3 px-4 rounded-md shadow text-white font-medium transition ${
                    loading || !description.trim()
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewCreatePage;
