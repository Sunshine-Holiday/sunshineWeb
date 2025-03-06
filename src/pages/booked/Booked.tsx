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
import { FaSpinner } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";

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
  passengers: Passenger[];
}

// Component for displaying passenger details
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

// Loading state component
export const LoadingState = () => (
  <div className="flex justify-center items-center min-h-screen">
    <FaSpinner className="animate-spin text-4xl text-gray-500" />
  </div>
);

const Booked = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { data, isError, isLoading } = useGetuserAllbookingQuery({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.bookings) {
      setBookings(data.bookings);
      console.log(JSON.stringify(data.bookings, null, 2));
    }
  }, [data]);

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
        <div className="overflow-x-auto">
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
                  "View Details",
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
              {bookings.map((booking) => (
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
                    {booking.selectedDate 
                      ? new Date(booking.selectedDate).toLocaleDateString() 
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm text-gray-700">
                    {booking.passengers?.length > 0 ? (
                      booking.passengers.map((passenger, index) => (
                        <PassengerDetails key={index} passenger={passenger} />
                      ))
                    ) : (
                      "No passengers"
                    )}
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
        </div>
      ) : (
        <div className="flex justify-center items-center h-[calc(100vh-8rem)] text-gray-500">
          <p>No bookings found</p>
        </div>
      )}
    </div>
  );
};

export default Booked;