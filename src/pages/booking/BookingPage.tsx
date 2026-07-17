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
import { useTranslation } from "react-i18next";
import {
  bookableSeatsPerBus,
  maxBookableSeatNumber,
  totalBookableCapacity,
} from "@/utils/seatCapacity";
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
  minSeatsPerBooking?: number; // ✅ ADD
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
    maplink?: string;
  }[];
  price: string;
  discountPercentage?: number;
  advancePaymentPercentage?: number;
}

/** Match passenger.address to trip boarding point and build Maps URL */
const resolvePickupMapInfo = (
  address: string | undefined,
  boardingPoints: {
    location?: string;
    time?: string;
    details?: string;
    maplink?: string;
  }[] = [],
) => {
  const addr = String(address || "").trim();
  const points = boardingPoints || [];
  let point =
    points.find((p) => String(p?.location || "").trim() === addr) || null;
  if (!point && addr) {
    point =
      points.find((p) => {
        const loc = String(p?.location || "").trim();
        return (
          addr.startsWith(loc) || addr.includes(loc) || loc.includes(addr)
        );
      }) || null;
  }
  if (!point && points.length === 1) point = points[0];

  const location = point?.location || addr || "";
  const time = point?.time || "";
  const details = point?.details || "";
  let mapUrl = String(point?.maplink || "").trim();
  if (!mapUrl && location) {
    mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location,
    )}`;
  }
  return { location, time, details, mapUrl };
};

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
  const { t } = useTranslation();
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

    // Pickup locations + Google Maps links (per passenger)
    const boardingPoints = trip?.boardingPoints || [];
    const pickupBody = passengers.map((p) => {
      const info = resolvePickupMapInfo(p?.address, boardingPoints);
      return [
        p?.name || "—",
        info.location
          ? `${info.location}${info.time ? ` (${info.time})` : ""}`
          : p?.address || "—",
        info.mapUrl || "—",
      ];
    });

    autoTable(doc, {
      startY: afterPassengersY,
      head: [["Passenger", "Pickup Location", "Google Maps Link"]],
      body: pickupBody,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        valign: "middle",
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { cellWidth: 80 },
      },
      didDrawCell: (data: any) => {
        // Make Maps URL clickable in the PDF
        if (
          data.section === "body" &&
          data.column.index === 2 &&
          typeof data.cell.raw === "string" &&
          data.cell.raw.startsWith("http")
        ) {
          const url = data.cell.raw as string;
          doc.link(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            { url },
          );
        }
      },
    });

    const afterPickupY = (doc as any).lastAutoTable.finalY + 6;

    // Highlight primary map link for easy tap on mobile PDF readers
    const primaryPickup = resolvePickupMapInfo(
      passengers[0]?.address,
      boardingPoints,
    );
    let paymentStartY = afterPickupY;
    if (primaryPickup.mapUrl) {
      doc.setFontSize(10);
      doc.setTextColor(194, 65, 12);
      doc.text("Open primary pickup in Google Maps:", 14, afterPickupY + 4);
      doc.setTextColor(37, 99, 235);
      doc.textWithLink("Tap / click here →", 14, afterPickupY + 10, {
        url: primaryPickup.mapUrl,
      });
      doc.setTextColor(0, 0, 0);
      paymentStartY = afterPickupY + 16;
    }

    // Payment info table
    autoTable(doc, {
      startY: paymentStartY,
      head: [["Payment Info", "Value"]],
      body: [
        [
          "Selected Seats / Bus Details",
          (selectedSeatsFormatted || "—").split(" | ").join("\n"),
        ],
        [
          "Pickup Location",
          primaryPickup.location
            ? `${primaryPickup.location}${
                primaryPickup.time ? ` (${primaryPickup.time})` : ""
              }`
            : passengers[0]?.address || "—",
        ],
        ["Google Maps (Pickup)", primaryPickup.mapUrl || "—"],
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
      didDrawCell: (data: any) => {
        if (
          data.section === "body" &&
          data.column.index === 1 &&
          data.row.index === 2 &&
          typeof data.cell.raw === "string" &&
          data.cell.raw.startsWith("http")
        ) {
          doc.link(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            { url: data.cell.raw },
          );
        }
      },
    });

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Thank you for booking with us! Use the Google Maps link for your pickup point.`,
      14,
      pageHeight - 12,
    );

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

  const [createBooking] = useCreatebookingMutation();
  const [createPayment] = useCreatePaymentIntentMutation();

  // Interconnection helpers (available after trip loads; re-evaluated each render)
  const ic = (trip as any)?.interconnection || tripData?.trip?.interconnection;
  const isStayInterconnected =
    Boolean(ic?.enabled) && ic?.role === "stay";
  const stayDayOffset = Math.max(1, Number(ic?.dayOffset) || 1);

  const selectedDateApi = selectedDate ? formatDateForAPI(selectedDate) : "";

  // Day-trip / default seat occupancy (also used for outbound/return IC via backend merge)
  const {
    data: bookingData,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useSelectedDateBookingQuery(
    {
      trip_id: tripId,
      selectedDate: selectedDateApi,
      leg: "single",
    },
    { skip: !tripId || !selectedDateApi || isStayInterconnected },
  );

  // Stay package: dual maps (Going + Coming) — same start date, different legs
  const { data: goingBookingData, isLoading: goingLoading } =
    useSelectedDateBookingQuery(
      {
        trip_id: tripId,
        selectedDate: selectedDateApi,
        leg: "going",
      },
      { skip: !tripId || !selectedDateApi || !isStayInterconnected },
    );
  const { data: comingBookingData, isLoading: comingLoading } =
    useSelectedDateBookingQuery(
      {
        trip_id: tripId,
        selectedDate: selectedDateApi,
        leg: "coming",
      },
      { skip: !tripId || !selectedDateApi || !isStayInterconnected },
    );

  const [selectedGoingSeats, setSelectedGoingSeats] = useState<string[]>([]);
  const [selectedComingSeats, setSelectedComingSeats] = useState<string[]>([]);
  const [bookedGoingSeats, setBookedGoingSeats] = useState<
    { seat: string; busIndex: number }[]
  >([]);
  const [bookedComingSeats, setBookedComingSeats] = useState<
    { seat: string; busIndex: number }[]
  >([]);

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

  const mapSeatsByBus = (data: any) => {
    const mapped: { seat: string; busIndex: number }[] = [];
    if (!data?.selectedSeatsByBus) return mapped;
    Object.entries(data.selectedSeatsByBus).forEach(
      ([busIndex, seats]: any) => {
        (seats as string[]).forEach((seat: string) => {
          mapped.push({ seat, busIndex: Number(busIndex) });
        });
      },
    );
    return mapped;
  };

  useEffect(() => {
    if (isStayInterconnected) return;
    setBookedSeats(mapSeatsByBus(bookingData));
  }, [bookingData, isStayInterconnected]);

  useEffect(() => {
    if (!isStayInterconnected) return;
    setBookedGoingSeats(mapSeatsByBus(goingBookingData));
  }, [goingBookingData, isStayInterconnected]);

  useEffect(() => {
    if (!isStayInterconnected) return;
    setBookedComingSeats(mapSeatsByBus(comingBookingData));
  }, [comingBookingData, isStayInterconnected]);
  const minSeatsPerBooking = selectedDate?.minSeatsPerBooking || 1;
  // Configured size is 20/32; bookable excludes blocked driver seat (19/31)
  const configuredSeatsPerBus =
    typeof selectedDate?.seats === "number" ? selectedDate.seats : 0;
  const seatsPerBus = bookableSeatsPerBus(configuredSeatsPerBus);
  const numberOfBuses = Math.max(
    1,
    Number(selectedDate?.numberOfBusesAvailable || 1) || 1,
  );
  const totalCapacity = totalBookableCapacity(
    configuredSeatsPerBus,
    numberOfBuses,
  );

  useEffect(() => {
    if (selectedDate) {
      const totalSeats = selectedDate.seats;
      const stayIC =
        Boolean(
          (trip as any)?.interconnection?.enabled ||
            tripData?.trip?.interconnection?.enabled,
        ) &&
        ((trip as any)?.interconnection?.role === "stay" ||
          tripData?.trip?.interconnection?.role === "stay");

      // Stay interconnected always uses dual seat maps
      if (stayIC || totalSeats === 20 || totalSeats === 32) {
        setStep(INITIAL_STEP);
        setSelectedSeats([]);
        setSelectedGoingSeats([]);
        setSelectedComingSeats([]);
        if (!selectedPackage && !selectedRoomChoice) {
          setPassengers([]);
        }
      } else {
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
      }
    }
  }, [selectedDate, selectedPackage, selectedRoomChoice, trip, tripData]);

  // Handlers
  const changeDate = (date: StartDate) => {
    setSelectedDate(date);
    setSelectedSeats([]);
    setSelectedGoingSeats([]);
    setSelectedComingSeats([]);
    if (!selectedPackage && !selectedRoomChoice) {
      setPassengers([]);
    }
  };

  const handleGoingSeatSelect = (seatId: string, busIndex: number) => {
    if (isSubmitting) return;
    const key = `${busIndex}-${seatId}`;
    if (
      bookedGoingSeats.some(
        (b) => b.busIndex === busIndex && b.seat === seatId,
      )
    ) {
      toast.error("This seat is already booked (Going)");
      return;
    }
    setSelectedGoingSeats((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
  };

  const handleComingSeatSelect = (seatId: string, busIndex: number) => {
    if (isSubmitting) return;
    const key = `${busIndex}-${seatId}`;
    if (
      bookedComingSeats.some(
        (b) => b.busIndex === busIndex && b.seat === seatId,
      )
    ) {
      toast.error("This seat is already booked (Coming)");
      return;
    }
    setSelectedComingSeats((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key],
    );
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

    // 🧠 Total available seats (bookable only — driver seat excluded)
    const availableSeats =
      selectedDate?.seats && selectedDate?.numberOfBusesAvailable
        ? totalBookableCapacity(
            selectedDate.seats,
            selectedDate.numberOfBusesAvailable,
          ) - bookedSeats.length
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
      const maxSeat = maxBookableSeatNumber(selectedDate.seats);
      const totalBuses = Number(selectedDate.numberOfBusesAvailable || 1);

      for (let busIndex = 0; busIndex < totalBuses; busIndex++) {
        for (let seat = 1; seat <= maxSeat; seat++) {
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
    return passengers.every((p) => {
      const fullName = (p.name || "").trim() ||
        [p.title, p.firstName, p.lastName].filter(Boolean).join(" ").trim();
      return (
        !!fullName &&
        p.age &&
        ["male", "female", "other"].includes(p.gender as string) &&
        ["aadhar", "pan"].includes(p.idProof as string) &&
        (p.idProofNumber || "").trim() &&
        (p.phoneNumber || "").trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || "")
      );
    });
  };

  const formatSeatLabel = (seatKey: string) => {
    const [busIndex, seat] = seatKey.split("-");
    return `Bus ${Number(busIndex) + 1} · Seat ${seat}`;
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
            const formattedSeats = isStayInterconnected
              ? [
                  ...selectedGoingSeats.map((s) => {
                    const [busIndex, seat] = s.split("-");
                    return {
                      seat,
                      busIndex: Number(busIndex),
                      leg: "going" as const,
                    };
                  }),
                  ...selectedComingSeats.map((s) => {
                    const [busIndex, seat] = s.split("-");
                    return {
                      seat,
                      busIndex: Number(busIndex),
                      leg: "coming" as const,
                    };
                  }),
                ]
              : selectedDate?.seats === 20 || selectedDate?.seats === 32
                ? selectedSeats.map((s) => {
                    const [busIndex, seat] = s.split("-");
                    return {
                      seat,
                      busIndex: Number(busIndex),
                      leg: "single" as const,
                    };
                  })
                : passengers.map(() => ({
                    seat: "N/A",
                    busIndex: 0,
                    leg: "single" as const,
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

  const isSeatTrip =
    isStayInterconnected ||
    selectedDate?.seats === 20 ||
    selectedDate?.seats === 32;

  // ---------------------------
  // ✅ STAY INTERCONNECTION RULES
  // ---------------------------
  if (isStayInterconnected && step === "select-seats") {
    if (selectedGoingSeats.length === 0 || selectedComingSeats.length === 0) {
      toast.error("Please select seats for both Going and Coming.");
      return;
    }
    if (selectedGoingSeats.length !== selectedComingSeats.length) {
      toast.error(
        "Number of Going seats must match number of Coming seats.",
      );
      return;
    }
    if (selectedGoingSeats.length < minSeatsPerBooking) {
      toast.error(
        `You must select at least ${minSeatsPerBooking} seat(s) on each leg.`,
      );
      return;
    }
    setPassengers(
      selectedGoingSeats.map(() => ({
        name: "",
        age: "",
        gender: "",
        idProof: "",
        idProofNumber: "",
        address: "",
        phoneNumber: "",
        email: "",
      })),
    );
    setStep("passenger-details");
    return;
  }

  // ---------------------------
  // ✅ MINIMUM SEAT RULE
  // ---------------------------
  if (isSeatTrip && !isStayInterconnected && selectedSeats.length < minSeatsPerBooking) {
    toast.error(
      `You must select at least ${minSeatsPerBooking} seat(s) to continue.`,
    );
    return;
  }

  // ---------------------------
  // ✅ PACKAGE SEAT RULE
  // Only when a seat map exists (20/32 seats). Without a seat map the user
  // cannot pick seats, so do not enforce exact seat count.
  // ---------------------------
  if (
    isSeatTrip &&
    !isStayInterconnected &&
    selectedPackage &&
    selectedSeats.length !== selectedPackage.personCount
  ) {
    toast.error(
      `This package requires exactly ${selectedPackage.personCount} seat(s).`,
    );
    return;
  }

  // ---------------------------
  // STEP 1 → SEAT SELECTION
  // ---------------------------
  if (step === "select-seats" && isSeatTrip && !isStayInterconnected) {
    if (selectedPackage || selectedRoomChoice) {
      if (selectedSeats.length !== passengers.length) {
        toast.error(
          "Number of selected seats must match number of passengers.",
        );
        return;
      }
    } else {
      // auto create passengers based on seats
      setPassengers(
        selectedSeats.map(() => ({
          name: "",
          age: "",
          gender: "",
          idProof: "",
          idProofNumber: "",
          address: "",
          phoneNumber: "",
          email: "",
        })),
      );
    }

    setStep("passenger-details");
    return;
  }

  // ---------------------------
  // STEP 2 → PASSENGER DETAILS
  // ---------------------------
  if (!validatePassengerDetails()) {
    toast.error("Please fill in all passenger details with valid values.");
    return;
  }

  if (isStayInterconnected) {
    if (
      selectedGoingSeats.length !== passengers.length ||
      selectedComingSeats.length !== passengers.length
    ) {
      toast.error(
        "Going and Coming seats must match the number of passengers.",
      );
      return;
    }
  } else if (
    (selectedPackage || selectedRoomChoice) &&
    isSeatTrip &&
    selectedSeats.length !== passengers.length
  ) {
    toast.error("Number of selected seats must match number of passengers.");
    return;
  }

  // ---------------------------
  // 🚀 START PAYMENT PROCESS
  // ---------------------------
  setIsSubmitting(true);

  try {
    const numPassengers = isStayInterconnected
      ? selectedGoingSeats.length
      : isSeatTrip
        ? selectedSeats.length
        : passengers.length;

    const baseSeatPrice = parseInt(trip?.price) || 1000;

    let basePrice = selectedPackage
      ? selectedPackage.price
      : baseSeatPrice * numPassengers;

    // ---------------------------
    // DISCOUNT
    // ---------------------------
    const hasDiscount =
      trip?.discountPercentage !== undefined &&
      trip.discountPercentage > 0 &&
      trip.discountPercentage <= 100;

    if (hasDiscount) {
      basePrice = basePrice * (1 - trip.discountPercentage / 100);
    }

    // ---------------------------
    // ROOM PRICE
    // ---------------------------
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

    // ---------------------------
    // CREATE PAYMENT ORDER
    // ---------------------------
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
      error?.message || error?.data?.message || "Payment processing failed.",
    );

    setIsSubmitting(false);
  }
};

  if (
    tripLoading ||
    (selectedDate &&
      (isStayInterconnected
        ? goingLoading || comingLoading
        : bookingLoading))
  ) {
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

  // Raw configured size (20/32) — used to pick layout; bookable is 19/31
  const goingConfiguredSeats =
    Number(goingBookingData?.stats?.seatsPerBus) ||
    (typeof selectedDate?.seats === "number" ? selectedDate.seats : 0) ||
    20;
  const comingConfiguredSeats =
    Number(comingBookingData?.stats?.seatsPerBus) || goingConfiguredSeats;
  const goingSeatsPerBus = bookableSeatsPerBus(goingConfiguredSeats);
  const comingSeatsPerBus = bookableSeatsPerBus(comingConfiguredSeats);
  const goingBuses = Math.max(
    1,
    Number(goingBookingData?.stats?.numberOfBusesAvailable) || 1,
  );
  const comingBuses = Math.max(
    1,
    Number(comingBookingData?.stats?.numberOfBusesAvailable) || 1,
  );

  const configuredTotalSeats = isStayInterconnected
    ? goingConfiguredSeats
    : selectedDate?.seats || Number(tripDetails.busSize);
  // Keep totalSeats as configured size for layout detection (20 vs 32)
  const totalSeats = configuredTotalSeats;
  const bookableCapacity = isStayInterconnected
    ? goingSeatsPerBus * goingBuses
    : totalBookableCapacity(configuredTotalSeats, numberOfBuses);
  const maxAvailableSeats =
    selectedPackage || selectedRoomChoice
      ? Math.min(
          Math.max(0, bookableCapacity - bookedSeats.length),
          selectedPackage?.personCount || 0,
        )
      : Math.max(0, bookableCapacity - bookedSeats.length);

  const isSeatLayoutTrip =
    isStayInterconnected ||
    Number(totalSeats) === 20 ||
    Number(totalSeats) === 32;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center space-x-4">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="text-lg">{t("booking.processing")}</span>
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
              ? t("booking.selectSeats")
              : t("booking.passengerDetails")}
          </h1>
          <p className="text-gray-600">
            {step === "select-seats"
              ? selectedPackage || selectedRoomChoice
                ? t("booking.chooseSeatsUpTo", {
                    count: selectedPackage?.personCount || 0,
                  })
                : t("booking.chooseSeats")
              : t("booking.enterDetails", { count: maxAvailableSeats })}
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
            {step === "select-seats" && isStayInterconnected ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-violet-200 bg-violet-50/60 px-4 py-3 text-sm text-violet-900">
                  <p className="font-semibold">Interconnected stay package</p>
                  <p className="mt-0.5 text-violet-800/80">
                    Select seats for <strong>Going</strong> (shares Saturday
                    bus) and <strong>Coming</strong> (shares Sunday bus). Same
                    seats cannot be booked on linked day trips.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-orange-200 bg-white p-2 shadow-sm">
                    <h3 className="mb-2 px-2 pt-2 text-center text-sm font-bold text-orange-700">
                      Select seat for Going
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        Mahabaleshwar outbound bus
                      </span>
                    </h3>
                    <SeatLayout
                      numberOfBuses={goingBuses}
                      totalSeats={
                        goingConfiguredSeats === 32 ||
                        goingConfiguredSeats === 20
                          ? goingConfiguredSeats
                          : 20
                      }
                      selectedSeats={selectedGoingSeats}
                      onSeatSelect={handleGoingSeatSelect}
                      bookedSeats={bookedGoingSeats}
                      seatPrice={tripDetails.baseSeatPrice}
                      disabled={isSubmitting}
                      vehicles={
                        (ic as any)?.outboundTripPopulated?.startDates?.find(
                          (d: any) => d.date === selectedDateApi,
                        )?.vehicles || selectedDate?.vehicles
                      }
                    />
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-white p-2 shadow-sm">
                    <h3 className="mb-2 px-2 pt-2 text-center text-sm font-bold text-sky-700">
                      Select seat for Coming
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        Return bus (+{stayDayOffset} day
                        {stayDayOffset === 1 ? "" : "s"})
                      </span>
                    </h3>
                    <SeatLayout
                      numberOfBuses={comingBuses}
                      totalSeats={
                        comingConfiguredSeats === 32 ||
                        comingConfiguredSeats === 20
                          ? comingConfiguredSeats
                          : 20
                      }
                      selectedSeats={selectedComingSeats}
                      onSeatSelect={handleComingSeatSelect}
                      bookedSeats={bookedComingSeats}
                      seatPrice={tripDetails.baseSeatPrice}
                      disabled={isSubmitting}
                      vehicles={
                        (ic as any)?.returnTripPopulated?.startDates?.[0]
                          ?.vehicles || selectedDate?.vehicles
                      }
                    />
                  </div>
                </div>
                {(selectedGoingSeats.length > 0 ||
                  selectedComingSeats.length > 0) && (
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-800">
                      Going: {selectedGoingSeats.join(", ") || "—"}
                    </span>
                    <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800">
                      Coming: {selectedComingSeats.join(", ") || "—"}
                    </span>
                  </div>
                )}
              </div>
            ) : step === "select-seats" &&
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
              <div className="space-y-5">
                {/* Attractive passenger details header for seat bookings */}
                {step === "passenger-details" &&
                  (totalSeats === 20 || totalSeats === 32) && (
                    <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-white shadow-md">
                      <h2 className="text-xl font-bold tracking-tight">
                        Passengers Details
                      </h2>
                      <p className="mt-1 text-sm text-orange-50">
                        Please note: provide valid passenger details for each
                        selected seat.
                      </p>
                      {selectedSeats.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedSeats.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur"
                            >
                              {formatSeatLabel(s)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                {/* Passenger cards */}
                <div className="space-y-4">
                  {passengers.map((_, index) => (
                    <div key={index} className="relative">
                      <PassengerForm
                        tripDetails={tripDetails}
                        seatNumber={
                          selectedSeats[index]
                            ? formatSeatLabel(selectedSeats[index])
                            : `Passenger ${index + 1}`
                        }
                        index={index}
                        onChange={handlePassengerChange}
                        passengers={passengers}
                        hideAddress={
                          !!(
                            step === "passenger-details" &&
                            (totalSeats === 20 || totalSeats === 32) &&
                            tripDetails.boardingPoints?.length
                          )
                        }
                        showSeatBadge={
                          !!(
                            selectedSeats[index] ||
                            totalSeats === 20 ||
                            totalSeats === 32
                          )
                        }
                      />
                      {passengers.length > 1 &&
                        !(totalSeats === 20 || totalSeats === 32) && (
                          <Button
                            onClick={() => removePassenger(index)}
                            className="absolute right-3 top-3 z-10 bg-red-500 text-white hover:bg-red-600"
                            disabled={isSubmitting}
                            size="sm"
                          >
                            Remove
                          </Button>
                        )}
                    </div>
                  ))}
                </div>

                {/* Shared pickup address card (seat booking) */}
                {step === "passenger-details" &&
                  (totalSeats === 20 || totalSeats === 32) &&
                  tripDetails.boardingPoints?.length > 0 && (
                    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900">
                        Passenger Address
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Select pickup location for all passengers (you can
                        change per passenger if needed below).
                      </p>
                      <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Select pickup location *
                        </label>
                        <select
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                          value={passengers[0]?.address || ""}
                          onChange={(e) => {
                            const loc = e.target.value;
                            setPassengers((prev) =>
                              prev.map((p) => ({ ...p, address: loc })),
                            );
                          }}
                          disabled={isSubmitting}
                        >
                          <option value="">Select Pickup Location</option>
                          {tripDetails.boardingPoints.map((point) => (
                            <option key={point._id} value={point.location}>
                              {point.location} - {point.time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                {!(totalSeats === 20 || totalSeats === 32) &&
                  maxAvailableSeats > passengers.length && (
                    <Button
                      onClick={addPassenger}
                      className="rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                      disabled={isSubmitting}
                    >
                      Add Members
                    </Button>
                  )}

                {!(totalSeats === 20 || totalSeats === 32) && (
                  <p className="text-sm text-gray-600">
                    {maxAvailableSeats} seat(s) available
                  </p>
                )}

                {step === "passenger-details" &&
                  (totalSeats === 20 || totalSeats === 32) && (
                    <Button
                      onClick={handleGoBack}
                      variant="outline"
                      className="rounded-xl border-slate-200"
                      disabled={isSubmitting}
                    >
                      ← Back to Seat Selection
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
  const busesCount = Math.max(1, Number(numberOfBuses) || 1);
  const [currentBus, setCurrentBus] = useState(0);
  const v = vehicles?.[currentBus];
  // Driver seat is blocked: 20→19 bookable, 32→31 bookable
  const bookablePerBus = bookableSeatsPerBus(totalSeats);

  const isBlockBooking = selectedSeats.includes("block");
  const bookedSeatsForBus = bookedSeats
    .filter((b) => Number(b.busIndex) === currentBus)
    .map((b) => b.seat);

  const isCurrentBusFull = bookedSeatsForBus.length >= bookablePerBus;

  useEffect(() => {
    setIsTwoSeaterLayout(totalSeats === 32);
  }, [totalSeats]);

  // Open the first bus that still has free seats (skip full buses)
  useEffect(() => {
    if (busesCount <= 1 || !bookablePerBus) return;
    for (let bus = 0; bus < busesCount; bus++) {
      const bookedOnBus = bookedSeats.filter(
        (b) => Number(b.busIndex) === bus,
      ).length;
      if (bookedOnBus < bookablePerBus) {
        setCurrentBus((prev) => (prev !== bus ? bus : prev));
        return;
      }
    }
    // All buses full — stay on last
    setCurrentBus((prev) =>
      prev !== busesCount - 1 ? busesCount - 1 : prev,
    );
  }, [bookedSeats, busesCount, bookablePerBus]);

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
      {isCurrentBusFull && currentBus < busesCount - 1 && (
        <p className="text-green-600 text-sm mb-3 text-center">
          This bus is fully booked. Showing next bus with free seats…
        </p>
      )}
      {isCurrentBusFull && currentBus === busesCount - 1 && (
        <p className="text-amber-600 text-sm mb-3 text-center">
          All seats on this bus are booked.
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
        Bus {currentBus + 1} of {busesCount}
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
          Bus {currentBus + 1} of {busesCount}
        </span>

        <Button
          onClick={() =>
            setCurrentBus((b) => Math.min(busesCount - 1, b + 1))
          }
          disabled={currentBus === busesCount - 1}
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
  console.log("Booked Seats:", selectedDate);
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

  const cardClass =
    "rounded-2xl border border-orange-100 bg-white p-5 shadow-sm";

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={`space-y-4 ${disabled ? "opacity-50" : ""}`}
    >
      {/* Tour Summary */}
      <div className={cardClass}>
        <h3 className="mb-3 text-lg font-bold text-slate-900">Tour Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Total Buses</span>
            <span className="font-semibold text-slate-800">{numberOfBuses}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Capacity</span>
            <span className="font-semibold text-slate-800">
              {totalCapacity} seats
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Available</span>
            <span className="font-semibold text-green-600">
              {Math.max(0, totalCapacity - bookedSeats.length)}
            </span>
          </div>
          <div className="flex items-start gap-2 border-t border-slate-100 pt-3 text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <span className="font-medium">
              {tripDetails.from} → {tripDetails.to}
            </span>
          </div>
          {selectedDate?.minSeatsPerBooking > 1 && (
            <p className="text-xs font-medium text-orange-600">
              Minimum booking: {selectedDate.minSeatsPerBooking} seats
            </p>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Select date
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100"
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
        </div>
      </div>

      {/* Packages */}
      {tripDetails.packages.length > 0 && (
        <div className={cardClass}>
          <h3 className="mb-3 text-lg font-bold text-slate-900">
            Select Packages
          </h3>
          <div className="grid gap-3">
            {tripDetails.packages.map((pkg) => (
              <div
                key={pkg._id}
                className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                  selectedPackage?._id === pkg._id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-orange-200 hover:bg-orange-50/40"
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
      {/* Rooms */}
      {tripDetails.roomChoices.length > 0 && (
        <div className={cardClass}>
          <h3 className="mb-3 text-lg font-bold text-slate-900">Room Choice</h3>
          <div className="grid gap-3">
            {tripDetails.roomChoices.map((room, index) => (
              <div
                key={`${room._id}-${selectedRoomCount}`}
                className={`relative cursor-pointer rounded-xl border p-3 transition-colors ${
                  selectedRoomChoice?._id === room._id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:bg-orange-50/40"
                }`}
                onClick={() => !disabled && setSelectedRoomChoice(room)}
              >
                <h4 className="font-semibold text-slate-900">{room.type}</h4>
                <p className="text-sm text-slate-600">{room.description}</p>
                <p className="mt-1 text-sm font-medium text-orange-600">
                  ₹{room.price.toLocaleString("en-IN")} ×{" "}
                  {selectedRoomChoice?._id === room._id
                    ? selectedRoomCount
                    : 1}
                </p>
                {selectedRoomChoice?._id === room._id && (
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addRoom();
                      }}
                      className="rounded-full bg-green-500 p-2 text-white hover:bg-green-600"
                      disabled={disabled}
                    >
                      <FaPlus size={12} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoom();
                      }}
                      className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                      disabled={disabled || selectedRoomCount <= 1}
                    >
                      <FaMinus size={12} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className={cardClass}>
        <h3 className="mb-3 text-lg font-bold text-slate-900">
          Price Breakdown
        </h3>

        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payment options
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-orange-50/50">
              <input
                type="radio"
                name="paymentOption"
                value="full"
                checked={paymentOption === "full"}
                onChange={() => setPaymentOption("full")}
                disabled={disabled || loading}
                className="text-orange-500 focus:ring-orange-400"
              />
              Full Payment
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-orange-50/50">
              <input
                type="radio"
                name="paymentOption"
                value="advance"
                checked={paymentOption === "advance"}
                onChange={() => setPaymentOption("advance")}
                disabled={disabled || loading}
                className="text-orange-500 focus:ring-orange-400"
              />
              Advance Payment ({advancePaymentPercentage}%)
            </label>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
          {isSeatSelection && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-600">Selected seats</span>
              <span className="max-w-[55%] text-right font-medium text-slate-800">
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
                          .join(", ")}`;
                      })
                      .join(" | ")}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Passengers</span>
            <span className="font-medium text-slate-800">{numPassengers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">
              {selectedPackage ? "Package price" : "Seat price"}
            </span>
            {hasDiscount ? (
              <div className="text-right">
                <span className="mr-1 text-xs text-slate-400 line-through">
                  ₹{originalBasePrice.toLocaleString("en-IN")}
                </span>
                <span className="font-medium">
                  ₹{Math.round(basePrice).toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <span className="font-medium">
                ₹{basePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {selectedRoomChoice && (
            <div className="flex justify-between">
              <span className="text-slate-600">
                Room ({selectedRoomCount})
              </span>
              <span className="font-medium">
                ₹{roomPrice.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Total</span>
            <span className="font-medium">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">GST (5%)</span>
            <span className="font-medium">
              ₹{totalGst.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between border-t border-orange-100 pt-3 text-base font-bold">
            <span className="text-slate-900">Final amount</span>
            <span className="text-orange-600">
              ₹{finalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          {paymentOption === "advance" && (
            <div className="flex justify-between font-semibold text-orange-700">
              <span>Pay now ({advancePaymentPercentage}%)</span>
              <span>
                ₹
                {(
                  finalAmount *
                  (advancePaymentPercentage / 100)
                ).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className={cardClass}>
        <h3 className="mb-3 text-lg font-bold text-slate-900">
          Terms & Conditions
        </h3>
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={disabled || loading}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
          />
          <span className="text-sm text-slate-700">
            I have read and agreed to all the{" "}
            <button
              type="button"
              className="font-semibold text-orange-600 underline"
              onClick={() => setShowTermsModal(true)}
            >
              Terms & Conditions
            </button>{" "}
            of Sunshine Holiday Packages.
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="mt-3 w-full rounded-xl border border-orange-200 bg-orange-50 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
        >
          Cancellation Policy
        </button>
      </div>

      {/* Need help */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-sm">
        <h3 className="text-lg font-bold">Need Help?</h3>
        <p className="mt-1 text-sm text-orange-50">
          Questions about booking? We&apos;re here to help.
        </p>
        <a
          href="tel:+919975375975"
          className="mt-3 block rounded-xl bg-white/15 px-3 py-2 text-center text-sm font-bold backdrop-blur hover:bg-white/25"
        >
          +91 9975375975
        </a>
      </div>

      <Button
        onClick={() => !disabled && onProceed()}
        disabled={
          !acceptedTerms ||
          (isSeatSelection &&
            selectedSeats.length < (selectedDate?.minSeatsPerBooking || 1) &&
            step === "select-seats") ||
          !selectedDate ||
          loading ||
          disabled
        }
        className={`w-full rounded-xl py-6 text-base font-bold shadow-md ${
          (isSeatSelection &&
            selectedSeats.length === 0 &&
            step === "select-seats") ||
          !selectedDate ||
          loading ||
          disabled ||
          !acceptedTerms
            ? "cursor-not-allowed bg-slate-300 text-slate-500"
            : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
        }`}
      >
        {loading && <FaSpinner className="mr-2 inline animate-spin" />}
        {isSeatSelection && step === "select-seats"
          ? "Proceed to Passenger Details"
          : "Proceed to Payment"}
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
