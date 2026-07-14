import {
  useGetTripBookingStatsQuery,
  useLazyGetTripBookingHistoryQuery,
} from "@/store/api/booking";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaSpinner, FaEye, FaFileExcel } from "react-icons/fa";
import "react-loading-skeleton/dist/skeleton.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { exportTripBookingsToExcel } from "@/utils/exportTripBookingsExcel";

const Booked = () => {
  const { state } = useLocation();
  const { trip } = state;
  const { data, isLoading, error } = useGetTripBookingStatsQuery({
    trip: trip._id,
  });
  const navigate = useNavigate();
  const [exportingDate, setExportingDate] = useState<string | null>(null);
  const [fetchBookingHistory] = useLazyGetTripBookingHistoryQuery();

  // Handle empty or missing data and set default values
  const stats = data?.stats ?? {
    uniqueUsers: 0,
    totalBookings: 0,
    totalPassengers: 0,
    totalSeatsBooked: 0,
    dailyStats: {},
  };

  const tripDisplayName =
    trip?.title || trip?.name || trip?.location || "Trip Details";

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
        tripName: tripDisplayName,
      },
    });
  };

  const handleExportExcel = async (date: string) => {
    if (!trip?._id || !date) {
      toast.error("Missing trip or date for export");
      return;
    }

    // Resolve day entry (keys may be date strings)
    const dayEntry =
      stats.dailyStats[date] ||
      Object.values(stats.dailyStats).find((d: any) => d?.date === date);

    if (!dayEntry || (dayEntry.totalBookings ?? 0) === 0) {
      toast.info("No bookings available for this date to export");
      return;
    }

    setExportingDate(date);
    try {
      const result = await fetchBookingHistory({
        trip: trip._id,
        date,
      }).unwrap();

      const passengerHistory = result?.passengerHistory ?? [];
      if (!passengerHistory.length) {
        toast.info("No passenger records found for this date");
        return;
      }

      exportTripBookingsToExcel({
        passengerHistory,
        tripName: tripDisplayName,
        selectedDate: result?.selectedDate || date,
      });
      toast.success("Excel downloaded successfully");
    } catch (err: any) {
      console.error("Excel export failed:", err);
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to export bookings. Please try again."
      );
    } finally {
      setExportingDate(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Trip Booking Statistics</h1>

      {/* Summary Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
   
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
          <Table className="w-full min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Passengers</TableHead>
                <TableHead className="text-right">Seats Booked</TableHead>
                <TableHead className="text-center min-w-[200px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDates.length > 0 ? (
                sortedDates.map((date) => {
                  const day = stats.dailyStats[date];
                  const travelDate = day.date;
                  const isExporting = exportingDate === travelDate;
                  return (
                    <TableRow key={date}>
                      <TableCell className="font-medium">
                        {travelDate}
                      </TableCell>
                      <TableCell className="text-right">
                        {day.totalBookings || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {day.totalPassengers || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {day.totalSeatsBooked || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBookings(travelDate)}
                            className="flex items-center gap-1"
                          >
                            <FaEye className="text-gray-600" />
                            <span>View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportExcel(travelDate)}
                            disabled={
                              isExporting || (day.totalBookings ?? 0) === 0
                            }
                            className="flex items-center gap-1 text-green-700 border-green-200 hover:bg-green-50"
                            title="Download Excel for this date"
                          >
                            {isExporting ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaFileExcel className="text-green-600" />
                            )}
                            <span>Excel</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No daily booking data available.
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {stats.totalBookings}
                </TableCell>
                <TableCell className="text-right">
                  {stats.totalPassengers}
                </TableCell>
                <TableCell className="text-right">
                  {stats.totalSeatsBooked}
                </TableCell>
                <TableCell />
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
