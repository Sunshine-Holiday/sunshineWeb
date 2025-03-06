import {
  useGetbookingQuery,
  useGetTripBookingStatsQuery,
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
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Booked = () => {
  const { state } = useLocation();
  const { trip } = state;
  const [bookings, setBookings] = useState<any>([]);
  const { data, isError, isLoading } = useGetTripBookingStatsQuery({
    trip: trip._id,
  });
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error loading booking statistics.</p>
      </div>
    );
  }

  // Sort dates for the table
  const sortedDates = Object.keys(data.stats.dailyStats).sort();

  // Function to handle viewing detailed bookings for a specific date
  const handleViewBookings = (date: string) => {
    navigate("/admin/booking-details", {
      state: {
        date: date,
        tripId: trip._id,
        tripName: trip.name || "Trip Details",
      },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Trip Booking Statistics</h1>

      {/* Summary Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Unique Users</p>
            <p className="text-2xl font-bold">{data.stats.uniqueUsers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold">{data.stats.totalBookings}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Passengers</p>
            <p className="text-2xl font-bold">{data.stats.totalPassengers}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Seats Booked</p>
            <p className="text-2xl font-bold">{data.stats.totalSeatsBooked}</p>
          </div>
        </div>
      </div>

      {/* Daily Stats Table */}
      <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Daily Statistics</h2>
        <div className="w-full min-w-full">
          <Table className="w-full min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Date</TableHead>
                <TableHead className="w-1/5 text-right">Bookings</TableHead>
                <TableHead className="w-1/5 text-right">Passengers</TableHead>
                <TableHead className="w-1/5 text-right">Seats Booked</TableHead>
                <TableHead className="w-1/5 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDates.map((date) => (
                <TableRow key={date}>
                  <TableCell className="font-medium w-1/5">
                    {data.stats.dailyStats[date].date}
                  </TableCell>
                  <TableCell className="text-right w-1/5">
                    {data.stats.dailyStats[date].totalBookings}
                  </TableCell>
                  <TableCell className="text-right w-1/5">
                    {data.stats.dailyStats[date].totalPassengers}
                  </TableCell>
                  <TableCell className="text-right w-1/5">
                    {data.stats.dailyStats[date].totalSeatsBooked}
                  </TableCell>
                  <TableCell className="text-center w-1/5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBookings(data.stats.dailyStats[date].date)}
                      className="flex items-center gap-1 mx-auto"
                    >
                      <FaEye className="text-gray-600" />
                      <span>View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell className="w-1/5">Total</TableCell>
                <TableCell className="text-right w-1/5">
                  {data.stats.totalBookings}
                </TableCell>
                <TableCell className="text-right w-1/5">
                  {data.stats.totalPassengers}
                </TableCell>
                <TableCell className="text-right w-1/5">
                  {data.stats.totalSeatsBooked}
                </TableCell>
                <TableCell className="w-1/5"></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Message */}
      <div className="mt-4 text-gray-600">
        <p>{data.message}</p>
      </div>
    </div>
  );
};

export default Booked;
