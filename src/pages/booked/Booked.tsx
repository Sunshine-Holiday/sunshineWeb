import { useGetuserAllbookingQuery } from "@/store/api/booking";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { FaSpinner } from "react-icons/fa"; // Loading spinner icon
import "react-loading-skeleton/dist/skeleton.css"; // Skeleton CSS
import { useNavigate } from "react-router-dom";

// Component for displaying a passenger's details
const PassengerDetails = ({ passenger }) => (
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
      <strong>Address:</strong> {passenger.address}
    </div>
    <div>
      <strong>ID Proof:</strong> {passenger.idProof} ({passenger.idProofNumber})
    </div>
  </div>
);

// Component for loading state
export const LoadingState = () => (
  <div className="flex justify-center items-center min-h-screen">
    <FaSpinner className="animate-spin text-4xl text-gray-500" />
  </div>
);

const Booked = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const { data, isError, isLoading } = useGetuserAllbookingQuery({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data && data.bookings) {
      setBookings(data.bookings);
      console.log(data.message, JSON.stringify(data.bookings, null, 2));
    }
  }, [data]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <h2 className="text-2xl font-semibold mb-4">Booked Trips</h2>

      {bookings.length > 0 ? (
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
                "Selected Seats",
                "Passengers",
                "View Details",
              ].map((header) => (
                <TableHead
                  key={header}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow
                key={booking._id}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.trip.title}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.trip.location}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.price}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.user.email}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.user.phone}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {new Date(booking.selectedDate).toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.selectedSeats.join(", ")}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  {booking.passengers.map((passenger, index) => (
                    <PassengerDetails key={index} passenger={passenger} />
                  ))}
                </TableCell>
                <TableCell className="px-4 py-2 text-sm text-gray-700">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => navigate(`/booked/${booking._id}`)}
                  >
                    View Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex justify-center items-center min-h-screen text-gray-500">
          <p>No bookings found</p>
        </div>
      )}
    </div>
  );
};

export default Booked;
