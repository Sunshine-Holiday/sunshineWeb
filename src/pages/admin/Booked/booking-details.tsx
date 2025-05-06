import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  useGetTripBookingHistoryQuery, 
  useUpdateTripMutation,
  useDeleteBookingMutation,
  useGetTripReviewsQuery,
  useUpdateBookingMutation,
  useUpdateReviewMutation
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
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newSeatNumber, setNewSeatNumber] = useState("");
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const navigate = useNavigate();

  // Queries
  const { data: bookingData, isLoading: isBookingLoading, isError: isBookingError, error: bookingError } = useGetTripBookingHistoryQuery({
    trip: tripId,
    date: date
  });
  const { data: reviewData, isLoading: isReviewLoading, isError: isReviewError,error } = useGetTripReviewsQuery({ tripId: tripId });
console.log("BookingDetails bookingData:", error);
  // Mutations
  const [updateTrip] = useUpdateTripMutation();
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [updateReview] = useUpdateReviewMutation();

  const bookedSeats = bookingData?.purchaseHistory.flatMap(
    (booking) => booking.selectedSeats
  ) || [];

  const handleSeatSelect = (id) => {
    console.log(`Seat ${id} clicked in view-only mode`);
  };

  const handleEditClick = (bookingId, seat) => {
    setEditingBooking(`${bookingId}-${seat}`);
    setNewSeatNumber(seat);
  };

  const handleSubmitEdit = async (bookingSeatId) => {
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
      await deleteBooking({ deleteBookingId }).unwrap();
      toast.success('Booking deleted successfully');
      setDeleteBookingId(null);
    } catch (error) {
      toast.error('Failed to delete booking. Please try again.');
      console.error('Error deleting booking:', error);
    }
  };

  const openDeleteDialog = (bookingId) => {
    setDeleteBookingId(bookingId);
  };

  const handleToggleReviewActivate = async (bookingId, currentStatus) => {
    try {
      await updateBooking({
        bookingId,
        isReviewActivate: !currentStatus
      }).unwrap();
      toast.success(`Review activation ${!currentStatus ? 'enabled' : 'disabled'} for booking ${bookingId.substring(0, 8)}...`);
      console.log(`Review activation ${!currentStatus ? 'enabled' : 'disabled'} for booking ${bookingId}`);
    } catch (error) {
      toast.error('Failed to update review activation status.');
      console.error('Error updating review activation:', error);
    }
  };

  const handleReviewStatusUpdate = async (reviewId, status) => {
    try {
      await updateReview({
        reviewId,
        status
      }).unwrap();
      toast.success(`Review ${status === 'admin_approved' ? 'approved' : 'disapproved'} successfully`);
    } catch (error) {
      toast.error('Failed to update review status.');
      console.error('Error updating review status:', error);
    }
  };

  if (isBookingLoading || isReviewLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (isBookingError || !bookingData || isReviewError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error loading booking or review details.</p>
      </div>
    );
  }

  const { purchaseHistory, selectedDate, tripDetails, message } = bookingData;
  const seatPrice = tripDetails?.price || 0;
  const totalSeats = tripDetails?.totalSeats || 31;
  const reviews = reviewData?.reviews || [];

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
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="table" onClick={() => setActiveTab("table")}>Booking List</TabsTrigger>
          <TabsTrigger value="seats" onClick={() => setActiveTab("seats")}>Seat Map</TabsTrigger>
          <TabsTrigger value="reviews" onClick={() => setActiveTab("reviews")}>Reviews</TabsTrigger>
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
                    <TableHead className="w-1/7">Booking ID</TableHead>
                    <TableHead className="w-1/7">User Email</TableHead>
                    <TableHead className="w-1/7 text-center">Passengers</TableHead>
                    <TableHead className="w-1/7 text-center">Selected Seats</TableHead>
                    <TableHead className="w-1/7 text-right">Price</TableHead>
                    <TableHead className="w-1/7 text-center">Review Activation</TableHead>
                    <TableHead className="w-1/7 text-center">Actions</TableHead>
                    <TableHead className="w-1/7 text-center">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseHistory.map((booking) => (
                    <TableRow key={booking.bookingId}>
                      <TableCell className="font-medium w-1/7 truncate" title={booking.bookingId}>
                        {booking.bookingId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="w-1/7 truncate" title={booking.user.email}>
                        {booking.user.email}
                      </TableCell>
                      <TableCell className="text-center w-1/7">
                        {booking.totalPassengers}
                      </TableCell>
                      <TableCell className="text-center w-1/7">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {booking.selectedSeats.map((seat) => (
                            <Badge key={seat} variant="secondary" className="text-xs">
                              {seat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-1/7">
                        ₹{booking.price}
                      </TableCell>
                      <TableCell className="text-center w-1/7">
                        <Button
                          variant={booking.isReviewActivate ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleReviewActivate(booking.bookingId, booking.isReviewActivate)}
                        >
                          {booking.isReviewActivate ? "Deactivate Review" : "Activate Review"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center w-1/7">
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
                      <TableCell className="text-center w-1/7">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
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
                  {purchaseHistory.map((booking) => (
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
                        {booking.selectedSeats.map((seat, index) => (
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

        <TabsContent value="reviews">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Trip Reviews</h3>
            <p className='text-red-700'>coming soon Feature</p>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews found for this trip.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">{review.user.email}</p>
                        <p className="text-sm text-gray-600">
                          Travel Date: {new Date(review.travelDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Booking Date: {new Date(review.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          review.status === 'admin_approved' ? 'default' :
                          review.status === 'admin_rejected' ? 'destructive' :
                          review.status === 'pending' ? 'outline' : 'secondary'
                        }
                      >
                        {review.status.replace('admin_', '').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{review.description}</p>
                    <div className="flex gap-2">
                      {review.status !== 'admin_approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleReviewStatusUpdate(review._id, 'admin_approved')}
                        >
                          Approve
                        </Button>
                      )}
                      {review.status !== 'admin_rejected' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReviewStatusUpdate(review._id, 'admin_rejected')}
                        >
                          Disapprove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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