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
  const { data, isError, isLoading, error } = useGetTripBookingStatsQuery({
    trip: trip._id,
  });
  const navigate = useNavigate();
  
  // Handle empty or missing data and set default values
  const stats = data?.stats ?? {
    uniqueUsers: 0,
    totalBookings: 0,
    totalPassengers: 0,
    totalSeatsBooked: 0,
    dailyStats: {},
  };

  console.log("error", error);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }



  // Sort dates for the table
  const sortedDates = Object.keys(stats.dailyStats).sort();

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
            <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Passengers</p>
            <p className="text-2xl font-bold">{stats.totalPassengers}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Seats Booked</p>
            <p className="text-2xl font-bold">{stats.totalSeatsBooked}</p>
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
              {sortedDates.length > 0 ? (
                sortedDates.map((date) => (
                  <TableRow key={date}>
                    <TableCell className="font-medium w-1/5">
                      {stats.dailyStats[date].date}
                    </TableCell>
                    <TableCell className="text-right w-1/5">
                      {stats.dailyStats[date].totalBookings || 0}
                    </TableCell>
                    <TableCell className="text-right w-1/5">
                      {stats.dailyStats[date].totalPassengers || 0}
                    </TableCell>
                    <TableCell className="text-right w-1/5">
                      {stats.dailyStats[date].totalSeatsBooked || 0}
                    </TableCell>
                    <TableCell className="text-center w-1/5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBookings(stats.dailyStats[date].date)}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <FaEye className="text-gray-600" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No daily booking data available.
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell className="w-1/5">Total</TableCell>
                <TableCell className="text-right w-1/5">
                  {stats.totalBookings}
                </TableCell>
                <TableCell className="text-right w-1/5">
                  {stats.totalPassengers}
                </TableCell>
                <TableCell className="text-right w-1/5">
                  {stats.totalSeatsBooked}
                </TableCell>
                <TableCell className="w-1/5"></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Message */}
      <div className="mt-4 text-gray-600">
        <p>{data?.message || "No additional information available."}</p>
      </div>
    </div>
  );
};

export default Booked;
