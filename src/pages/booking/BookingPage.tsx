
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "../../utils/animations";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGettripsIDQuery,
  useSelectedDateBookingQuery,
} from "@/store/api/trips";
import { toast } from "react-toastify";
import { useCreatebookingMutation } from "@/store/api/booking";
import { useCreatePaymentIntentMutation } from "@/store/api/terms";
import { RAZORPAY_API_KEY } from "@/store/store";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { FaSpinner, FaPlus, FaMinus } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Armchair, Calendar, MapPin } from "lucide-react";

const INITIAL_STEP = "select-seats";

interface StartDate {
  date: string;
  seats: number;
  _id?: string;
}

interface Package {
  _id: string;
  name: string;
  price: number;
  description: string;
  personCount?: number;
}

interface RoomChoice {
  _id: string;
  type: string;
  price: number;
  description: string;
}

interface Trip {
  _id: string;
  location: string;
  category: string;
  startDates: StartDate[];
  duration: string;
  busSize: string;
  amenities: string[];
  packages: Package[];
  roomChoices: RoomChoice[];
  boardingPoints: { _id: string; location: string; time: string; details: string }[];
  price: string;
  discountPercentage?: number;
  advancePaymentPercentage?: number;
}

interface BookingSummaryProps {
  addRoom: () => void;
  removeRoom: () => void;
  tripDetails: {
    from: string;
    to: string;
    date: StartDate[];
    time: string;
    busType: string;
    packages: Package[];
    roomChoices: RoomChoice[];
    baseSeatPrice: number;
    discountPercentage?: number;
    advancePaymentPercentage?: number;
  };
  selectedDate: StartDate | null;
  setSelectedData: (date: StartDate) => void;
  selectedSeats: string[];
  passengers: PassengerData[];
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package | null) => void;
  selectedRoomChoice: RoomChoice | null;
  setSelectedRoomChoice: (room: RoomChoice | null) => void;
  selectedRoomCount: number;
  setSelectedRoomCount: (count: number) => void;
  paymentOption: "full" | "advance";
  setPaymentOption: (option: "full" | "advance") => void;
  onProceed: () => void;
  loading: boolean;
  step: "select-seats" | "passenger-details";
  disabled?: boolean;
}

const BookingPage = () => {
  const location = useLocation();
  const userDetails = useSelector(selectCurrentUser);
  const tripId = location.state?.tripId;
  const [selectedDate, setSelectedDate] = useState<StartDate | null>(
    location.state?.selectedDate || null
  );
  const navigate = useNavigate();

  // State variables
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedRoomChoice, setSelectedRoomChoice] = useState<RoomChoice | null>(null);
  const [selectedRoomCount, setSelectedRoomCount] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"full" | "advance">("full");

  // Date formatting functions
  const formatDateToString = (dateInput: StartDate | string | Date): string => {
    let date: Date;
    if (typeof dateInput === "object" && "date" in dateInput) {
      date = parse(dateInput.date, "dd-MM-yyyy", new Date());
    } else if (typeof dateInput === "string") {
      date = parse(dateInput, "dd-MM-yyyy", new Date());
    } else {
      date = dateInput;
    }
    return isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";
  };

  const formatDateForAPI = (dateInput: StartDate | string | Date): string => {
    let date: Date;
    if (typeof dateInput === "object" && "date" in dateInput) {
      date = parse(dateInput.date, "dd-MM-yyyy", new Date());
    } else if (typeof dateInput === "string") {
      date = parse(dateInput, "dd-MM-yyyy", new Date());
    } else {
      date = dateInput;
    }
    return isValid(date) ? format(date, "dd-MM-yyyy") : "";
  };

  // API queries and mutations
  const {
    data: tripData,
    isLoading: tripLoading,
    isError: tripError,
  } = useGettripsIDQuery({ id: tripId });

  const {
    data: bookingData,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useSelectedDateBookingQuery({
    trip_id: tripId,
    selectedDate: selectedDate ? formatDateForAPI(selectedDate) : "",
  });

  const [createBooking] = useCreatebookingMutation();
  const [createPayment] = useCreatePaymentIntentMutation();

  // Effects
  useEffect(() => {
    if (bookingError) setBookedSeats([]);
  }, [bookingError]);

  useEffect(() => {
    if (tripData) {
      setTrip(tripData.trip);
      if (tripData.trip.roomChoices && tripData.trip.roomChoices.length > 0) {
        setSelectedRoomChoice(tripData.trip.roomChoices[0]);
        setSelectedRoomCount(1);
      }
    }
  }, [tripData]);

  useEffect(() => {
    if (bookingData?.selectedSeats) {
      setBookedSeats(bookingData.selectedSeats);
    } else {
      setBookedSeats([]);
    }
  }, [bookingData]);

  useEffect(() => {
    if (selectedDate) {
      console.log("selectedDate",selectedDate)
      const totalSeats = selectedDate.seats;
      if (totalSeats !== 20 && totalSeats !== 32) {
        setStep("passenger-details");
        setSelectedSeats([]);
        setPassengers([
          {
            name: "",
            age: "",
            gender: "",
            idProof: "",
            idProofNumber: "",
            address: "",
            phoneNumber: "",
          },
        ]);
      } else {
        setStep(INITIAL_STEP);
        setSelectedSeats([]);
        if (!selectedPackage && !selectedRoomChoice) {
          setPassengers([]);
        }
      }
    }
  }, [selectedDate, selectedPackage, selectedRoomChoice]);

  // Handlers
  const changeDate = (date: StartDate) => {
    setSelectedDate(date);
    setSelectedSeats([]);
    if (!selectedPackage && !selectedRoomChoice) {
      setPassengers([]);
    }
  };

  const handleSeatSelect = (seatId: string) => {
    if (isSubmitting) return;
    if (bookedSeats.includes(seatId)) {
      toast.error("This seat is already booked");
      return;
    }

    const maxSeats = selectedPackage
      ? Math.min(
          selectedDate?.seats - bookedSeats.length,
          selectedPackage?.personCount || 0
        )
      : selectedDate?.seats - bookedSeats.length;

    if (selectedSeats.length >= maxSeats && !selectedSeats.includes(seatId)) {
      toast.error(`Cannot select more than ${maxSeats} seats`);
      return;
    }

    setSelectedSeats((prev) => {
      const newSeats = prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId].sort();

      setPassengers((prevPassengers) => {
        const newPassengers = newSeats.map((seat, index) =>
          prevPassengers[index] || {
            name: "",
            age: "",
            gender: "",
            idProof: "",
            idProofNumber: "",
            address: "",
            phoneNumber: "",
          }
        );
        return newPassengers;
      });

      return newSeats;
    });
  };

  const handlePassengerChange = (index: number, data: PassengerData) => {
    if (isSubmitting) return;
    setPassengers((prev) => {
      const updatedPassengers = [...prev];
      updatedPassengers[index] = data;
      return updatedPassengers;
    });
  };

  const addPassenger = () => {
    if (isSubmitting) return;
    const maxAvailableSeats = selectedDate
      ? selectedDate.seats - bookedSeats.length
      : 0;

    const maxPassengers = selectedPackage || selectedRoomChoice
      ? Math.min(maxAvailableSeats, selectedPackage?.personCount || 0)
      : maxAvailableSeats;

    if (passengers.length >= maxPassengers) {
      toast.error(`Cannot add more passengers. Only ${maxPassengers} seats available.`);
      return;
    }

    setPassengers((prev) => [
      ...prev,
      {
        name: "",
        age: "",
        gender: "",
        idProof: "",
        idProofNumber: "",
        address: "",
        phoneNumber: "",
      },
    ]);

    if ((selectedPackage || selectedRoomChoice) && (selectedDate?.seats === 20 || selectedDate?.seats === 32)) {
      const availableSeats = Array.from(
        { length: selectedDate?.seats || 0 },
        (_, i) => (i + 1).toString()
      ).filter(seat => !bookedSeats.includes(seat) && !selectedSeats.includes(seat));

      if (availableSeats.length > 0) {
        setSelectedSeats((prev) => [...prev, availableSeats[0]].sort());
      }
    }
  };

  const removePassenger = (index: number) => {
    if (isSubmitting) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
    if ((selectedPackage || selectedRoomChoice) && (selectedDate?.seats === 20 || selectedDate?.seats === 32)) {
      setSelectedSeats((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validatePassengerDetails = () => {
    return passengers.every(
      (passenger) =>
        passenger.name.trim() &&
        passenger.age &&
        ["male", "female", "other"].includes(passenger.gender) &&
        ["aadhar", "pan"].includes(passenger.idProof) &&
        passenger.idProofNumber.trim() &&
        passenger.phoneNumber.trim()
    );
  };

  const handleGoBack = () => {
    if (selectedDate?.seats === 20 || selectedDate?.seats === 32) {
      setStep("select-seats");
    }
  };

  const handlePackageSelect = (pkg: Package | null) => {
    setSelectedPackage(pkg);
    setSelectedSeats([]);
    setPassengers([]);
    setSelectedRoomCount(1);
    if (pkg) {
      setPassengers([
        {
          name: "",
          age: "",
          gender: "",
          idProof: "",
          idProofNumber: "",
          address: "",
          phoneNumber: "",
        },
      ]);
    }
  };

  const handleRoomChoiceSelect = (room: RoomChoice | null) => {
    setSelectedRoomChoice(room);
    setSelectedRoomCount(1);
    if (room) {
      setPassengers([
        {
          name: "",
          age: "",
          gender: "",
          idProof: "",
          idProofNumber: "",
          address: "",
          phoneNumber: "",
        },
      ]);
    }
  };

  const addRoom = () => {
    if (isSubmitting) return;
    setSelectedRoomCount((prev) => prev + 1);
  };

  const removeRoom = () => {
    if (isSubmitting) return;
    setSelectedRoomCount((prev) => Math.max(1, prev - 1));
  };

  const handlePayment = async (paymentDetail: any, amountToPay: number, totalAmount: number) => {
    return new Promise<void>((resolve, reject) => {
      const options = {
        key: RAZORPAY_API_KEY,
        amount: paymentDetail.amount,
        currency: paymentDetail.currency,
        name: "Sunshine Holiday Packages",
        description: "Sunrise Tours",
        order_id: paymentDetail.id,
        handler: async (response: any) => {
          try {
            const advancePaymentPercentage = trip?.advancePaymentPercentage || 50;
            const advancePaid = paymentOption === "advance" ? amountToPay : totalAmount;
            const remainingBalance = paymentOption === "advance" ? totalAmount - advancePaid : 0;
            const paymentStatus = paymentOption === "advance" ? "advance" : "full";

            const bookingData = {
              tripId,
              selectedPackage: selectedPackage?._id || null,
              selectedRoomChoice: selectedRoomChoice?._id || null,
              roomCount: selectedRoomCount,
              price: totalAmount,
              advancePaid,
              remainingBalance,
              paymentStatus,
              selectedSeats:
                selectedDate?.seats !== 20 && selectedDate?.seats !== 32
                  ? Array(passengers.length).fill("N/A")
                  : selectedSeats,
              selectedDate: formatDateToString(selectedDate),
              passengers,
            };

            if (!bookingData.passengers.length) {
              throw new Error("At least one passenger is required");
            }
            if (!/^\d{2}-\d{2}-\d{4}$/.test(bookingData.selectedDate)) {
              throw new Error("Invalid date format");
            }

            const resp = await createBooking(bookingData).unwrap();

            toast.success("Trip booked successfully");
            navigate("/booked", {
              state: {
                bookingDetails: resp,
                paymentResponse: response,
              },
            });
            resolve();
          } catch (error) {
            console.error("Booking error:", error);
            toast.error(error.message || "Booking failed!");
            reject(error);
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: userDetails?.username || "",
          email: userDetails?.email || "",
          contact: passengers[0]?.phoneNumber || "",
        },
        theme: {
          color: "#3399cc",
        },
        method: {
          netbanking: true,
          card: true,
          wallet: true,
          upi: true,
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info("Payment cancelled by user");
            reject(new Error("Payment cancelled"));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast.error("Payment failed. Please try again.");
        setIsSubmitting(false);
        reject(response);
      });
      razorpay.open();
    });
  };

  const handleProceed = async () => {
    if (isSubmitting) return;

    if (step === "select-seats" && (selectedDate?.seats === 20 || selectedDate?.seats === 32)) {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat.");
        return;
      }
      if (selectedPackage || selectedRoomChoice) {
        if (selectedSeats.length !== passengers.length) {
          toast.error("Number of selected seats must match number of passengers.");
          return;
        }
      } else {
        setPassengers(
          selectedSeats.map(() => ({
            name: "",
            age: "",
            gender: "",
            idProof: "",
            idProofNumber: "",
            address: "",
            phoneNumber: "",
          }))
        );
      }
      setStep("passenger-details");
    } else {
      if (!validatePassengerDetails()) {
        toast.error("Please fill in all passenger details with valid values.");
        return;
      }

      if ((selectedPackage || selectedRoomChoice) &&
          (selectedDate?.seats === 20 || selectedDate?.seats === 32) &&
          selectedSeats.length !== passengers.length) {
        toast.error("Number of selected seats must match number of passengers.");
        return;
      }

      setIsSubmitting(true);
      try {
        const numPassengers = (selectedDate?.seats === 20 || selectedDate?.seats === 32) ? selectedSeats.length : passengers.length;
        const baseSeatPrice = parseInt(trip?.price) || 1000;
        let basePrice = selectedPackage ? selectedPackage.price : baseSeatPrice * numPassengers;

        const hasDiscount = trip?.discountPercentage !== undefined && trip.discountPercentage > 0 && trip.discountPercentage <= 100;
        if (hasDiscount) {
          basePrice = basePrice * (1 - trip.discountPercentage / 100);
        }

        const roomPrice = selectedRoomChoice ? selectedRoomChoice.price * selectedRoomCount : 0;
        const totalPrice = basePrice + roomPrice;
        const totalGst = totalPrice * 0.05;
        const finalAmount = totalPrice + totalGst;
        const advancePaymentPercentage = trip?.advancePaymentPercentage || 50;
        const amountToPay = paymentOption === "advance" ? finalAmount * (advancePaymentPercentage / 100) : finalAmount;

        if (isNaN(totalPrice) || isNaN(totalGst) || isNaN(finalAmount)) {
          throw new Error("Invalid amount calculation");
        }

        const respPayment = await createPayment({
          amount: amountToPay,
        }).unwrap();

        if (respPayment.success) {
          await handlePayment(respPayment.paymentDetail, amountToPay, finalAmount);
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        toast.error(error.message || error.data?.message || "Payment processing failed.");
        setIsSubmitting(false);
      }
    }
  };

  if (tripLoading || (bookingLoading && selectedDate)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  if (tripError || !trip) {
    return <div className="text-center">Failed to load trip details.</div>;
  }

  const tripDetails = {
    from: trip.location || "Unknown",
    to: trip.category || "Unknown",
    date: trip.startDates || [],
    time: trip.duration || "N/A",
    busType: trip.busSize || "Standard",
    amenities: trip.amenities || [],
    packages: trip.packages || [],
    roomChoices: trip.roomChoices || [],
    boardingPoints: trip.boardingPoints || [],
    busSize: trip.busSize || "20",
    baseSeatPrice: parseInt(trip.price) || 1000,
    discountPercentage: trip.discountPercentage,
    advancePaymentPercentage: trip.advancePaymentPercentage,
  };

  const totalSeats = selectedDate?.seats || Number(tripDetails.busSize);
  const maxAvailableSeats = (selectedPackage || selectedRoomChoice)
    ? Math.min(totalSeats - bookedSeats.length, selectedPackage?.personCount || 0)
    : totalSeats - bookedSeats.length;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center space-x-4">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="text-lg">Processing your booking...</span>
          </div>
        </div>
      )}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isSubmitting ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {step === "select-seats" ? "Select Your Seats" : "Passenger Details"}
          </h1>
          <p className="text-gray-600">
            {step === "select-seats"
              ? `Choose ${selectedPackage || selectedRoomChoice ? `up to ${selectedPackage?.personCount || 0}` : "your"} seats for your journey`
              : `Enter details for up to ${maxAvailableSeats} passenger(s)`}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === "select-seats" && (totalSeats === 20 || totalSeats === 32) ? (
              <SeatLayout
                totalSeats={totalSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={bookedSeats}
                seatPrice={tripDetails.baseSeatPrice}
                disabled={isSubmitting}
              />
            ) : (
              <div className="space-y-4">
                {passengers.map((_, index) => (
                  <div key={index} className="relative">
                    <PassengerForm
                      tripDetails={tripDetails}
                      seatNumber={`Passenger ${index + 1}`}
                      index={index}
                      onChange={handlePassengerChange}
                      passengers={passengers}
                    />
                    {passengers.length > 1 && (
                      <Button
                        onClick={() => removePassenger(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {!(totalSeats === 20 || totalSeats === 32) && maxAvailableSeats > passengers.length && (
                  <Button
                    onClick={addPassenger}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    disabled={isSubmitting}
                  >
                    Add Passenger
                  </Button>
                )}
                <p className="text-sm text-gray-600">
                  {maxAvailableSeats} seat(s) available
                </p>
                {step === "passenger-details" && (totalSeats === 20 || totalSeats === 32) && (
                  <Button
                    onClick={handleGoBack}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    disabled={isSubmitting}
                  >
                    Back to Seat Selection
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <BookingSummary
              step={step}
              addRoom={addRoom}
              removeRoom={removeRoom}
              passengers={passengers}
              tripDetails={tripDetails}
              loading={isSubmitting}
              selectedSeats={selectedSeats}
              selectedPackage={selectedPackage}
              setSelectedPackage={handlePackageSelect}
              selectedRoomChoice={selectedRoomChoice}
              setSelectedRoomChoice={handleRoomChoiceSelect}
              selectedRoomCount={selectedRoomCount}
              setSelectedRoomCount={setSelectedRoomCount}
              paymentOption={paymentOption}
              setPaymentOption={setPaymentOption}
              setSelectedData={changeDate}
              selectedDate={selectedDate}
              onProceed={handleProceed}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// SeatLayout Component
const Seat = ({ id, isBooked, isSelected, onSelect, price, totalSeats }: any) => {
  return (
    <div className="items-center flex flex-col">
      <motion.div
        whileHover={{ scale: isBooked ? 1 : 1.1 }}
        whileTap={{ scale: isBooked ? 1 : 0.95 }}
      >
        <Button
          onClick={() => !isBooked && onSelect(id)}
          disabled={isBooked}
          className={`w-10 h-16 rounded-lg m-1 flex flex-col items-center justify-center transition-colors
            ${
              isBooked
                ? "bg-gray-300 cursor-not-allowed"
                : isSelected
                ? "bg-blue-600 text-white hover:bg-blue-600"
                : "bg-white hover:bg-blue-50 text-gray-600"
            }`}
        >
          <Armchair
            size={20}
            className={`mt-1 ${
              isBooked
                ? "text-gray-400"
                : isSelected
                ? "text-white"
                : "text-gray-600"
            }`}
          />
        </Button>
      </motion.div>
      <span className="text-sm font-medium">{id}</span>
    </div>
  );
};

interface SeatLayoutProps {
  selectedSeats: string[];
  onSeatSelect: (id: string) => void;
  bookedSeats: string[];
  seatPrice: number;
  totalSeats: number;
  disabled?: boolean;
}

const SeatLayout = ({
  selectedSeats,
  onSeatSelect,
  bookedSeats,
  seatPrice,
  totalSeats,
  disabled = false,
}: SeatLayoutProps) => {
  const [isTwoSeaterLayout, setIsTwoSeaterLayout] = useState(
    totalSeats !== 20 ? true : false
  );
  console.log(`isTwoSeaterLayout: ${totalSeats}`);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  const isBlockBooking = selectedSeats.includes("block");
useEffect(() => {
    setIsTwoSeaterLayout(totalSeats === 32);
  }, [totalSeats]);
  if (totalSeats !== 20 && totalSeats !== 32) {
    console.warn(`Invalid totalSeats value: ${totalSeats}. Expected 20 or 32.`);
    return null;
  }

  const seats = isTwoSeaterLayout
    ? [
        ["", "", "", "1", "2"],
        ["3", "4", "", "5", "6"],
        ["7", "8", "", "9", "10"],
        ["11", "12", "", "13", "14"],
        ["15", "16", "", "17", "18"],
        ["19", "20", "", "21", "22"],
        ["23", "24", "", "25", "26"],
        ["27", "28", "29", "30", "31"],
      ]
    : [
        ["1", "", "2", "3"],
        ["4", "", "5", "6"],
        ["7", "", "8", "9"],
        ["10", "", "11", "12"],
        ["13", "", "14", "15"],
        ["16", "17", "18", "19"],
      ];
console.log("Seat Layout:", isTwoSeaterLayout);
  useEffect(() => {
    if (
      !isBlockBooking &&
      bookedSeats.length === seats.flat().filter(Boolean).length
    ) {
      setShowLayoutModal(true);
    }
  }, [bookedSeats, seats, isBlockBooking]);

  const handleLayoutChange = () => {
    setIsTwoSeaterLayout(true);
    setShowLayoutModal(false);
  };

  const handleIconClick = () => {
    if (!isBlockBooking && selectedSeats.length > 11) {
      setShowLayoutModal(true);
    }
  };

  if (isBlockBooking) {
    return (
      <div className="bg-gray-100 p-6 rounded-xl text-center">
        <h3 className="text-xl font-semibold mb-4">Block Booking (1 Seat)</h3>
        <p className="text-gray-600 mb-4">
          This is a full bus booking, treated as a single seat for pricing.
        </p>
        <div className="text-sm font-medium">
          Total Price: ₹
          {seatPrice.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-100 p-6 rounded-xl ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white rounded mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>
        <div className="text-sm font-medium">
          Price per seat: ₹
          {seatPrice.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="my-3">
          <p className="text-red-600">Your seats can be changed by admin</p>
        </div>
        <div className="flex flex-row gap-10 items-center">
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            {totalSeats}
          </div>
          <div className="w-20 h-20 bg-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
            Driver
          </div>
        </div>
        <div
          className={`grid ${
            isTwoSeaterLayout ? "grid-cols-5" : "grid-cols-4"
          } gap-2`}
        >
          {seats.flatMap((row, rowIndex) =>
            row.map((seatId, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex justify-center"
              >
                {seatId ? (
                  <Seat
                    id={seatId}
                    isBooked={bookedSeats.includes(seatId)}
                    isSelected={selectedSeats.includes(seatId)}
                    onSelect={onSeatSelect}
                    price={seatPrice}
                    totalSeats={totalSeats}
                  />
                ) : (
                  <div className="w-10 h-16"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// PassengerForm Component
interface PassengerFormProps {
  seatNumber: string;
  index: number;
  tripDetails: {
    boardingPoints: {
      details: string;
      location: string;
      time: string;
      _id: string;
    }[];
  };
  onChange: (index: number, data: PassengerData) => void;
  passengers: PassengerData[];
}

const PassengerForm = ({
  seatNumber,
  tripDetails,
  index,
  onChange,
  passengers,
}: PassengerFormProps) => {
  const [errors, setErrors] = useState({
    name: false,
    age: false,
    gender: false,
    idProof: false,
    idProofNumber: false,
    phoneNumber: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    name: "",
    age: "",
    gender: "",
    idProof: "",
    idProofNumber: "",
    phoneNumber: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedData: PassengerData = {
      ...passengers[index],
      [name]: value.trim(),
    };

    onChange(index, updatedData);

    const isEmpty = value.trim() === "";
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: isEmpty || (name === "gender" && !["male", "female", "other"].includes(value)) ||
        (name === "idProof" && !["aadhar", "pan"].includes(value)),
    }));

    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [name]: isEmpty
        ? `Please enter ${name}`
        : (name === "gender" && !["male", "female", "other"].includes(value))
        ? "Please select a valid gender"
        : (name === "idProof" && !["aadhar", "pan"].includes(value))
        ? "Please select a valid ID proof type"
        : "",
    }));
  };

  const hasBoardingPoints = tripDetails.boardingPoints && tripDetails.boardingPoints.length > 0;

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white p-6 rounded-lg shadow-sm mb-4"
    >
      <h3 className="font-medium mb-4">
        Passenger {index + 1} - Seat {seatNumber}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={passengers[index]?.name || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : ""
            }`}
            aria-invalid={errors.name ? "true" : "false"}
            required
          />
          {errors.name && <p className="text-red-500 text-xs">{errorMessages.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="text"
            name="age"
            value={passengers[index]?.age || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.age ? "border-red-500" : ""
            }`}
            aria-invalid={errors.age ? "true" : "false"}
            required
          />
          {errors.age && <p className="text-red-500 text-xs">{errorMessages.age}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={passengers[index]?.gender || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.gender ? "border-red-500" : ""
            }`}
            aria-invalid={errors.gender ? "true" : "false"}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs">{errorMessages.gender}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof Type
          </label>
          <select
            name="idProof"
            value={passengers[index]?.idProof || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.idProof ? "border-red-500" : ""
            }`}
            required
          >
            <option value="">Select ID Proof</option>
            <option value="aadhar">Aadhar</option>
            <option value="pan">PAN</option>
          </select>
          {errors.idProof && <p className="text-red-500 text-xs">{errorMessages.idProof}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof Number
          </label>
          <input
            type="text"
            name="idProofNumber"
            value={passengers[index]?.idProofNumber || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.idProofNumber ? "border-red-500" : ""
            }`}
            aria-invalid={errors.idProofNumber ? "true" : "false"}
            required
          />
          {errors.idProofNumber && <p className="text-red-500 text-xs">{errorMessages.idProofNumber}</p>}
        </div>

        {hasBoardingPoints && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location
            </label>
            <select
              name="address"
              value={passengers[index]?.address || ""}
              onChange={handleChange}
              className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            >
              <option value="">Select Pickup Location</option>
              {tripDetails.boardingPoints.map((point) => (
                <option key={point._id} value={point.location}>
                  {point.location} - {point.time}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            name="phoneNumber"
            value={passengers[index]?.phoneNumber || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.phoneNumber ? "border-red-500" : ""
            }`}
            aria-invalid={errors.phoneNumber ? "true" : "false"}
            required
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs">{errorMessages.phoneNumber}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// BookingSummary Component
const BookingSummary = ({
  addRoom,
  removeRoom,
  loading,
  tripDetails,
  selectedSeats,
  passengers,
  selectedPackage,
  setSelectedPackage,
  selectedRoomChoice,
  setSelectedRoomChoice,
  selectedRoomCount,
  setSelectedRoomCount,
  paymentOption,
  setPaymentOption,
  setSelectedData,
  selectedDate,
  step,
  onProceed,
  disabled = false,
}: BookingSummaryProps) => {
  const totalSeats = selectedDate?.seats || 0;
  console.log("Total Seats:", totalSeats);
  const isSeatSelection = totalSeats === 20 || totalSeats === 32;
  const numPassengers = isSeatSelection ? selectedSeats.length : passengers.length;

  // Debugging log
  console.log("BookingSummary props:", { disabled, selectedRoomCount, numPassengers });

  let basePrice = selectedPackage ? selectedPackage.price : (tripDetails.baseSeatPrice || 1000) * numPassengers;
  const hasDiscount = tripDetails.discountPercentage !== undefined && tripDetails.discountPercentage > 0 && tripDetails.discountPercentage <= 100;
  const originalBasePrice = basePrice;
  if (hasDiscount) {
    basePrice = basePrice * (1 - tripDetails.discountPercentage / 100);
  }

  const roomPrice = selectedRoomChoice ? selectedRoomChoice.price * selectedRoomCount : 0;
  const totalPrice = basePrice + roomPrice;
  const totalGst = totalPrice * 0.05;
  const finalAmount = totalPrice + totalGst;
  const advancePaymentPercentage = tripDetails.advancePaymentPercentage || 50;

  const formatDateWithSeats = (startDate: StartDate): string => {
    const date = parse(startDate.date, "dd-MM-yyyy", new Date());
    if (!isValid(date)) {
      console.error("Invalid date:", startDate.date);
      return "Invalid Date";
    }
    return `${format(date, "dd-MM-yyyy")} (${startDate.seats} Seats)`;
  };

  const validDates = tripDetails.date.filter((startDate) => {
    if (!startDate || typeof startDate !== "object" || !("date" in startDate)) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parse(startDate.date, "dd-MM-yyyy", new Date());
    return isValid(checkDate) && checkDate >= today;
  });

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={`bg-white rounded-xl shadow-lg p-6 ${disabled ? "opacity-50" : ""}`}
    >
      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

      <div className="space-y-4 mb-6">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-5 h-5 mr-2" />
          <span>
            {tripDetails.from} → {tripDetails.to}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          <select
            className="border p-2 rounded-md w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={selectedDate ? formatDateWithSeats(selectedDate) : ""}
            onChange={(e) => {
              if (disabled) return;
              const selected = validDates.find(
                (date) => formatDateWithSeats(date) === e.target.value
              );
              if (selected) setSelectedData(selected);
            }}
            disabled={disabled || loading}
          >
            {validDates.length === 0 ? (
              <option value="">No available dates</option>
            ) : (
              <>
                <option value="">Select a date</option>
                {validDates.map((date) => (
                  <option key={date.date} value={formatDateWithSeats(date)}>
                    {formatDateWithSeats(date)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        {tripDetails.packages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Package
            </label>
            <div className="grid gap-4">
              {tripDetails.packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPackage?._id === pkg._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => !disabled && setSelectedPackage(pkg)}
                >
                  <h4 className="font-semibold">{pkg.name}</h4>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                  <p className="text-sm font-medium mt-2">
                    {hasDiscount ? (
                      <>
                        <span className="line-through text-gray-500">
                          Before: ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                        <br />
                        <span>
                          After: ₹{Math.round(pkg.price * (1 - tripDetails.discountPercentage / 100)).toLocaleString("en-IN")}
                        </span>
                        <br />
                        <span className="text-green-600">{tripDetails.discountPercentage}% off</span>
                      </>
                    ) : (
                      <span>₹{pkg.price.toLocaleString("en-IN")}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {tripDetails.roomChoices.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Room Choice
            </label>
            <div className="grid gap-4">
              {tripDetails.roomChoices.map((room, index) => (
                <div
                  key={`${room._id}-${selectedRoomCount}`}
                  className={`p-4 border rounded-lg transition-colors relative ${
                    selectedRoomChoice?._id === room._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  } ${index === 0 ? "cursor-pointer opacity-75" : "cursor-pointer"}`}
                  onClick={() => !disabled && setSelectedRoomChoice(room)}
                >
                  <h4 className="font-semibold">{room.type}</h4>
                  <p className="text-sm text-gray-600">{room.description}</p>
                  <p className="text-sm font-medium mt-2">
                    ₹{room.price.toLocaleString("en-IN")} x {selectedRoomChoice?._id === room._id ? selectedRoomCount : 1} {selectedRoomChoice?._id === room._id && selectedRoomCount > 1 ? "rooms" : "room"}
                  </p>
                  {selectedRoomChoice?._id === room._id && (
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addRoom();
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
                        disabled={disabled}
                      >
                        <FaPlus size={16} />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRoom();
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                        disabled={disabled || selectedRoomCount <= 1}
                      >
                        <FaMinus size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Option
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentOption"
                value="full"
                checked={paymentOption === "full"}
                onChange={() => setPaymentOption("full")}
                disabled={disabled || loading}
                className="mr-2"
              />
              Full Payment
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentOption"
                value="advance"
                checked={paymentOption === "advance"}
                onChange={() => setPaymentOption("advance")}
                disabled={disabled || loading}
                className="mr-2"
              />
              Advance Payment ({advancePaymentPercentage}%)
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        {isSeatSelection && (
          <div className="flex justify-between mb-2">
            <span>Selected Seats</span>
            <span>{selectedSeats.join(", ") || "None"}</span>
          </div>
        )}
        <div className="flex justify-between mb-2">
          <span>Number of Passengers</span>
          <span>{numPassengers}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>{selectedPackage ? "Package Price" : "Seat Price"}</span>
          {hasDiscount ? (
            <div className="flex flex-col items-end">
              <span className="text-sm line-through text-gray-500">
                Before: ₹{originalBasePrice.toLocaleString("en-IN")}
              </span>
              <span>
                After: ₹{Math.round(basePrice).toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-green-600">
                {tripDetails.discountPercentage}% off
              </span>
            </div>
          ) : (
            <span>₹{basePrice.toLocaleString("en-IN")}</span>
          )}
        </div>
        {selectedRoomChoice && (
          <div className="flex justify-between mb-2">
            <span>Room Price ({selectedRoomCount} {selectedRoomCount > 1 ? "rooms" : "room"})</span>
            <span>₹{roomPrice.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between mb-2">
          <span>Total Price</span>
          <span>₹{totalPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>GST (5%)</span>
          <span>₹{totalGst.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4">
          <span>Final Amount</span>
          <span>₹{finalAmount.toLocaleString("en-IN")}</span>
        </div>
        {paymentOption === "advance" && (
          <div className="flex justify-between font-semibold text-lg mt-2">
            <span>Advance Payment ({advancePaymentPercentage}%)</span>
            <span>₹{(finalAmount * (advancePaymentPercentage / 100)).toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      <Button
        onClick={() => !disabled && onProceed()}
        disabled={(isSeatSelection && selectedSeats.length === 0 && step === "select-seats") || !selectedDate || loading || disabled}
        className={`w-full relative ${
          (isSeatSelection && selectedSeats.length === 0 && step === "select-seats") || !selectedDate || loading || disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading && <FaSpinner className="animate-spin inline mr-2" />}
        Proceed to {isSeatSelection && step === "select-seats" ? "Passenger Details" : "Payment"}
      </Button>
    </motion.div>
  );
};

export default BookingPage;
