import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  useGetTripBookingHistoryQuery, 
  useUpdateTripMutation,
  useDeleteBookingMutation 
} from '@/store/api/booking';

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'react-toastify';

const BookingDetails = () => {
  const { state } = useLocation();
  const { date, tripId, tripName } = state || {};
  console.log("BookingDetails state:", state);
  const [activeTab, setActiveTab] = useState("table");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [newSeatNumber, setNewSeatNumber] = useState<string>("");
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data, isLoading, isError ,error} = useGetTripBookingHistoryQuery({
    trip: tripId,
    date: date
  });
  console.log("BookingDetails data:", error);
  const [updateTrip] = useUpdateTripMutation();
  const [deleteBooking] = useDeleteBookingMutation();
  
  const bookedSeats = data?.purchaseHistory.flatMap(
    (booking: any) => booking.selectedSeats
  ) || [];

  const handleSeatSelect = (id: string) => {
    console.log(`Seat ${id} clicked in view-only mode`);
  };

  const handleEditClick = (bookingId: string, seat: string) => {
    setEditingBooking(`${bookingId}-${seat}`);
    setNewSeatNumber(seat);
  };

  const handleSubmitEdit = async (bookingSeatId: string) => {
    const [bookingId, originalSeat] = bookingSeatId.split('-');
    try {
      await updateTrip({
        bookingId,
        oldSeat: originalSeat,
        newSeat: newSeatNumber
      }).unwrap();

      toast.success(`Seat updated from ${originalSeat} to ${newSeatNumber}`);
      setEditingBooking(null);
      setNewSeatNumber("");
    } catch (error) {
      toast.error('Failed to update seat. Please try again.');
      console.error('Error updating seat:', error);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;

    try {
      await deleteBooking({deleteBookingId}).unwrap();
      toast.success('Booking deleted successfully');
      setDeleteBookingId(null);
    } catch (error) {
      toast.error('Failed to delete booking. Please try again.');
      console.error('Error deleting booking:', error);
    }
  };

  const openDeleteDialog = (bookingId: string) => {
    setDeleteBookingId(bookingId);
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
  const totalSeats = tripDetails?.totalSeats || 31;
  
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
                    <TableHead className="w-1/6">Booking ID</TableHead>
                    <TableHead className="w-1/6">User Email</TableHead>
                    <TableHead className="w-1/6 text-center">Passengers</TableHead>
                    <TableHead className="w-1/6 text-center">Selected Seats</TableHead>
                    <TableHead className="w-1/6 text-right">Price</TableHead>
                    <TableHead className="w-1/6 text-center">Actions</TableHead>
                    <TableHead className="w-1/6 text-center">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseHistory.map((booking: any) => (
                    <TableRow key={booking.bookingId}>
                      <TableCell className="font-medium w-1/6 truncate" title={booking.bookingId}>
                        {booking.bookingId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="w-1/6 truncate" title={booking.user.email}>
                        {booking.user.email}
                      </TableCell>
                      <TableCell className="text-center w-1/6">
                        {booking.totalPassengers}
                      </TableCell>
                      <TableCell className="text-center w-1/6">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {booking.selectedSeats.map((seat: any) => (
                            <Badge key={seat} variant="secondary" className="text-xs">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-1/6">
                        ₹{booking.price}
                      </TableCell>
                      <TableCell className="text-center w-1/6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => openDeleteDialog(booking.bookingId)}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the booking
                                for {booking.user.email} with ID {booking.bookingId.substring(0, 8)}...
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteBookingId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteBooking}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                      <TableCell className="text-center w-1/6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle invoice generation or viewing here
                            navigate(`/booked/${booking.bookingId}`, {
                              state: { id: booking.bookingId }
                            });
                          }}
                        >
                          Invoice
                        </Button>
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
              selectedSeats={[]}
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
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate" title={booking.user.email}>
                          {booking.user.email.split('@')[0]}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => openDeleteDialog(booking.bookingId)}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the booking
                                for {booking.user.email} with ID {booking.bookingId.substring(0, 8)}...
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteBookingId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteBooking}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 items-center">
                        {booking.selectedSeats.map((seat: any, index: number) => (
                          <div key={`${booking.bookingId}-${seat}-${index}`} className="flex items-center gap-2">
                            {editingBooking === `${booking.bookingId}-${seat}` ? (
                              <div className="flex gap-2">
                                <Input
                                  value={newSeatNumber}
                                  onChange={(e) => setNewSeatNumber(e.target.value)}
                                  className="w-20"
                                  placeholder="New seat"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitEdit(`${booking.bookingId}-${seat}`)}
                                >
                                  Submit
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Badge variant="secondary" className="text-xs">
                                  {seat}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(booking.bookingId, seat)}
                                >
                                  Edit
                                </Button>
                              </>
                            )}
                          </div>
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