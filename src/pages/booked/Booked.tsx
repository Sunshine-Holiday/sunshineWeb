
import {
  useGetuserAllbookingQuery,
  useRequestCancelBookingMutation,
} from "@/store/api/booking";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Define TypeScript interfaces
interface Passenger {
  name?: string;
  age: number;
  gender: string;
  address: string;
  idProof: string;
  idProofNumber: string;
}

interface Booking {
  _id: string;
  trip: {
    title: string;
    location: string;
  };
  price: string;
  user: {
    email: string;
    phone: string;
  };
  selectedDate: string;
  status?: string;
  passengers: Passenger[];
  isReview: boolean;
  isReviewActivate?: boolean;
}

const PassengerDetails = ({ passenger }: { passenger: Passenger }) => (
  <div className="text-sm text-gray-600 mb-2">
    <div>
      <strong>Name:</strong> {passenger.name || "Unnamed"}
    </div>
    <div>
      <strong>Age:</strong> {passenger.age}
    </div>
    <div>
      <strong>Gender:</strong> {passenger.gender}
    </div>
    <div>
      <strong>Boarding Point:</strong> {passenger.address}
    </div>
    <div>
      <strong>ID Proof:</strong> {passenger.idProof} ({passenger.idProofNumber})
    </div>
  </div>
);

export const LoadingState = () => (
  <div className="min-h-screen bg-white pt-24 pb-16 px-6">
    <div className="max-w-7xl mx-auto">
      <Skeleton width={250} height={40} baseColor="#F5F5F5" highlightColor="#FED7AA" className="mb-6" />
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-200">
        <Skeleton count={5} height={60} baseColor="#F5F5F5" highlightColor="#FED7AA" className="mb-2" />
      </div>
    </div>
  </div>
);

const RefundModal = ({
  isOpen,
  onClose,
  onConfirm,
  bookingDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundPercentage: number) => void;
  bookingDate: string;
}) => {
  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(bookingDate.split("-").reverse().join("-"));
  eventDate.setHours(0, 0, 0, 0);
  const daysDifference = Math.ceil(
    (eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );

  let refundPercentage = 0;
  if (daysDifference >= 8) refundPercentage = 75;
  else if (daysDifference >= 4) refundPercentage = 50;
  else if (daysDifference >= 0) refundPercentage = 0;

  const isRefundable = today <= eventDate;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg max-w-md w-full shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Refund Confirmation</h3>
        <p className="mb-4 text-gray-600">Do you really want to request a refund?</p>
        <div className="mb-4 text-sm text-gray-600">
          <p className="font-medium">Updated Refund Policy:</p>
          <ul className="list-disc pl-4">
            <li>75% refund if cancelled 8+ days before selected date</li>
            <li>50% refund if cancelled 4-7 days before selected date</li>
            <li>0% refund if cancelled less than 4 days before or on selected date</li>
            <li>No refund after the selected date</li>
            <li>No show, No Refund</li>
            <li>Tickets cannot be transferred to another date or person</li>
            <li>If we cancel, only Trek Amount refunded</li>
          </ul>
        </div>
        {isRefundable ? (
          refundPercentage > 0 ? (
            <p className="mb-4 text-orange-600">
              Eligible for {refundPercentage}% refund within 5-7 working days
            </p>
          ) : (
            <p className="mb-4 text-gray-600">
              Eligible for 0% refund (less than 4 days remaining)
            </p>
          )
        ) : (
          <p className="mb-4 text-red-500">
            Cannot request refund after the selected date
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 hover:bg-gray-200 transition-all duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isRefundable
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            onClick={() => isRefundable && onConfirm(refundPercentage)}
            disabled={!isRefundable}
          >
            Confirm Refund
          </button>
        </div>
      </div>
    </div>
  );
};

const Booked = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const { data, isError, isLoading } = useGetuserAllbookingQuery({});
  const navigate = useNavigate();
  const [sendRequest] = useRequestCancelBookingMutation();
  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;

  useEffect(() => {
    if (data?.bookings) {
      setBookings(data.bookings);
    }
  }, [data]);

  const handleRefundRequest = (bookingId: string) => {
    setSelectedBooking(bookingId);
  };

  const handleRefundConfirm = async (refundPercentage: number) => {
    if (!selectedBooking) {
      toast.error("No booking selected for refund");
      return;
    }
    try {
      const response = await sendRequest({
        bookingId: selectedBooking,
      }).unwrap();
      setSelectedBooking(null);
      toast.success(`Successfully processed refund`);
      return response;
    } catch (error) {
      toast.error("Unable to process refund");
      console.error("Refund processing failed:", error);
      throw error;
    }
  };

  const isRefundableDate = (bookingDate: string) => {
    const eventDate = new Date(bookingDate.split("-").reverse().join("-"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return today <= eventDate;
  };

  const canWriteReview = (bookingDate: string, status?: string) => {
    const eventDate = new Date(bookingDate.split("-").reverse().join("-"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return status !== "processing" && status !== "resolved";
  };

  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 px-6 flex justify-center items-center">
        <div className="text-2xl font-semibold text-gray-800">
          Error loading bookings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold text-gray-800 mb-6">Booked Trips</h2>

        {bookings.length > 0 ? (
          <>
            {/* Desktop View: Traditional Table */}
            <div className="hidden md:block overflow-x-auto">
              <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-gray-200">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-orange-50 border-b">
                      {[
                        "Trip Title",
                        "Location",
                        "Price",
                        "User Email",
                        "User Phone",
                        "Selected Date",
                        "Passengers",
                        "Details/Status",
                        "Refund",
                        "Review",
                      ].map((header) => (
                        <TableHead
                          key={header}
                          className="px-4 py-3 text-left text-sm font-semibold text-gray-800"
                        >
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const bookingDate = booking.selectedDate
                        ? new Date(booking.selectedDate)
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                            .split("/")
                            .join("-")
                        : "N/A";
                      const isToday = bookingDate === todayFormatted;
                      const canRequestRefund = isRefundableDate(bookingDate);
                      const reviewEligible = canWriteReview(
                        bookingDate,
                        booking.status
                      );

                      return (
                        <TableRow
                          key={booking._id}
                          className="border-b hover:bg-orange-50 transition-all duration-200"
                        >
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking?.trip?.title || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking?.trip?.location || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking?.price || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking?.user?.email || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking?.user?.phone || "N/A"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking.selectedDate}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking.passengers?.length > 0
                              ? booking.passengers.map((passenger, index) => (
                                  <PassengerDetails
                                    key={index}
                                    passenger={passenger}
                                  />
                                ))
                              : "No passengers"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex flex-col items-start gap-2">
                              {!isToday && (
                                <button
                                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                                  onClick={() => navigate(`/booked/${booking._id}`)}
                                >
                                  View Details
                                </button>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isToday
                                    ? "bg-orange-100 text-orange-800"
                                    : booking.status === "resolved"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-orange-200 text-orange-800"
                                }`}
                              >
                                {isToday
                                  ? "Ongoing"
                                  : booking.status === "processing"
                                  ? "Processing"
                                  : booking.status === "resolved"
                                  ? "Resolved"
                                  : "Confirmed"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {booking.status !== "processing" &&
                              booking.status !== "resolved" &&
                              canRequestRefund && (
                                <button
                                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                                  onClick={() => handleRefundRequest(booking._id)}
                                >
                                  Request Refund
                                </button>
                              )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {!booking.isReview && booking?.isReviewActivate && (
                              <button
                                className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                                onClick={() => navigate(`/review/${booking._id}`)}
                              >
                                Write Review
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile/Tablet View: Card Layout */}
            <div className="block md:hidden space-y-4">
              {bookings.map((booking) => {
                const bookingDate = booking.selectedDate
                  ? new Date(booking.selectedDate)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      .split("/")
                      .join("-")
                  : "N/A";
                const isToday = bookingDate === todayFormatted;
                const canRequestRefund = isRefundableDate(bookingDate);
                const reviewEligible = canWriteReview(
                  bookingDate,
                  booking.status
                );

                return (
                  <div
                    key={booking._id}
                    className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div>
                        <strong className="text-gray-800">Trip Title:</strong>{" "}
                        {booking?.trip?.title || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-800">Location:</strong>{" "}
                        {booking?.trip?.location || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-800">Price:</strong>{" "}
                        {booking?.price || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-800">User Email:</strong>{" "}
                        {booking?.user?.email || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-800">User Phone:</strong>{" "}
                        {booking?.user?.phone || "N/A"}
                      </div>
                      <div>
                        <strong className="text-gray-800">Selected Date:</strong>{" "}
                        {booking.selectedDate}
                      </div>
                      <div>
                        <strong className="text-gray-800">Passengers:</strong>
                        {booking.passengers?.length > 0
                          ? booking.passengers.map((passenger, index) => (
                              <PassengerDetails
                                key={index}
                                passenger={passenger}
                              />
                            ))
                          : "No passengers"}
                      </div>
                      <div className="flex flex-col gap-2">
                        {!isToday && (
                          <button
                            className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                            onClick={() => navigate(`/booked/${booking._id}`)}
                          >
                            View Details
                          </button>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded w-fit ${
                            isToday
                              ? "bg-orange-100 text-orange-800"
                              : booking.status === "resolved"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-orange-200 text-orange-800"
                          }`}
                        >
                          {isToday
                            ? "Ongoing"
                            : booking.status === "processing"
                            ? "Processing"
                            : booking.status === "resolved"
                            ? "Resolved"
                            : "Confirmed"}
                        </span>
                        {booking.status !== "processing" &&
                          booking.status !== "resolved" &&
                          canRequestRefund && (
                            <button
                              className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                              onClick={() => handleRefundRequest(booking._id)}
                            >
                              Request Refund
                            </button>
                          )}
                        {!booking.isReview && booking?.isReviewActivate && (
                          <button
                            className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                            onClick={() => navigate(`/review/${booking._id}`)}
                          >
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-md border border-gray-200 text-gray-600 text-center">
              <p className="font-medium">No bookings found</p>
            </div>
          </div>
        )}

        {selectedBooking && (
          <RefundModal
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onConfirm={handleRefundConfirm}
            bookingDate={
              bookings.find((b) => b._id === selectedBooking)?.selectedDate || ""
            }
          />
        )}

        <style jsx>{`
          h2, div, span, button, strong {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Booked;
