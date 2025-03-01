import { useGetTripBookingHistoryQuery } from '@/store/api/booking';
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { FaSpinner } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const BookingDetails = () => {
  const { state } = useLocation();
  const { date, tripId, tripName } = state || {};
  console.log(date)
  const { data, isLoading, isError } = useGetTripBookingHistoryQuery({
    trip: tripId,
    date: date
  });
  
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
        <p className="text-red-500">Error loading booking details.</p>
      </div>
    );
  }
  
  const { purchaseHistory, selectedDate, tripDetails, message } = data;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tripName || "Trip Details"}</h1>
          <p className="text-gray-500">Bookings for {selectedDate}</p>
        </div>
        <Badge variant="outline" className="mt-2 md:mt-0 px-4 py-2">
          Total Bookings: {purchaseHistory.length}
        </Badge>
      </div>
      
      {purchaseHistory.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No bookings found for this date.</p>
        </Card>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 overflow-x-auto">
          <Table className="w-full min-w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Booking ID</TableHead>
                <TableHead className="w-1/5">User Email</TableHead>
                <TableHead className="w-1/5 text-center">Passengers</TableHead>
                <TableHead className="w-1/5 text-center">Selected Seats</TableHead>
                <TableHead className="w-1/5 text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.map((booking:any) => (
                <TableRow key={booking.bookingId}>
                  <TableCell className="font-medium w-1/5 truncate" title={booking.bookingId}>
                    {booking.bookingId.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="w-1/5 truncate" title={booking.user.email}>
                    {booking.user.email}
                  </TableCell>
                  <TableCell className="text-center w-1/5">
                    {booking.totalPassengers}
                  </TableCell>
                  <TableCell className="text-center w-1/5">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {booking.selectedSeats.map((seat:any) => (
                        <Badge key={seat} variant="secondary" className="text-xs">
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-1/5">
                    ₹{booking.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="mt-4 text-gray-600">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default BookingDetails;