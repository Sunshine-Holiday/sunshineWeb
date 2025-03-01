import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetTripBookingHistoryQuery } from '@/store/api/booking';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeatLayout } from '@/pages/booking/components/SeatLayout';

const BookingDetails = () => {
  const { state } = useLocation();
  const { date, tripId, tripName } = state || {};
  const [activeTab, setActiveTab] = useState("table");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const { data, isLoading, isError } = useGetTripBookingHistoryQuery({
    trip: tripId,
    date: date
  });
  
  // Extract all booked seats from purchase history
  const bookedSeats = data?.purchaseHistory.flatMap(
    (booking: any) => booking.selectedSeats
  ) || [];

  // Handle seat selection (view only)
  const handleSeatSelect = (id: string) => {
    // In view-only mode, we don't actually select seats
    console.log(`Seat ${id} clicked in view-only mode`);
  };

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
  const seatPrice = tripDetails?.price || 0;
  const totalSeats = tripDetails?.totalSeats || 31; // Default to 31 if not specified
  
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
      
      <Tabs defaultValue="table" className="w-full mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" onClick={() => setActiveTab("table")}>Booking List</TabsTrigger>
          <TabsTrigger value="seats" onClick={() => setActiveTab("seats")}>Seat Map</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
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
                  {purchaseHistory.map((booking: any) => (
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
                          {booking.selectedSeats.map((seat: any) => (
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
        </TabsContent>
        
        <TabsContent value="seats">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Seat Availability</h3>
              <p className="text-sm text-gray-600 mb-4">
                View all booked seats for this trip on {selectedDate}. 
                Total seats: {totalSeats}, Booked seats: {bookedSeats.length}
              </p>
            </div>
            
            <SeatLayout
              selectedSeats={[]} // No seats selected in view mode
              onSeatSelect={handleSeatSelect}
              bookedSeats={bookedSeats}
              seatPrice={seatPrice}
              totalSeats={totalSeats}
            />
            
            {purchaseHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Seat Allocation Details:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {purchaseHistory.map((booking: any) => (
                    <div key={booking.bookingId} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium truncate" title={booking.user.email}>
                        {booking.user.email.split('@')[0]}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.selectedSeats.map((seat: any) => (
                          <Badge key={seat} variant="secondary" className="text-xs">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-gray-600">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default BookingDetails;