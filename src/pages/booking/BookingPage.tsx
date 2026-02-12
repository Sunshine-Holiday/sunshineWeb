import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PassengerData } from "./components/PassengerForm";
import { fadeInUp } from "../../utils/animations";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/asserts/favicon.png";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGettripsIDQuery,
  useSelectedDateBookingQuery,
} from "@/store/api/trips";
import { toast } from "react-toastify";
import { useCreatebookingMutation } from "@/store/api/booking";
import {
  useCreatePaymentIntentMutation,
  useGetTermsQuery,
} from "@/store/api/terms";
import { RAZORPAY_API_KEY } from "@/store/store";
import { FaSpinner, FaPlus, FaMinus } from "react-icons/fa";
import { format, parse, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Armchair, Calendar, MapPin } from "lucide-react";
import TermsModal from "@/components/TermsModal";
const INITIAL_STEP = "select-seats";

interface Vehicle {
  instructorName: string;
  vehicleNumber: string;
  phoneNumber?: string; // ✅ NEW
  _id?: string;
}

interface StartDate {
  date: string;
  seats: number;
  numberOfBusesAvailable?: number | string;
  vehicles?: Vehicle[]; // ✅ IMPORTANT
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
  boardingPoints: {
    _id: string;
    location: string;
    time: string;
    details: string;
  }[];
  price: string;
  discountPercentage?: number;
  advancePaymentPercentage?: number;
}

interface BookingSummaryProps {
  numberOfBuses: number;
  totaCapacity: number;
  addPassenger: () => void;
  removePassenger: (index: number) => void;
  bookedSeats: { seat: string; busIndex: number }[];

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

  /** ✅ NEW — TERMS */
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
  showTermsModal: boolean;
  setShowTermsModal: (value: boolean) => void;
  termsContent: string;
}

const BookingPage = () => {
  const { data: termsData, isLoading } = useGetTermsQuery();
  console.log("Terms Data:", termsData);
  const location = useLocation();
  const tripId = location.state?.tripId;
  const [selectedDate, setSelectedDate] = useState<StartDate | null>(
    location.state?.selectedDate || null,
  );
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // State variables
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<
    { seat: string; busIndex: number }[]
  >([]);

  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [step, setStep] = useState<"select-seats" | "passenger-details">(
    INITIAL_STEP,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedRoomChoice, setSelectedRoomChoice] =
    useState<RoomChoice | null>(null);
  const [selectedRoomCount, setSelectedRoomCount] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<"full" | "advance">(
    "full",
  );
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceGenerating, setInvoiceGenerating] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [invoiceFilename, setInvoiceFilename] = useState<string>("");
  const [invoiceBlobUrl, setInvoiceBlobUrl] = useState<string | null>(null);

  // Convert local image url to base64 for jsPDF
  const toDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const buildBusSeatVehicleSummary = (
    selectedSeats: string[],
    selectedDate: StartDate | null,
  ) => {
    if (!selectedDate) return "N/A";

    const vehicles = selectedDate.vehicles || [];

    // group seats by busIndex
    const grouped = selectedSeats.reduce(
      (acc: Record<number, string[]>, key) => {
        const [busIndexStr, seat] = key.split("-");
        const busIndex = Number(busIndexStr);
        if (!acc[busIndex]) acc[busIndex] = [];
        acc[busIndex].push(seat);
        return acc;
      },
      {},
    );

    // format per bus
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([busIndexStr, seats]) => {
        const busIndex = Number(busIndexStr);
        const v = vehicles[busIndex];

        const instructor = v?.instructorName || "—";
        const vehicleNo = v?.vehicleNumber || "—";
        const phone = v?.phoneNumber || "—";
        return `Bus ${busIndex + 1} (Vehicle: ${vehicleNo}, Instructor: ${instructor}, Phone: ${phone}) Seats: ${seats
          .sort((x, y) => Number(x) - Number(y))
          .join(", ")}`;
      })
      .join(" | ");
  };

  // Create PDF blob url + auto download
  const generateInvoicePDF = async ({
    bookingId,
    paymentStatus,
    totalAmount,
    amountPaid,
    remaining,
    selectedSeatsFormatted,
  }: {
    bookingId: string;
    paymentStatus: string;
    totalAmount: number;
    amountPaid: number;
    remaining: number;
    selectedSeatsFormatted: string;
  }) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Logo (safe)
    try {
      const base64 = await toDataUrl(logoUrl);
      doc.addImage(base64, "PNG", 10, 8, 25, 12);
    } catch {
      // ignore if logo fails
    }

    // Title
    doc.setFontSize(16);
    doc.text("Sunshine Holiday Packages", pageWidth / 2, 16, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text("Invoice / Booking Receipt", pageWidth / 2, 22, {
      align: "center",
    });

    const bookingShort = bookingId ? `${bookingId.substring(0, 8)}...` : "—";

    const tripNamePDF = trip?.location || "Trip";
    const destinationPDF = trip?.category || "N/A";
    const travelDatePDF = selectedDate
      ? formatDateToString(selectedDate)
      : "N/A";

    let y = 32;
    doc.setFontSize(11);
    doc.text(`Booking ID: ${bookingShort}`, 14, y);
    y += 7;
    doc.text(`Trip: ${tripNamePDF}`, 14, y);
    y += 7;
    doc.text(`Category/Destination: ${destinationPDF}`, 14, y);
    y += 7;
    doc.text(`Travel Date: ${travelDatePDF}`, 14, y);
    y += 10;

    // Passenger summary table
    autoTable(doc, {
      startY: y,
      head: [["Passenger", "Phone", "Email", "Seat(s)"]],
      body: passengers.map((p, idx) => [
        p?.name || "—",
        p?.phoneNumber || "—",
        p?.email || "—",
        // show seat per passenger if seat selection
        totalSeats === 20 || totalSeats === 32
          ? selectedSeats[idx]
            ? (() => {
                const [busIdx, seat] = selectedSeats[idx].split("-");
                return `Bus ${Number(busIdx) + 1} - ${seat}`;
              })()
            : "—"
          : `Passenger ${idx + 1}`,
      ]),
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5, valign: "middle" },
    });

    const afterPassengersY = (doc as any).lastAutoTable.finalY + 8;

    // Payment info table
    autoTable(doc, {
      startY: afterPassengersY,
      head: [["Payment Info", "Value"]],
      body: [
        [
          "Selected Seats / Bus Details",
          (selectedSeatsFormatted || "—").split(" | ").join("\n"),
        ],
        [
          "Total Amount",
          `rs ${Number(totalAmount || 0).toLocaleString("en-IN")}`,
        ],
        ["Paid", `rs ${Number(amountPaid || 0).toLocaleString("en-IN")}`],
        ["Remaining", `rs ${Number(remaining || 0).toLocaleString("en-IN")}`],
        ["Payment Status", String(paymentStatus || "pending").toUpperCase()],
        ["Generated On", new Date().toLocaleString()],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: "middle",
        overflow: "linebreak",
      },
      columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 120 } },
    });

    doc.setFontSize(9);
    doc.text(`Thank you for booking with us!`, 14, pageHeight - 12);

    // Create blob url for manual download
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);

    // filename
    const safeName = String(passengers?.[0]?.name || "Passenger").replace(
      /\s+/g,
      "_",
    );
    const filename = `Invoice_${bookingId?.substring(0, 8) || "BOOK"}_${safeName}.pdf`;

    // Auto download
    doc.save(filename);

    return { url, filename };
  };

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

  console.log("Booking Data:", bookingData);
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
    if (!bookingData?.selectedSeatsByBus) {
      setBookedSeats([]);
      return;
    }

    const mappedBookedSeats: { seat: string; busIndex: number }[] = [];

    Object.entries(bookingData.selectedSeatsByBus).forEach(
      ([busIndex, seats]) => {
        seats.forEach((seat: string) => {
          mappedBookedSeats.push({
            seat,
            busIndex: Number(busIndex),
          });
        });
      },
    );

    setBookedSeats(mappedBookedSeats);
  }, [bookingData]);

  const seatsPerBus = selectedDate?.seats || 0;
  const numberOfBuses = selectedDate?.numberOfBusesAvailable || 1;
  const totalCapacity = seatsPerBus * numberOfBuses;

  useEffect(() => {
    if (selectedDate) {
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
            email: "",
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

  const handleSeatSelect = (seatId: string, busIndex: number) => {
    if (isSubmitting) return;

    const key = `${busIndex}-${seatId}`;

    // 🚫 Block already booked seats
    if (bookedSeats.some((b) => b.seat === seatId && b.busIndex === busIndex)) {
      toast.error("This seat is already booked");
      return;
    }

    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.includes(key);

      // ✅ Allow deselect always
      let updatedSeats = isAlreadySelected
        ? prev.filter((s) => s !== key)
        : prev;

      // 🔒 PACKAGE PERSON LIMIT CHECK (before adding)
      if (!isAlreadySelected && selectedPackage) {
        if (prev.length >= selectedPackage.personCount) {
          toast.error(
            `This package allows only ${selectedPackage.personCount} passengers`,
          );
          return prev; // ❌ stop adding
        }
      }

      // ➕ Add new seat
      if (!isAlreadySelected) {
        updatedSeats = [...updatedSeats, key];
      }

      // 🔄 Sync passengers with seats
      setPassengers((prevPassengers) =>
        updatedSeats.map(
          (_, i) =>
            prevPassengers[i] || {
              name: "",
              age: "",
              gender: "",
              idProof: "",
              idProofNumber: "",
              address: "",
              phoneNumber: "",
              email: "",
            },
        ),
      );

      return updatedSeats;
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

    // 🧠 Total available seats (consider booked + buses)
    const availableSeats =
      selectedDate?.seats && selectedDate?.numberOfBusesAvailable
        ? selectedDate.seats * selectedDate.numberOfBusesAvailable -
          bookedSeats.length
        : 0;

    // 🔒 Package limit (if package selected)
    const packageLimit = selectedPackage
      ? selectedPackage.personCount
      : Infinity;

    // 🔢 Final allowed passengers
    const maxAllowed = Math.min(availableSeats, packageLimit);

    // 🚫 Block if limit reached
    if (passengers.length >= maxAllowed) {
      toast.error(`Only ${maxAllowed} passenger(s) allowed for this booking`);
      return;
    }

    // ➕ Add passenger
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
        email: "",
      },
    ]);

    // 🔄 Auto-select seat if seat-layout trip
    if (
      (selectedDate?.seats === 20 || selectedDate?.seats === 32) &&
      !selectedPackage // package users select seats manually
    ) {
      const totalSeats = selectedDate.seats;
      const totalBuses = Number(selectedDate.numberOfBusesAvailable || 1);

      for (let busIndex = 0; busIndex < totalBuses; busIndex++) {
        for (let seat = 1; seat <= totalSeats; seat++) {
          const key = `${busIndex}-${seat}`;

          const isBooked = bookedSeats.some(
            (b) => b.busIndex === busIndex && b.seat === seat.toString(),
          );

          if (!isBooked && !selectedSeats.includes(key)) {
            setSelectedSeats((prev) => [...prev, key]);
            return;
          }
        }
      }
    }
  };

  const removePassenger = (index: number) => {
    if (isSubmitting) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
    if (
      (selectedPackage || selectedRoomChoice) &&
      (selectedDate?.seats === 20 || selectedDate?.seats === 32)
    ) {
      setSelectedSeats((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validatePassengerDetails = () => {
    return passengers.every(
      (p) =>
        p.name.trim() &&
        p.age &&
        ["male", "female", "other"].includes(p.gender) &&
        ["aadhar", "pan"].includes(p.idProof) &&
        p.idProofNumber.trim() &&
        p.phoneNumber.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email), // ✅ ADD
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

  const handlePayment = async (
    paymentDetail: any,
    amountToPay: number,
    totalAmount: number,
  ) => {
    return new Promise<void>((resolve, reject) => {
      // Safety check
      if (!passengers.length || !passengers[0]?.phoneNumber) {
        toast.error("Please add at least one passenger with a phone number.");
        setIsSubmitting(false);
        reject(new Error("Missing passenger contact"));
        return;
      }

      const options = {
        key: RAZORPAY_API_KEY,
        amount: paymentDetail.amount, // paise
        currency: paymentDetail.currency,
        name: "Sunshine Holiday Packages",
        description: `Booking for ${trip?.location || "Trip"} on ${
          selectedDate ? formatDateToString(selectedDate) : ""
        }`,
        order_id: paymentDetail.id,

        handler: async () => {
          try {
            // -------------------------------
            // 🟢 TRANSFORM SEATS (IMPORTANT)
            // -------------------------------
            const formattedSeats =
              selectedDate?.seats === 20 || selectedDate?.seats === 32
                ? selectedSeats.map((s) => {
                    const [busIndex, seat] = s.split("-");
                    return {
                      seat,
                      busIndex: Number(busIndex),
                    };
                  })
                : passengers.map(() => ({
                    seat: "N/A",
                    busIndex: 0,
                  }));

            // -------------------------------
            // 💰 PAYMENT CALCULATION
            // -------------------------------
            const advancePaymentPercentage =
              trip?.advancePaymentPercentage || 50;

            const advancePaid =
              paymentOption === "advance" ? amountToPay : totalAmount;

            const remainingBalance =
              paymentOption === "advance" ? totalAmount - advancePaid : 0;

            const paymentStatus =
              paymentOption === "advance" ? "advance" : "full";

            // -------------------------------
            // 📦 BOOKING PAYLOAD
            // -------------------------------
            const bookingPayload = {
              tripId,
              selectedPackage: selectedPackage?._id || null,
              selectedRoomChoice: selectedRoomChoice?._id || null,
              roomCount: selectedRoomChoice ? selectedRoomCount : 0,
              price: totalAmount,
              advancePaid,
              remainingBalance,
              paymentStatus,
              selectedDate: formatDateToString(selectedDate),
              passengers,
              selectedSeats: formattedSeats,
            };

            // Final sanity check
            if (!bookingPayload.selectedSeats.length) {
              throw new Error("No seats selected");
            }

            // -------------------------------
            // 🚀 CREATE BOOKING
            // -------------------------------
            await createBooking(bookingPayload).unwrap();

            toast.success("Trip booked successfully 🎉");

            // Open modal and generate invoice
            setInvoiceModalOpen(true);
            setInvoiceGenerating(true);
            setInvoiceError(null);

            try {
              // seats string (group by bus)
              const selectedSeatsFormatted =
                selectedDate?.seats === 20 || selectedDate?.seats === 32
                  ? buildBusSeatVehicleSummary(selectedSeats, selectedDate)
                  : "N/A";

              // payment numbers
              const advancePaid =
                paymentOption === "advance" ? amountToPay : totalAmount;
              const remainingBalance =
                paymentOption === "advance" ? totalAmount - advancePaid : 0;
              const paymentStatus =
                paymentOption === "advance" ? "advance" : "full";

              // ✅ generate invoice pdf + auto download
              const { url, filename } = await generateInvoicePDF({
                bookingId: String(paymentDetail?.id || "BOOKING"),
                paymentStatus,
                totalAmount,
                amountPaid: advancePaid,
                remaining: remainingBalance,
                selectedSeatsFormatted, // ✅ now includes Bus + Vehicle + Instructor
              });

              // store for manual download
              setInvoiceBlobUrl(url);
              setInvoiceFilename(filename);

              setInvoiceGenerating(false);
            } catch (e: any) {
              console.error("Invoice generate error:", e);
              setInvoiceError(
                "Invoice generation failed. You can still continue.",
              );
              setInvoiceGenerating(false);
            }
            // navigate("/trips");
            // resolve();
          } catch (err: any) {
            console.error("Booking creation failed:", err);
            toast.error(
              err?.data?.message ||
                err?.message ||
                "Booking failed. Please try again.",
            );
            setIsSubmitting(false);
            reject(err);
          }
        },

        prefill: {
          name: passengers[0]?.name || "Guest",
          contact: passengers[0]?.phoneNumber?.replace(/\D/g, "") || "",
        },

        notes: {
          trip_id: tripId,
          selected_date: formatDateToString(selectedDate),
          passenger_count: passengers.length,
        },

        theme: {
          color: "#3399cc",
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setIsSubmitting(false);
            reject(new Error("Payment cancelled"));
          },
        },
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response);
        toast.error(
          response.error?.description || "Payment failed. Please try again.",
        );
        setIsSubmitting(false);
        reject(response);
      });

      razorpay.open();
    });
  };

  const handleProceed = async () => {
    if (isSubmitting) return;

    if (
      step === "select-seats" &&
      (selectedDate?.seats === 20 || selectedDate?.seats === 32)
    ) {
      if (selectedSeats.length === 0) {
        toast.error("Please select at least one seat.");
        return;
      }
      if (selectedPackage || selectedRoomChoice) {
        if (selectedSeats.length !== passengers.length) {
          toast.error(
            "Number of selected seats must match number of passengers.",
          );
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
          })),
        );
      }
      setStep("passenger-details");
    } else {
      if (!validatePassengerDetails()) {
        toast.error("Please fill in all passenger details with valid values.");
        return;
      }

      if (
        (selectedPackage || selectedRoomChoice) &&
        (selectedDate?.seats === 20 || selectedDate?.seats === 32) &&
        selectedSeats.length !== passengers.length
      ) {
        toast.error(
          "Number of selected seats must match number of passengers.",
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const numPassengers =
          selectedDate?.seats === 20 || selectedDate?.seats === 32
            ? selectedSeats.length
            : passengers.length;
        const baseSeatPrice = parseInt(trip?.price) || 1000;
        let basePrice = selectedPackage
          ? selectedPackage.price
          : baseSeatPrice * numPassengers;

        const hasDiscount =
          trip?.discountPercentage !== undefined &&
          trip.discountPercentage > 0 &&
          trip.discountPercentage <= 100;
        if (hasDiscount) {
          basePrice = basePrice * (1 - trip.discountPercentage / 100);
        }

        const roomPrice = selectedRoomChoice
          ? selectedRoomChoice.price * selectedRoomCount
          : 0;
        const totalPrice = basePrice + roomPrice;
        const totalGst = totalPrice * 0.05;
        const finalAmount = totalPrice + totalGst;
        const advancePaymentPercentage = trip?.advancePaymentPercentage || 50;
        const amountToPay =
          paymentOption === "advance"
            ? finalAmount * (advancePaymentPercentage / 100)
            : finalAmount;

        if (isNaN(totalPrice) || isNaN(totalGst) || isNaN(finalAmount)) {
          throw new Error("Invalid amount calculation");
        }

        const respPayment = await createPayment({
          amount: amountToPay,
        }).unwrap();

        if (respPayment.success) {
          await handlePayment(
            respPayment.paymentDetail,
            amountToPay,
            finalAmount,
          );
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        toast.error(
          error.message || error.data?.message || "Payment processing failed.",
        );
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
  const maxAvailableSeats =
    selectedPackage || selectedRoomChoice
      ? Math.min(
          totalSeats - bookedSeats.length,
          selectedPackage?.personCount || 0,
        )
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
            {step === "select-seats"
              ? "Select Your Seats"
              : "Passenger Details"}
          </h1>
          <p className="text-gray-600">
            {step === "select-seats"
              ? `Choose ${
                  selectedPackage || selectedRoomChoice
                    ? `up to ${selectedPackage?.personCount || 0}`
                    : "your"
                } seats for your journey`
              : `Enter details for up to ${maxAvailableSeats} passenger(s)`}
          </p>
        </motion.div>
        <Dialog
          open={invoiceModalOpen}
          onOpenChange={(v) => !invoiceGenerating && setInvoiceModalOpen(v)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {invoiceGenerating
                  ? "Generating Invoice..."
                  : "Invoice Ready ✅"}
              </DialogTitle>
              <DialogDescription>
                {invoiceGenerating
                  ? "Please stay on this screen until your invoice is generated and downloaded."
                  : "Your invoice has been generated. If auto-download didn’t work, use the manual download button."}
              </DialogDescription>
            </DialogHeader>

            {invoiceError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {invoiceError}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              {/* Manual download */}
              <Button
                type="button"
                variant="outline"
                disabled={!invoiceBlobUrl || invoiceGenerating}
                onClick={() => {
                  if (!invoiceBlobUrl) return;
                  const a = document.createElement("a");
                  a.href = invoiceBlobUrl;
                  a.download = invoiceFilename || "invoice.pdf";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
              >
                Manual Download
              </Button>

              {/* Continue */}
              <Button
                type="button"
                disabled={invoiceGenerating}
                onClick={() => {
                  setInvoiceModalOpen(false);
                  // cleanup blob url
                  if (invoiceBlobUrl) {
                    URL.revokeObjectURL(invoiceBlobUrl);
                    setInvoiceBlobUrl(null);
                  }
                  // Navigate after invoice step
                  navigate("/trips");
                }}
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === "select-seats" &&
            (totalSeats === 20 || totalSeats === 32) ? (
              <SeatLayout
                numberOfBuses={numberOfBuses}
                totalSeats={totalSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                bookedSeats={bookedSeats}
                seatPrice={tripDetails.baseSeatPrice}
                disabled={isSubmitting}
                vehicles={selectedDate?.vehicles}
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
                {!(totalSeats === 20 || totalSeats === 32) &&
                  maxAvailableSeats > passengers.length && (
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
                {step === "passenger-details" &&
                  (totalSeats === 20 || totalSeats === 32) && (
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
              numberOfBuses={numberOfBuses}
              seatsPerBus={seatsPerBus}
              totalCapacity={totalCapacity}
              bookedSeats={bookedSeats}
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
              /** ✅ NEW */
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              showTermsModal={showTermsModal}
              setShowTermsModal={setShowTermsModal}
              termsContent={termsData?.terms?.content || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// SeatLayout Component
const Seat = ({
  id,
  isBooked,
  isSelected,
  onSelect,
  price,
  totalSeats,
}: any) => {
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
  onSeatSelect: (seatId: string, busIndex: number) => void;
  bookedSeats: { seat: string; busIndex: number }[];
  seatPrice: number;
  totalSeats: number;
  numberOfBuses: number;
  disabled?: boolean;
}

const SeatLayout = ({
  selectedSeats,
  onSeatSelect,
  bookedSeats,
  seatPrice,
  totalSeats,
  numberOfBuses,
  disabled = false,
  vehicles,
}: SeatLayoutProps) => {
  const [isTwoSeaterLayout, setIsTwoSeaterLayout] = useState(
    totalSeats !== 20 ? true : false,
  );
  console.log(`isTwoSeaterLayout: ${totalSeats}`);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [currentBus, setCurrentBus] = useState(0);
  const v = vehicles?.[currentBus];

  const isBlockBooking = selectedSeats.includes("block");
  const bookedSeatsForBus = bookedSeats
    .filter((b) => b.busIndex === currentBus)
    .map((b) => b.seat);

  const isCurrentBusFull = bookedSeatsForBus.length >= totalSeats;

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
  useEffect(() => {
    if (isCurrentBusFull && currentBus < numberOfBuses - 1) {
      setCurrentBus((prev) => prev + 1);
    }
  }, [isCurrentBusFull, currentBus, numberOfBuses]);
  const handleSeatClick = (seatId: string) => {
    onSeatSelect(seatId, currentBus);
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
      {isCurrentBusFull && (
        <p className="text-green-600 text-sm mb-3 text-center">
          This bus is fully booked. Moving to next bus…
        </p>
      )}

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
      <span className="font-semibold">
        Bus {currentBus + 1} of {numberOfBuses}
        <span className="ml-2 text-sm text-gray-600">
          (Instructor: {v?.instructorName || "—"} • {v?.vehicleNumber || "—"} •{" "}
          {v?.phoneNumber || "—"})
        </span>
      </span>

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
                    isBooked={bookedSeatsForBus.includes(seatId)}
                    isSelected={selectedSeats.includes(
                      `${currentBus}-${seatId}`,
                    )}
                    onSelect={() => handleSeatClick(seatId)}
                  />
                ) : (
                  <div className="w-10 h-16"></div>
                )}
              </div>
            )),
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setCurrentBus((b) => Math.max(0, b - 1))}
          disabled={currentBus === 0}
          variant="outline"
        >
          Previous Bus
        </Button>

        <span className="font-semibold">
          Bus {currentBus + 1} of {numberOfBuses}
        </span>

        <Button
          onClick={() =>
            setCurrentBus((b) => Math.min(numberOfBuses - 1, b + 1))
          }
          disabled={currentBus === numberOfBuses - 1}
          variant="outline"
        >
          Next Bus
        </Button>
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
    email: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    name: "",
    age: "",
    gender: "",
    idProof: "",
    idProofNumber: "",
    phoneNumber: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    const trimmedValue = value.trim();

    const updatedData: PassengerData = {
      ...passengers[index],
      [name]: trimmedValue,
    };

    onChange(index, updatedData);

    // ---------------------------
    // 🧪 VALIDATIONS
    // ---------------------------
    let hasError = false;
    let errorMessage = "";

    // Empty check
    if (trimmedValue === "") {
      hasError = true;
      errorMessage = `Please enter ${name.replace(/([A-Z])/g, " $1")}`;
    }

    // Gender validation
    if (
      name === "gender" &&
      trimmedValue &&
      !["male", "female", "other"].includes(trimmedValue)
    ) {
      hasError = true;
      errorMessage = "Please select a valid gender";
    }

    // ID proof validation
    if (
      name === "idProof" &&
      trimmedValue &&
      !["aadhar", "pan"].includes(trimmedValue)
    ) {
      hasError = true;
      errorMessage = "Please select a valid ID proof type";
    }

    // Age validation
    if (name === "age" && trimmedValue) {
      const ageNumber = Number(trimmedValue);
      if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 150) {
        hasError = true;
        errorMessage = "Please enter a valid age";
      }
    }

    // Phone number validation (10–15 digits)
    if (name === "phoneNumber" && trimmedValue) {
      if (!/^\d{10,15}$/.test(trimmedValue)) {
        hasError = true;
        errorMessage = "Please enter a valid phone number";
      }
    }

    // Email validation
    if (name === "email" && trimmedValue) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        hasError = true;
        errorMessage = "Please enter a valid email address";
      }
    }

    // ---------------------------
    // 🛑 SET ERRORS
    // ---------------------------
    setErrors((prev) => ({
      ...prev,
      [name]: hasError,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const hasBoardingPoints =
    tripDetails.boardingPoints && tripDetails.boardingPoints.length > 0;

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
          {errors.name && (
            <p className="text-red-500 text-xs">{errorMessages.name}</p>
          )}
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
          {errors.age && (
            <p className="text-red-500 text-xs">{errorMessages.age}</p>
          )}
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
          {errors.gender && (
            <p className="text-red-500 text-xs">{errorMessages.gender}</p>
          )}
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
          {errors.idProof && (
            <p className="text-red-500 text-xs">{errorMessages.idProof}</p>
          )}
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
          {errors.idProofNumber && (
            <p className="text-red-500 text-xs">
              {errorMessages.idProofNumber}
            </p>
          )}
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
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs">{errorMessages.phoneNumber}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={passengers[index]?.email || ""}
            onChange={handleChange}
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : ""
            }`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errorMessages.email}</p>
          )}
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
  numberOfBuses,
  totalCapacity,
  bookedSeats,
  acceptedTerms,
  setAcceptedTerms,
  showTermsModal,
  setShowTermsModal,
  termsContent,
}: BookingSummaryProps) => {
  const totalSeats = selectedDate?.seats || 0;
  console.log("Total Seats:", totalSeats);
  const isSeatSelection = totalSeats === 20 || totalSeats === 32;
  const numPassengers = isSeatSelection
    ? selectedSeats.length
    : passengers.length;

  // Debugging log
  console.log("BookingSummary props:", {
    disabled,
    selectedRoomCount,
    numPassengers,
  });
  const getBusVehicle = (busIndex: number) => {
    const v = selectedDate?.vehicles?.[busIndex];
    return {
      instructorName: v?.instructorName || "—",
      vehicleNumber: v?.vehicleNumber || "—",
      phoneNumber: v?.phoneNumber || "—", // ✅ NEW
    };
  };

  let basePrice = selectedPackage
    ? selectedPackage.price
    : (tripDetails.baseSeatPrice || 1000) * numPassengers;
  const hasDiscount =
    tripDetails.discountPercentage !== undefined &&
    tripDetails.discountPercentage > 0 &&
    tripDetails.discountPercentage <= 100;
  const originalBasePrice = basePrice;
  if (hasDiscount) {
    basePrice = basePrice * (1 - tripDetails.discountPercentage / 100);
  }

  const roomPrice = selectedRoomChoice
    ? selectedRoomChoice.price * selectedRoomCount
    : 0;
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
      className={`bg-white rounded-xl shadow-lg p-6 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
      <div className="flex justify-between mb-2">
        <span>Total Buses</span>
        <span>{numberOfBuses}</span>
      </div>

      <div className="flex justify-between mb-2">
        <span>Total Capacity</span>
        <span>{totalCapacity} seats</span>
      </div>

      <div className="flex justify-between mb-2">
        <span>Available Seats</span>
        <span>{totalCapacity - bookedSeats.length}</span>
      </div>

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
                (date) => formatDateWithSeats(date) === e.target.value,
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
                          After: ₹
                          {Math.round(
                            pkg.price *
                              (1 - tripDetails.discountPercentage / 100),
                          ).toLocaleString("en-IN")}
                        </span>
                        <br />
                        <span className="text-green-600">
                          {tripDetails.discountPercentage}% off
                        </span>
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
                  } ${
                    index === 0 ? "cursor-pointer opacity-75" : "cursor-pointer"
                  }`}
                  onClick={() => !disabled && setSelectedRoomChoice(room)}
                >
                  <h4 className="font-semibold">{room.type}</h4>
                  <p className="text-sm text-gray-600">{room.description}</p>
                  <p className="text-sm font-medium mt-2">
                    ₹{room.price.toLocaleString("en-IN")} x{" "}
                    {selectedRoomChoice?._id === room._id
                      ? selectedRoomCount
                      : 1}{" "}
                    {selectedRoomChoice?._id === room._id &&
                    selectedRoomCount > 1
                      ? "rooms"
                      : "room"}
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
            <span>
              {isSeatSelection && (
                <div className="flex justify-between mb-2 gap-4">


                  <span className="text-right">
                    {selectedSeats.length === 0
                      ? "None"
                      : Object.entries(
                          selectedSeats.reduce(
                            (acc: Record<number, number[]>, seat) => {
                              const [busIndex, seatNo] = seat
                                .split("-")
                                .map(Number);
                              if (!acc[busIndex]) acc[busIndex] = [];
                              acc[busIndex].push(seatNo);
                              return acc;
                            },
                            {},
                          ),
                        )
                          .map(([busIndexStr, seats]) => {
                            const busIndex = Number(busIndexStr);
                     

                            return `Bus ${busIndex + 1}: ${seats
                              .sort((a, b) => a - b)
                              .join(
                                ", ",
                              )} `;
                          })
                          .join(" | ")}
                  </span>
                </div>
              )}
            </span>
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
            <span>
              Room Price ({selectedRoomCount}{" "}
              {selectedRoomCount > 1 ? "rooms" : "room"})
            </span>
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
            <span>
              ₹
              {(finalAmount * (advancePaymentPercentage / 100)).toLocaleString(
                "en-IN",
              )}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-start gap-2 mb-4">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          disabled={disabled || loading}
          className="mt-1"
        />

        <p className="text-sm text-gray-700">
          I agree to{" "}
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => setShowTermsModal(true)}
          >
            Terms & Conditions
          </span>
        </p>
      </div>
      <Button
        onClick={() => !disabled && onProceed()}
        disabled={
          !acceptedTerms || // 🔒 NEW
          (isSeatSelection &&
            selectedSeats.length === 0 &&
            step === "select-seats") ||
          !selectedDate ||
          loading ||
          disabled
        }
        className={`w-full relative ${
          (isSeatSelection &&
            selectedSeats.length === 0 &&
            step === "select-seats") ||
          !selectedDate ||
          loading ||
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading && <FaSpinner className="animate-spin inline mr-2" />}
        Proceed to{" "}
        {isSeatSelection && step === "select-seats"
          ? "Passenger Details"
          : "Payment"}
      </Button>
      <TermsModal
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        content={termsContent}
      />
    </motion.div>
  );
};

export default BookingPage;
