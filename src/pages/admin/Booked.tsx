import { useGetbookingQuery } from "@/store/api/booking";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { FaSpinner } from "react-icons/fa"; // Importing React Icon for loading spinner
import Skeleton from "react-loading-skeleton"; // Importing Skeleton for loading state
import "react-loading-skeleton/dist/skeleton.css"; // Skeleton CSS

const Booked = () => {
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState<any>([]);
  const { data, isError, isLoading } = useGetbookingQuery({ filter });

  useEffect(() => {
    if (!isLoading) {
      if (data && data.bookings) {
        setBookings(data.bookings);
        console.log(data.message);
        console.log(JSON.stringify(data.bookings, null, 2));
        console.log(data.bookings);
      } else if (data.bookings.length === 0) {
        setBookings([]);
      }
    }
  }, [data, isLoading]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Booked Trips</h2>

      {/* Filter Dropdown */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="next">Next</option>
        </select>
      </div>

      {/* Only render the table if there are bookings */}
      {bookings && bookings.length > 0 ? (
        <Table className="min-w-full table-auto border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b">
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Trip Title
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Location
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Price
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                User Email
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                User Phone
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Selected Date
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Selected Seats
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Passengers
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id} className="border-b hover:bg-gray-50">
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
                    <div key={index} className="text-sm text-gray-700">
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
                        <strong>ID Proof:</strong> {passenger.idProof} (
                        {passenger.idProofNumber})
                      </div>
                    </div>
                  ))}
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
