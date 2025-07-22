import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetTripBookingHistoryQuery,
  useUpdateTripMutation,
  useDeleteBookingMutation,
  useGetTripReviewsQuery,
  useUpdateBookingMutation,
  useUpdateReviewMutation,
} from "@/store/api/booking";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  CalendarDays,
  Ticket,
  MapPin,
  Edit,
  Trash2,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeatLayout } from "@/pages/booking/components/SeatLayout";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";

const BookingDetails = () => {
  const { state } = useLocation();
  const { date, tripId, tripName } = state || {};
  const [activeTab, setActiveTab] = useState("table");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newSeatNumber, setNewSeatNumber] = useState("");
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("all");
  const navigate = useNavigate();

  // Queries
  const {
    data: bookingData,
    isLoading: isBookingLoading,
    isError: isBookingError,
    error: bookingError,
    refetch: refetchBookings,
  } = useGetTripBookingHistoryQuery({
    trip: tripId,
    date: date,
  });
  console.log("hello", bookingData);
  const {
    data: reviewData,
    isLoading: isReviewLoading,
    isError: isReviewError,
    refetch: refetchReviews,
  } = useGetTripReviewsQuery({ tripId: tripId, selectedDate: date });

  // Mutations
  const [updateTrip, { isLoading: isUpdatingTrip }] = useUpdateTripMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();
  const [updateBooking, { isLoading: isUpdatingBooking }] = useUpdateBookingMutation();
  const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewMutation();

  const bookedSeats =
    bookingData?.purchaseHistory.flatMap((booking) => booking.selectedSeats) ||
    [];

  const handleSeatSelect = (id) => {
    console.log(`Seat ${id} clicked in view-only mode`);
  };

  const handleEditClick = (bookingId, seat) => {
    setEditingBooking(`${bookingId}-${seat}`);
    setNewSeatNumber(seat);
  };

  const handleSubmitEdit = async (bookingSeatId) => {
    const [bookingId, originalSeat] = bookingSeatId.split("-");
    try {
      await updateTrip({
        bookingId,
        oldSeat: originalSeat,
        newSeat: newSeatNumber,
      }).unwrap();
      toast.success(`Seat updated from ${originalSeat} to ${newSeatNumber}`);
      setEditingBooking(null);
      setNewSeatNumber("");
      refetchBookings();
    } catch (error) {
      toast.error("Failed to update seat. Please try again.");
      console.error("Error updating seat:", error);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;
    try {
      await deleteBooking({ deleteBookingId }).unwrap();
      toast.success("Booking deleted successfully");
      setDeleteBookingId(null);
      refetchBookings();
    } catch (error) {
      toast.error("Failed to delete booking. Please try again.");
      console.error("Error deleting booking:", error);
    }
  };

  const openDeleteDialog = (bookingId) => {
    setDeleteBookingId(bookingId);
  };

  const handleToggleReviewActivate = async (bookingId, currentStatus) => {
    try {
      await updateBooking({
        bookingId,
        isReviewActivate: !currentStatus,
      }).unwrap();
      toast.success(
        `Review ${!currentStatus ? "enabled" : "disabled"} for booking ${bookingId.substring(0, 8)}...`
      );
      refetchBookings();
    } catch (error) {
      toast.error("Failed to update review activation status.");
      console.error("Error updating review activation:", error);
    }
  };

  const handleReviewStatusUpdate = async (reviewId, status) => {
    try {
      await updateReview({
        reviewId,
        isAdminApproved: status === "admin_approved",
        isAdminDisApproved: status === "admin_rejected",
      }).unwrap();
      toast.success(
        `Review ${status === "admin_approved" ? "approved" : "disapproved"} successfully`
      );
      refetchReviews();
    } catch (error) {
      toast.error("Failed to update review status.");
      console.error("Error updating review status:", error);
    }
  };

  // Filter reviews based on the selected filter
  const filteredReviews = reviewData?.filter((review) => {
    if (reviewFilter === "all") return true;
    if (reviewFilter === "approved") return review.isAdminApproved;
    if (reviewFilter === "disapproved") return review.isAdminDisApproved;
    if (reviewFilter === "pending")
      return !review.isAdminApproved && !review.isAdminDisApproved;
    return true;
  }) || [];

  if (isBookingLoading || isReviewLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-2 mb-8">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 w-full max-w-md mb-6" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (isBookingError || !bookingData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-500 mb-2">Failed to load data</h2>
            <p className="text-gray-600 mb-4">
              There was an error loading booking details.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { purchaseHistory, selectedDate, tripDetails, message } = bookingData;
  console.log("Booking Data:", tripDetails);
  const seatPrice = tripDetails?.price || 0;
  const totalSeats = selectedDate?.seats || Number(tripDetails.totalSeat);
  const bookedSeatCount = bookedSeats.length;
  const availableSeatCount = totalSeats - bookedSeatCount;

  // Determine if SeatLayout should be shown (only for 20 or 32 seats)
  const showSeatLayout = totalSeats === 20 || totalSeats === 32;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Ticket className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tripName || "Trip Details"}</h1>
            <div className="flex items-center text-gray-500 mt-1">
              <CalendarDays className="h-4 w-4 mr-1" />
              <p>{selectedDate}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-600 font-medium">
            <Ticket className="h-4 w-4 mr-1" />
            {purchaseHistory.length} {purchaseHistory.length === 1 ? "Booking" : "Bookings"}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-600 font-medium">
            <MapPin className="h-4 w-4 mr-1" />
            {availableSeatCount} Seats Available
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="table" onClick={() => setActiveTab("table")}>
            <Ticket className="h-4 w-4 mr-2" />
            Booking List
          </TabsTrigger>
          <TabsTrigger value="seats" onClick={() => setActiveTab("seats")}>
            <MapPin className="h-4 w-4 mr-2" />
            Seat Map
          </TabsTrigger>
          <TabsTrigger value="reviews" onClick={() => setActiveTab("reviews")}>
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {purchaseHistory.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center pb-2">
                <CardTitle>No Bookings Found</CardTitle>
                <CardDescription>There are no bookings for this trip on {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <Ticket className="h-16 w-16 text-gray-300" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Bookings</CardTitle>
                <CardDescription>Manage all bookings for this trip</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/7">Booking ID</TableHead>
                        <TableHead className="w-1/7">User Email</TableHead>
                        <TableHead className="w-1/7 text-center">Passengers</TableHead>
                        <TableHead className="w-1/7 text-center">Selected Seats</TableHead>
                        <TableHead className="w-1/7 text-right">Price Details</TableHead>
                        <TableHead className="w-1/7 text-center">Review Status</TableHead>
                        <TableHead className="w-1/7 text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistory.map((booking) => {console.log({"wew":booking})
                      return(
                        <TableRow key={booking.bookingId} className="hover:bg-gray-50">
                          <TableCell
                            className="font-medium truncate"
                            title={booking.bookingId}
                          >
                            {booking.bookingId.substring(0, 8)}...
                          </TableCell>
                          <TableCell
                            className="truncate"
                            title={booking.user.email}
                          >
                            {booking.user.email}
                          </TableCell>
                          <TableCell className="text-center">
                            {booking.totalPassengers}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {booking.selectedSeats.map((seat) => (
                                <Badge
                                  key={seat}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <div className="flex flex-col items-end">
                              <span>Total: ₹{booking.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                              <span>Paid: ₹{(booking.advancePaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                              <span>Remaining: ₹{(booking.remainingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={booking.isReviewActivate ? "default" : "outline"}
                                    size="sm"
                                    className={booking.isReviewActivate ? "bg-green-600 hover:bg-green-700" : ""}
                                    onClick={() =>
                                      handleToggleReviewActivate(
                                        booking.bookingId,
                                        booking.isReviewActivate
                                      )
                                    }
                                    disabled={isUpdatingBooking}
                                  >
                                    {booking.isReviewActivate ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Active
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Inactive
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {booking.isReviewActivate
                                      ? "Deactivate review option"
                                      : "Activate review option"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        navigate(`/booked/${booking.bookingId}`, {
                                          state: { id: booking.bookingId },
                                        });
                                      }}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Invoice</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => openDeleteDialog(booking.bookingId)}
                                          disabled={isDeleting}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Booking</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete
                                      the booking for{" "}
                                      <span className="font-medium">{booking.user.email}</span>{" "}
                                      with ID{" "}
                                      <span className="font-medium">
                                        {booking.bookingId.substring(0, 8)}...
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setDeleteBookingId(null)}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={handleDeleteBooking}
                                    >
                                      {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="seats">
          <Card>
            <CardHeader>
              <CardTitle>Seat Map</CardTitle>
              <CardDescription>
                View booked and available seats for this trip on {selectedDate}.
                <div className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                    <span className="text-sm">{availableSeatCount} Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="text-sm">{bookedSeatCount} Booked</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSeatLayout ? (
                <SeatLayout
                  selectedSeats={[]}
                  onSeatSelect={handleSeatSelect}
                  bookedSeats={bookedSeats}
                  seatPrice={seatPrice}
                  totalSeats={totalSeats}
                />
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Seat map is not available for this trip ({totalSeats} seats).
                  </p>
                </div>
              )}

              {purchaseHistory.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium mb-3 text-lg">Seat Allocation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purchaseHistory.map((booking) => (
                      <Card key={booking.bookingId} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 p-3 pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="font-medium text-blue-700">
                                  {booking.user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium" title={booking.user.email}>
                                  {booking.user.email.split("@")[0]}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {booking.totalPassengers} passenger
                                  {booking.totalPassengers > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => openDeleteDialog(booking.bookingId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete
                                    the booking for {booking.user.email} with ID{" "}
                                    {booking.bookingId.substring(0, 8)}...
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeleteBookingId(null)}
                                  >
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {booking.selectedSeats.map((seat, index) => (
                              <div
                                key={`${booking.bookingId}-${seat}-${index}`}
                                className="flex items-center"
                              >
                                {editingBooking === `${booking.bookingId}-${seat}` ? (
                                  <div className="flex gap-2 items-center">
                                    <Input
                                      value={newSeatNumber}
                                      onChange={(e) => setNewSeatNumber(e.target.value)}
                                      className="w-16 h-8"
                                      placeholder="Seat"
                                    />
                                    <Button
                                      size="sm"
                                      className="h-8"
                                      onClick={() =>
                                        handleSubmitEdit(`${booking.bookingId}-${seat}`)
                                      }
                                      disabled={isUpdatingTrip}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 bg-gray-50 p-1 px-2 rounded-lg">
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-100 text-blue-700"
                                    >
                                      {seat}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditClick(booking.bookingId, seat)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Trip Reviews</CardTitle>
                <CardDescription>
                  Approve or disapprove customer reviews for this trip
                </CardDescription>
              </div>
              <Select value={reviewFilter} onValueChange={setReviewFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter reviews" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="disapproved">Disapproved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isReviewError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-500">Failed to load reviews.</p>
                  <Button variant="outline" className="mt-4" onClick={refetchReviews}>
                    Try Again
                  </Button>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No reviews found{" "}
                    {reviewFilter !== "all" ? `with '${reviewFilter}' status` : ""}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review._id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="font-medium text-blue-700">
                                {review.user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{review.user.email}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                <p>
                                  Travel: {new Date(review.travelDate).toLocaleDateString()}
                                </p>
                                <span className="mx-2">•</span>
                                <p>
                                  Booking: {new Date(review.bookingDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              review.isAdminApproved
                                ? "default"
                                : review.isAdminDisApproved
                                ? "destructive"
                                : "outline"
                            }
                            className={
                              review.isAdminApproved
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : review.isAdminDisApproved
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {review.isAdminApproved ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                APPROVED
                              </div>
                            ) : review.isAdminDisApproved ? (
                              <div className="flex items-center">
                                <XCircle className="h-3 w-3 mr-1" />
                                DISAPPROVED
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                PENDING
                              </div>
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div
                          className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-md"
                          dangerouslySetInnerHTML={{ __html: review.description }}
                        />
                        <div className="flex gap-2">
                          {!review.isAdminApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() =>
                                handleReviewStatusUpdate(review._id, "admin_approved")
                              }
                              disabled={isUpdatingReview}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {!review.isAdminDisApproved && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                handleReviewStatusUpdate(review._id, "admin_rejected")
                              }
                              disabled={isUpdatingReview}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Disapprove
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {message && (
        <Card className="border-blue-200 bg-blue-50 mt-4">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-blue-700 text-sm">{message}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingDetails;