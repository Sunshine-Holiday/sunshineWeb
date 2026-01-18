import React, { useState } from "react";
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
  Armchair,
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
  const [editingBooking, setEditingBooking] = useState<string | null>(null);

  const [newSeatNumber, setNewSeatNumber] = useState("");
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState("all");
  const navigate = useNavigate();

  // Queries
  const {
    data: bookingData,
    isLoading: isBookingLoading,
    isError: isBookingError,
    refetch: refetchBookings,
  } = useGetTripBookingHistoryQuery({
    trip: tripId,
    date: date,
  });

  const {
    data: reviewData,
    isLoading: isReviewLoading,
    isError: isReviewError,
    refetch: refetchReviews,
  } = useGetTripReviewsQuery({ tripId: tripId, selectedDate: date });

  // Mutations
  const [updateTrip, { isLoading: isUpdatingTrip }] = useUpdateTripMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();
  const [updateBooking, { isLoading: isUpdatingBooking }] =
    useUpdateBookingMutation();
  const [updateReview, { isLoading: isUpdatingReview }] =
    useUpdateReviewMutation();

  // Extract booked seats from all bookings
// Near the top, after queries
const bookedSeats = bookingData?.purchaseHistory.flatMap((booking) =>
  booking.selectedSeats.map(({ seat, busIndex }) => ({
    seat,
    busIndex,
  }))
) || [];

  const handleSeatSelect = (id: string) => {
    console.log(`Seat ${id} clicked in view-only mode`);
  };

  


  const handleSubmitEdit = async (bookingSeatId: string) => {
    const [bookingId, oldSeat, busIndex] = bookingSeatId.split("-");
    try {
      await updateTrip({
        bookingId,
        oldSeat,
        newSeat: newSeatNumber,
        busIndex: Number(busIndex),
      }).unwrap();
      toast.success(`Seat updated from ${oldSeat} to ${newSeatNumber}`);
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

  const openDeleteDialog = (bookingId: string) => {
    setDeleteBookingId(bookingId);
  };

  const handleToggleReviewActivate = async (
    bookingId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateBooking({
        bookingId,
        reviewEnabled: !currentStatus,
      }).unwrap();
      toast.success(
        `Review ${
          !currentStatus ? "enabled" : "disabled"
        } for booking ${bookingId.substring(0, 8)}...`
      );
      refetchBookings();
    } catch (error) {
      toast.error("Failed to update review activation status.");
      console.error("Error updating review activation:", error);
    }
  };

  const handleReviewStatusUpdate = async (reviewId: string, status: string) => {
    try {
      await updateReview({
        reviewId,
        isAdminApproved: status === "admin_approved",
        isAdminDisApproved: status === "admin_rejected",
      }).unwrap();
      toast.success(
        `Review ${
          status === "admin_approved" ? "approved" : "disapproved"
        } successfully`
      );
      refetchReviews();
    } catch (error) {
      toast.error("Failed to update review status.");
      console.error("Error updating review status:", error);
    }
  };

  // Filter reviews
  const filteredReviews =
    reviewData?.filter((review) => {
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
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              Failed to load data
            </h2>
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

  const { purchaseHistory, selectedDate, tripDetails } = bookingData;

  const totalSeats = tripDetails?.totalSeatsAvailable || 0;
  const bookedSeatCount = purchaseHistory.reduce((count, booking) => {
    return (
      count +
      booking.selectedSeats.filter((seat: string) => /^\d+$/.test(seat)).length
    );
  }, 0);
  const availableSeatCount = totalSeats - bookedSeatCount;
  const showSeatLayout = totalSeats === 20 || totalSeats === 32;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" className="mr-2" onClick={() => navigate(-1)}>
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
          <Badge
            variant="outline"
            className="px-3 py-1 bg-blue-50 text-blue-600 font-medium"
          >
            <Ticket className="h-4 w-4 mr-1" />
            {purchaseHistory.length}{" "}
            {purchaseHistory.length === 1 ? "Booking" : "Bookings"}
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-1 bg-green-50 text-green-600 font-medium"
          >
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
                <CardDescription>
                  There are no bookings for this trip on {selectedDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <Ticket className="h-16 w-16 text-gray-300" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Bookings</CardTitle>
                <CardDescription>
                  Manage all bookings for this trip
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/7">Booking ID</TableHead>
                        <TableHead className="w-1/7">Lead Passenger</TableHead>
                        <TableHead className="w-1/7">Phone</TableHead>
                        <TableHead className="w-1/7 text-center">
                          Passengers
                        </TableHead>
                        <TableHead className="w-1/7 text-center">
                          Selected Seats
                        </TableHead>
                        <TableHead className="w-1/7 text-right">
                          Price Details
                        </TableHead>

                        <TableHead className="w-1/7 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistory.map((booking) => (
                        <TableRow
                          key={booking.bookingId}
                          className="hover:bg-gray-50"
                        >
                          <TableCell
                            className="font-medium truncate"
                            title={booking.bookingId}
                          >
                            {booking.bookingId.substring(0, 8)}...
                          </TableCell>

                          <TableCell className="font-medium">
                            {booking.leadPassenger?.name || "Guest"}
                          </TableCell>

                          <TableCell>
                            {booking.leadPassenger?.phoneNumber || "N/A"}
                          </TableCell>

                          <TableCell className="text-center">
                            {booking.totalPassengers}
                          </TableCell>

                     <TableCell>
  <div className="flex flex-wrap gap-1 justify-center">
    {booking.selectedSeats.map(({ seat, busIndex }, index) => (
      <div
        key={`${booking.bookingId}-${seat}-${busIndex}-${index}`}
        className="flex items-center"
      >
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-2.5 py-0.5">
          {seat}
          <span className="ml-1.5 text-xs text-gray-600 font-normal">
            Bus {busIndex + 1}
          </span>
        </Badge>
      </div>
    ))}

    {booking.selectedSeats.length === 0 && (
      <span className="text-gray-400 text-sm italic">—</span>
    )}
  </div>
</TableCell>

                          <TableCell className="text-right font-medium">
                            <div className="flex flex-col items-end">
                              <span>
                                Total: ₹{booking.price.toLocaleString("en-IN")}
                              </span>
                              <span>
                                Paid: ₹
                                {(booking.advancePaid || 0).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                              <span>
                                Remaining: ₹
                                {(booking.remainingBalance || 0).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-center space-x-2">
                              <AlertDialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            openDeleteDialog(booking.bookingId)
                                          }
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
                                    <AlertDialogTitle>
                                      Confirm Deletion
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the booking for{" "}
                                      <span className="font-medium">
                                        {booking.leadPassenger?.name || "Guest"}{" "}
                                        (
                                        {booking.leadPassenger?.phoneNumber ||
                                          "N/A"}
                                        )
                                      </span>{" "}
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
                      ))}
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
                    <span className="text-sm">
                      {availableSeatCount} Available
                    </span>
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
                  seatPrice={tripDetails?.price || 0}
                  totalSeats={totalSeats}
                />
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Seat map is not available for this trip ({totalSeats}{" "}
                    seats).
                  </p>
                </div>
              )}

          {purchaseHistory.length > 0 && (
  <div className="mt-10">
    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
      <Armchair className="h-5 w-5 text-blue-600" />
      Seat Allocation Details
    </h3>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {purchaseHistory.map((booking) => (
        <Card key={booking.bookingId} className="overflow-hidden border shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/60 px-5 py-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                  {booking.leadPassenger?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-medium leading-tight">
                    {booking.leadPassenger?.name || "Guest User"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.totalPassengers} passenger
                    {booking.totalPassengers !== 1 && "s"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {booking.leadPassenger?.phoneNumber || "—"}
                  </p>
                </div>
              </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() =>
                                    openDeleteDialog(booking.bookingId)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirm Deletion
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the booking for{" "}
                                    {booking.leadPassenger?.name || "Guest"}{" "}
                                    with ID {booking.bookingId.substring(0, 8)}
                                    ...
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
                  <CardContent className="px-5 py-4">
            <div className="flex flex-wrap gap-2.5">
              {booking.selectedSeats.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-2">
                  No seats assigned to this booking
                </p>
              ) : (
                booking.selectedSeats.map(({ seat, busIndex }) => {
                  const editKey = `${booking.bookingId}-${seat}-${busIndex}`;

                  return (
                    <div key={editKey} className="flex items-center">
                      {editingBooking === editKey ? (
                        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-1.5 shadow-sm">
                          <Input
                            value={newSeatNumber}
                            onChange={(e) => setNewSeatNumber(e.target.value.trim())}
                            className="h-8 w-24 text-sm"
                            placeholder="Seat"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSubmitEdit(editKey)}
                            disabled={isUpdatingTrip || !newSeatNumber.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingBooking(null);
                              setNewSeatNumber("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-2 rounded-md border bg-gray-50/70 px-3 py-1.5 hover:bg-gray-100 transition-colors">
                          <div className="font-medium text-blue-700">{seat}</div>
                          <div className="text-xs text-gray-500">
                            Bus {busIndex + 1}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-60 group-hover:opacity-100"
                            onClick={() => handleEditClick(booking.bookingId, seat, busIndex)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={refetchReviews}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No reviews found{" "}
                    {reviewFilter !== "all"
                      ? `with '${reviewFilter}' status`
                      : ""}
                    .
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
                                {review.user?.email?.charAt(0).toUpperCase() ||
                                  "G"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {review.user?.email || "Guest"}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                <p>
                                  Travel:{" "}
                                  {new Date(
                                    review.travelDate
                                  ).toLocaleDateString()}
                                </p>
                                <span className="mx-2">•</span>
                                <p>
                                  Booking:{" "}
                                  {new Date(
                                    review.bookingDate
                                  ).toLocaleDateString()}
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
                          dangerouslySetInnerHTML={{
                            __html: review.description,
                          }}
                        />
                        <div className="flex gap-2">
                          {!review.isAdminApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() =>
                                handleReviewStatusUpdate(
                                  review._id,
                                  "admin_approved"
                                )
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
                                handleReviewStatusUpdate(
                                  review._id,
                                  "admin_rejected"
                                )
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
    </div>
  );
};

export default BookingDetails;
