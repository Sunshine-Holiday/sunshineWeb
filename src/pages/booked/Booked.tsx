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
import { FaSpinner } from "react-icons/fa";
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
}

const PassengerDetails = ({ passenger }: { passenger: Passenger }) => (
  <div className="text-sm text-gray-700 mb-2">
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
  <div className="flex justify-center items-center min-h-screen">
    <FaSpinner className="animate-spin text-4xl text-gray-500" />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Refund Confirmation</h3>
        <p className="mb-4">Do you really want to request a refund?</p>
        <div className="mb-4 text-sm text-gray-600">
          <p>Updated Refund Policy:</p>
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
            <p className="mb-4 text-green-600">
              Eligible for {refundPercentage}% refund within 5-7 working days
            </p>
          ) : (
            <p className="mb-4 text-yellow-600">
              Eligible for 0% refund (less than 4 days remaining)
            </p>
          )
        ) : (
          <p className="mb-4 text-red-600">
            Cannot request refund after the selected date
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded ${
              isRefundable
                ? "bg-red-500 text-white hover:bg-red-600"
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

  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 flex justify-center items-center">
        <div className="text-red-500">
          Error loading bookings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <h2 className="text-2xl font-semibold mb-4">Booked Trips</h2>

      {bookings.length > 0 ? (
        <>
          {/* Desktop View: Traditional Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-full table-auto border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100 border-b">
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
                  ].map((header) => (
                    <TableHead
                      key={header}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap"
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

                  return (
                    <TableRow
                      key={booking._id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                    >
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking?.trip?.title || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking?.trip?.location || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking?.price || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking?.user?.email || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking?.user?.phone || "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking.selectedDate}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking.passengers?.length > 0
                          ? booking.passengers.map((passenger, index) => (
                              <PassengerDetails
                                key={index}
                                passenger={passenger}
                              />
                            ))
                          : "No passengers"}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex flex-col items-start gap-1">
                          {!isToday && (
                            <button
                              className="text-blue-500 hover:underline"
                              onClick={() => navigate(`/booked/${booking._id}`)}
                            >
                              View Details
                            </button>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isToday
                                ? "bg-blue-100 text-blue-800"
                                : booking.status === "resolved"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
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
                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                        {booking.status !== "processing" &&
                          booking.status !== "resolved" &&
                          canRequestRefund && (
                            <button
                              className="text-red-500 hover:underline"
                              onClick={() => handleRefundRequest(booking._id)}
                            >
                              Request Refund
                            </button>
                          )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

              return (
                <div
                  key={booking._id}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <div className="space-y-2">
                    <div>
                      <strong className="text-gray-700">Trip Title:</strong>{" "}
                      {booking?.trip?.title || "N/A"}
                    </div>
                    <div>
                      <strong className="text-gray-700">Location:</strong>{" "}
                      {booking?.trip?.location || "N/A"}
                    </div>
                    <div>
                      <strong className="text-gray-700">Price:</strong>{" "}
                      {booking?.price || "N/A"}
                    </div>
                    <div>
                      <strong className="text-gray-700">User Email:</strong>{" "}
                      {booking?.user?.email || "N/A"}
                    </div>
                    <div>
                      <strong className="text-gray-700">User Phone:</strong>{" "}
                      {booking?.user?.phone || "N/A"}
                    </div>
                    <div>
                      <strong className="text-gray-700">Selected Date:</strong>{" "}
                      {booking.selectedDate}
                    </div>
                    <div>
                      <strong className="text-gray-700">Passengers:</strong>
                      {booking.passengers?.length > 0 ? (
                        booking.passengers.map((passenger, index) => (
                          <PassengerDetails key={index} passenger={passenger} />
                        ))
                      ) : (
                        "No passengers"
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!isToday && (
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => navigate(`/booked/${booking._id}`)}
                        >
                          View Details
                        </button>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded w-fit ${
                          isToday
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "resolved"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
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
                            className="text-red-500 hover:underline"
                            onClick={() => handleRefundRequest(booking._id)}
                          >
                            Request Refund
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
        <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-500">
          <p>No bookings found</p>
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
    </div>
  );
};

export default Booked;