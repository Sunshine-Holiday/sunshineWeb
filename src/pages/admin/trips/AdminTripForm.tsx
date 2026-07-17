import React, { useEffect, useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format as formatDate, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Wifi, Coffee, Snowflake, Power, AudioLines } from "lucide-react";
import { enUS } from "date-fns/locale";
import { useCreatetripsMutation, useGettripsQuery } from "@/store/api/trips";
import { toast } from "react-toastify";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import BoardingPointsEditor from "@/components/admin/BoardingPointsEditor";
import InterconnectionEditor, {
  defaultInterconnection,
  type InterconnectionConfig,
} from "@/components/admin/InterconnectionEditor";
import { getStateOptions } from "@/utils/tripDestinations";

// =====================
// CALENDAR LOCALIZER
// =====================
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format: (date, formatStr) => formatDate(date, formatStr, { locale: enUS }),
  parse: (dateStr, formatStr) =>
    parse(dateStr, formatStr, new Date(), { locale: enUS }),
  startOfWeek,
  getDay,
  locales,
});

// =====================
// TYPES
// =====================
interface BoardingPoint {
  location: string;
  time: string;
  details: string;
  maplink: string;
}

interface VehicleInput {
  instructorName: string;
  vehicleNumber: string;
  phoneNumber: string; // ✅ NEW
}

interface StartDate {
  date: Date;
  seats: number | "block";
  numberOfBusesAvailable: number;
  vehicles: VehicleInput[]; // ✅ NEW
    minSeatsPerBooking: number; // ✅ NEW

}

interface Package {
  title: string;
  description: string;
  personCount: number;
  price: number;
}

interface RoomChoice {
  description: string;
  roomCount: number;
  price: number;
}

interface TripDetails {
  title: string;
  location: string;
  /** Destination state for navbar / destination page filtering */
  state: string;
  duration: string;
  description: string;
  startDates: StartDate[];
  price: number;
  category: string;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  packages: Package[];
  roomChoices: RoomChoice[];
  file?: File | null;
  advancePaymentPercentage?: number;
  discountPercentage?: number;
  /** Details page content */
  highlights: string[];
  includes: string[];
  mapLink: string;
  cancellationPolicy: string;
  faqs: { question: string; answer: string }[];
  brochureImage?: string;
  brochureFile?: string;
  interconnection: InterconnectionConfig;
}

const OTHER_STATE = "__other__";

interface FormErrors {
  [key: string]: string;
}

// =====================
// AMENITIES
// =====================
const availableAmenities = [
  { icon: AudioLines, name: "Music and Fun" },
  { icon: Wifi, name: "Free WiFi" },
  { icon: Coffee, name: "Refreshments" },
  { icon: Snowflake, name: "AC" },
  { icon: Power, name: "Charging Points" },
];

// =====================
// HELPERS
// =====================
const formatDateToString = (date: Date): string => {
  return formatDate(date, "dd-MM-yyyy");
};

const normalizeToMidnight = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const clampPositiveInt = (v: number, fallback = 1) => {
  if (!Number.isFinite(v)) return fallback;
  const n = Math.trunc(v);
  return n > 0 ? n : fallback;
};

// =====================
// COMPONENT
// =====================
const AdminTripForm: React.FC = () => {
  // ✅ buses count
  const [numberOfBuses, setNumberOfBuses] = useState<number | "">("");
  const [numberOfBusesError, setNumberOfBusesError] = useState<string>("");

  const validateBuses = (value: number | "") => {
    if (value === "") return "Number of buses is required";
    if (!Number.isInteger(value) || value <= 0)
      return "Enter a valid number of buses";
    return "";
  };

  // ✅ NEW: vehicles input list (depends on numberOfBuses)
  const [vehiclesInputs, setVehiclesInputs] = useState<VehicleInput[]>([]);
  const [vehiclesError, setVehiclesError] = useState<string>("");

  const validateVehicles = (buses: number | "", list: VehicleInput[]) => {
    if (buses === "" || buses <= 0) return "Please enter number of buses first";
    if (!Array.isArray(list) || list.length !== buses)
      return `Please add ${buses} vehicle(s)`;

    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      if (!v.instructorName?.trim())
        return `Instructor name is required for Bus #${i + 1}`;
      if (!v.vehicleNumber?.trim())
        return `Vehicle number is required for Bus #${i + 1}`;
      if (!v.phoneNumber?.trim())
        return `Phone number is required for Bus #${i + 1}`; // ✅ NEW
    }
    return "";
  };

  const [createTrips] = useCreatetripsMutation();
  const { data: allTripsData } = useGettripsQuery({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  /** Wizard step: 1 = Basic, 2 = Dates & packages, 3 = Amenities & pickup */
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  /** When user picks "Other", they type a custom state name */
  const [customState, setCustomState] = useState("");
  const [stateSelectValue, setStateSelectValue] = useState("");
const [minSeatsPerBooking, setMinSeatsPerBooking] = useState<number>(1);
const [minSeatsError, setMinSeatsError] = useState<string>("");
const validateMinSeats = (value: number) => {
  if (!value || value < 1) return "Minimum seats must be at least 1";
  return "";
};
  const stateOptions = useMemo(() => {
    const trips = Array.isArray(allTripsData)
      ? allTripsData
      : allTripsData?.data ?? [];
    return getStateOptions(trips);
  }, [allTripsData]);

  const [tripDetails, setTripDetails] = useState<TripDetails>({
    title: "",
    location: "",
    state: "",
    duration: "",
    description: "",
    startDates: [],
    price: 0,
    category: "",
    amenities: [],
    boardingPoints: [{ location: "", time: "", details: "", maplink: "" }],
    packages: [],
    roomChoices: [],
    file: null,
    advancePaymentPercentage: undefined,
    discountPercentage: undefined,
    highlights: [""],
    includes: [""],
    mapLink: "",
    cancellationPolicy: "",
    faqs: [{ question: "", answer: "" }],
    brochureImage: "",
    brochureFile: "",
    interconnection: defaultInterconnection(),
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  /** True when modal is editing an already-saved calendar date (replace on confirm) */
  const [isEditingExistingDate, setIsEditingExistingDate] = useState(false);
  /** Ask Edit / Delete when user taps a date that already has seats */
  const [dateActionOpen, setDateActionOpen] = useState(false);
  const [dateActionTarget, setDateActionTarget] = useState<StartDate | null>(
    null,
  );

  const [selectedSeats, setSelectedSeats] = useState<number | "block" | null>(
    null,
  );
  const [seatSelectionType, setSeatSelectionType] = useState<
    "fixed" | "block" | null
  >(null);
  const [blockSeats, setBlockSeats] = useState<string>("");
  const [blockSeatsError, setBlockSeatsError] = useState<string>("");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
  ];

  const handleChange = (
    field: keyof TripDetails,
    value: string | number | any,
  ) => {
    setTripDetails({ ...tripDetails, [field]: value });
    if (value || (field === "price" && value > 0)) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          file: "Please upload a PNG, JPG, or JPEG file",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: "File size must be less than 5MB" });
        return;
      }
      setTripDetails({ ...tripDetails, file });
      setErrors({ ...errors, file: "" });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field: string) => {
    let newErrors = { ...errors };
    switch (field) {
      case "title":
        if (!tripDetails.title) newErrors.title = "Title is required";
        break;
      case "location":
        if (!tripDetails.location) newErrors.location = "Location is required";
        break;
      case "state":
        if (!tripDetails.state)
          newErrors.state = "State / destination is required";
        break;
      case "description":
        if (!tripDetails.description)
          newErrors.description = "Description is required";
        break;
      case "category":
        if (!tripDetails.category) newErrors.category = "Category is required";
        break;
      case "amenities":
        if (tripDetails.amenities.length === 0)
          newErrors.amenities = "At least one amenity is required";
        break;
      case "file":
        if (!tripDetails.file) newErrors.file = "Banner image is required";
        break;
      case "price":
        if (
          tripDetails.packages.length === 0 &&
          (!tripDetails.price || tripDetails.price <= 0)
        ) {
          newErrors.price = "Price is required when no packages are provided";
        }
        break;
      case "packages":
        if (tripDetails.packages.length === 0 && !tripDetails.price) {
          newErrors.packages =
            "At least one package is required if no single price is provided";
        } else {
          tripDetails.packages.forEach((pkg, index) => {
            if (!pkg.title)
              newErrors[`package-title-${index}`] = "Package title is required";
            if (!pkg.personCount || pkg.personCount <= 0)
              newErrors[`package-personCount-${index}`] =
                "Valid person count is required";
            if (!pkg.price || pkg.price <= 0)
              newErrors[`package-price-${index}`] = "Valid price is required";
          });
        }
        break;
      case "roomChoices":
        tripDetails.roomChoices.forEach((room, index) => {
          if (room.description && (!room.roomCount || room.roomCount <= 0))
            newErrors[`room-roomCount-${index}`] =
              "Valid room count is required";
          if (room.description && (!room.price || room.price <= 0))
            newErrors[`room-price-${index}`] = "Valid price is required";
        });
        break;
      case "advancePaymentPercentage":
        if (
          tripDetails.advancePaymentPercentage !== undefined &&
          (tripDetails.advancePaymentPercentage < 0 ||
            tripDetails.advancePaymentPercentage > 100)
        ) {
          newErrors.advancePaymentPercentage =
            "Advance payment must be between 0 and 100";
        }
        break;
      case "discountPercentage":
        if (
          tripDetails.discountPercentage !== undefined &&
          (tripDetails.discountPercentage < 0 ||
            tripDetails.discountPercentage > 100)
        ) {
          newErrors.discountPercentage = "Discount must be between 0 and 100";
        }
        break;
    }
    setErrors(newErrors);
  };

  const validateBlockSeats = (value: string) => {
    const num = parseInt(value);
    if (!value) return "Number of seats is required";
    if (isNaN(num) || num <= 0) return "Please enter a valid number of seats";
    return "";
  };

  const handleBoardingPointsChange = (points: BoardingPoint[]) => {
    setTripDetails({ ...tripDetails, boardingPoints: points });
    if (points.length > 0 && points.some((p) => p.location && p.time)) {
      setErrors({ ...errors, boardingPoints: "" });
    }
  };

  const handleAddPackage = () => {
    setTripDetails({
      ...tripDetails,
      packages: [
        ...tripDetails.packages,
        { title: "", description: "", personCount: 0, price: 0 },
      ],
      price: 0,
    });
    setErrors({ ...errors, packages: "", price: "" });
  };

  const handleRemovePackage = (index: number) => {
    const updatedPackages = tripDetails.packages.filter((_, i) => i !== index);
    setTripDetails({ ...tripDetails, packages: updatedPackages });
    if (updatedPackages.length === 0) {
      setErrors({
        ...errors,
        packages:
          "At least one package is required if no single price is provided",
      });
    }
    validateField("price");
  };

  const handlePackageChange = (
    index: number,
    field: keyof Package,
    value: string | number,
  ) => {
    const updatedPackages = tripDetails.packages.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg,
    );
    setTripDetails({ ...tripDetails, packages: updatedPackages, price: 0 });
    validateField("packages");
  };

  const handleAddRoomChoice = () => {
    setTripDetails({
      ...tripDetails,
      roomChoices: [
        ...tripDetails.roomChoices,
        { description: "", roomCount: 0, price: 0 },
      ],
    });
  };

  const handleRemoveRoomChoice = (index: number) => {
    const updatedRoomChoices = tripDetails.roomChoices.filter(
      (_, i) => i !== index,
    );
    setTripDetails({ ...tripDetails, roomChoices: updatedRoomChoices });
  };

  const handleRoomChoiceChange = (
    index: number,
    field: keyof RoomChoice,
    value: string | number,
  ) => {
    const updatedRoomChoices = tripDetails.roomChoices.map((room, i) =>
      i === index ? { ...room, [field]: value } : room,
    );
    setTripDetails({ ...tripDetails, roomChoices: updatedRoomChoices });
    validateField("roomChoices");
  };

  // =====================
  // DATE SELECTION
  // =====================
  const openNewDateModal = (normalizedDate: Date) => {
    setIsEditingExistingDate(false);
    setSelectedDate(normalizedDate);
    setSelectedSeats(null);
    setSeatSelectionType(null);
    setBlockSeats("");
    setBlockSeatsError("");
    setNumberOfBuses("");
    setNumberOfBusesError("");
    setMinSeatsPerBooking(1);
    setMinSeatsError("");
    setVehiclesInputs([]);
    setVehiclesError("");
    setIsModalOpen(true);
  };

  const openEditDateModal = (entry: StartDate) => {
    const normalizedDate = normalizeToMidnight(entry.date);
    setIsEditingExistingDate(true);
    setSelectedDate(normalizedDate);

    if (entry.seats === 20 || entry.seats === 32) {
      setSeatSelectionType("fixed");
      setSelectedSeats(entry.seats);
      setBlockSeats("");
      setBlockSeatsError("");
    } else {
      // Custom / block seat count stored as a number (or legacy "block")
      setSeatSelectionType("block");
      setSelectedSeats(null);
      const blockVal =
        entry.seats === "block" ? "" : String(entry.seats ?? "");
      setBlockSeats(blockVal);
      setBlockSeatsError(
        blockVal ? validateBlockSeats(blockVal) : "Number of seats is required",
      );
    }

    setNumberOfBuses(entry.numberOfBusesAvailable || 1);
    setNumberOfBusesError("");
    setMinSeatsPerBooking(entry.minSeatsPerBooking || 1);
    setMinSeatsError("");
    setVehiclesInputs(
      (entry.vehicles || []).map((v) => ({
        instructorName: v.instructorName || "",
        vehicleNumber: v.vehicleNumber || "",
        phoneNumber: v.phoneNumber || "",
      })),
    );
    setVehiclesError("");
    setIsModalOpen(true);
  };

  const handleDateSelection = (date: Date) => {
    const normalizedDate = normalizeToMidnight(date);

    const existingDate = tripDetails.startDates.find(
      (d) => normalizeToMidnight(d.date).getTime() === normalizedDate.getTime(),
    );

    // Already configured → ask Edit or Delete (do not wipe immediately)
    if (existingDate) {
      setDateActionTarget(existingDate);
      setDateActionOpen(true);
      return;
    }

    openNewDateModal(normalizedDate);
  };

  const handleDateActionEdit = () => {
    if (!dateActionTarget) return;
    const entry = dateActionTarget;
    setDateActionOpen(false);
    setDateActionTarget(null);
    openEditDateModal(entry);
  };

  const handleDateActionDelete = () => {
    if (!dateActionTarget) return;
    const targetTime = normalizeToMidnight(dateActionTarget.date).getTime();
    setTripDetails({
      ...tripDetails,
      startDates: tripDetails.startDates.filter(
        (d) => normalizeToMidnight(d.date).getTime() !== targetTime,
      ),
    });
    setDateActionOpen(false);
    setDateActionTarget(null);
  };

  // =====================
  // ✅ NEW: when buses change, auto create inputs
  // =====================
  useEffect(() => {
    if (numberOfBuses === "") {
      setVehiclesInputs([]);
      setVehiclesError("");
      return;
    }

    const err = validateBuses(numberOfBuses);
    setNumberOfBusesError(err);

    if (err) {
      setVehiclesInputs([]);
      setVehiclesError("");
      return;
    }

    const buses = clampPositiveInt(numberOfBuses);

    setVehiclesInputs((prev) => {
      const next = [...prev];

      // extend
      while (next.length < buses) {
        next.push({ instructorName: "", vehicleNumber: "", phoneNumber: "" }); // ✅ NEW
      }

      // shrink
      if (next.length > buses) {
        next.splice(buses);
      }

      return next;
    });

    // re-validate vehicles live
    setVehiclesError((prevErr) => {
      const vErr = validateVehicles(
        buses,
        vehiclesInputs.length === buses ? vehiclesInputs : [],
      );
      return vErr || "";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfBuses]);

  const handleVehicleChange = (
    index: number,
    field: keyof VehicleInput,
    value: string,
  ) => {
    setVehiclesInputs((prev) => {
      const next = prev.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      );
      if (numberOfBuses !== "") {
        const vErr = validateVehicles(numberOfBuses, next);
        setVehiclesError(vErr);
      } else {
        setVehiclesError("");
      }
      return next;
    });
  };

  const resetModalState = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setIsEditingExistingDate(false);

    setSelectedSeats(null);
    setSeatSelectionType(null);
    setBlockSeats("");
    setBlockSeatsError("");

    setNumberOfBuses("");
    setNumberOfBusesError("");
    setMinSeatsPerBooking(1);
    setMinSeatsError("");
    setVehiclesInputs([]);
    setVehiclesError("");
  };

  // =====================
  // ✅ MODAL SUBMIT
  // =====================
  const handleModalSubmit = () => {
    // validate buses
    const busError = validateBuses(numberOfBuses);
    if (busError) {
      setNumberOfBusesError(busError);
      return;
    }

    // validate vehicles
    const vErr = validateVehicles(numberOfBuses, vehiclesInputs);
    if (vErr) {
      setVehiclesError(vErr);
      return;
    }

    if (!selectedDate) return;

    let finalSeats: number | "block" | null = null;

    if (seatSelectionType === "block") {
      const error = validateBlockSeats(blockSeats);
      if (error) {
        setBlockSeatsError(error);
        return;
      }
      finalSeats = parseInt(blockSeats);
    } else {
      finalSeats = selectedSeats;
    }

    if (finalSeats === null) return;

    const newStartDate: StartDate = {
      date: selectedDate,
      seats: finalSeats,
      numberOfBusesAvailable: Number(numberOfBuses),
      minSeatsPerBooking: minSeatsPerBooking,
      vehicles: vehiclesInputs.map((v) => ({
        instructorName: v.instructorName.trim(),
        vehicleNumber: v.vehicleNumber.trim(),
        phoneNumber: v.phoneNumber.trim(),
      })),
    };

    const selectedTime = normalizeToMidnight(selectedDate).getTime();
    // Edit replaces the same date; add appends a new one
    const baseDates = isEditingExistingDate
      ? tripDetails.startDates.filter(
          (d) => normalizeToMidnight(d.date).getTime() !== selectedTime,
        )
      : tripDetails.startDates;

    const newDates = [...baseDates, newStartDate].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    setTripDetails({ ...tripDetails, startDates: newDates });
    setErrors({ ...errors, startDates: "" });

    resetModalState();
  };

  // =====================
  // FORM VALIDATION (per step + full)
  // =====================
  const validateStep = (step: 1 | 2 | 3): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (step === 1) {
      const requiredFields = [
        "title",
        "location",
        "state",
        "description",
        "category",
        "file",
      ] as const;
      requiredFields.forEach((field) => {
        if (!tripDetails[field as keyof TripDetails]) {
          newErrors[field] =
            field === "state"
              ? "State / destination is required"
              : `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          isValid = false;
        }
      });
      if (stateSelectValue === OTHER_STATE && !customState.trim()) {
        newErrors.state = "Please enter a custom state / destination name";
        isValid = false;
      }
      // Price required on step 1 only if no packages will be used —
      // packages are step 2; still require either base price or leave for step 2
      if (
        tripDetails.advancePaymentPercentage !== undefined &&
        (tripDetails.advancePaymentPercentage < 0 ||
          tripDetails.advancePaymentPercentage > 100)
      ) {
        newErrors.advancePaymentPercentage =
          "Advance payment must be between 0 and 100";
        isValid = false;
      }
      if (
        tripDetails.discountPercentage !== undefined &&
        (tripDetails.discountPercentage < 0 ||
          tripDetails.discountPercentage > 100)
      ) {
        newErrors.discountPercentage = "Discount must be between 0 and 100";
        isValid = false;
      }
      // Mark touched so errors show
      setTouched((prev) => ({
        ...prev,
        title: true,
        location: true,
        state: true,
        description: true,
        category: true,
        file: true,
      }));
    }

    if (step === 2) {
      if (tripDetails.startDates.length === 0) {
        newErrors.startDates = "At least one date with seats must be selected";
        isValid = false;
      }

      tripDetails.startDates.forEach((d, idx) => {
        if (!d.numberOfBusesAvailable || d.numberOfBusesAvailable <= 0) {
          newErrors[`startDates-buses-${idx}`] = "Buses count must be > 0";
          isValid = false;
        }
        if (
          !Array.isArray(d.vehicles) ||
          d.vehicles.length !== d.numberOfBusesAvailable
        ) {
          newErrors[`startDates-vehicles-${idx}`] =
            `Date ${formatDateToString(d.date)} must have ${d.numberOfBusesAvailable} vehicle(s)`;
          isValid = false;
        } else {
          d.vehicles.forEach((v, vi) => {
            if (!v.instructorName?.trim()) {
              newErrors[`startDates-${idx}-instructor-${vi}`] =
                `Instructor name missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
              isValid = false;
            }
            if (!v.vehicleNumber?.trim()) {
              newErrors[`startDates-${idx}-vehicle-${vi}`] =
                `Vehicle number missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
              isValid = false;
            }
            if (!v.phoneNumber?.trim()) {
              newErrors[`startDates-${idx}-phone-${vi}`] =
                `Phone number missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
              isValid = false;
            }
          });
        }
      });

      if (
        tripDetails.packages.length === 0 &&
        (!tripDetails.price || tripDetails.price <= 0)
      ) {
        newErrors.price = "Price is required when no packages are provided";
        isValid = false;
      }

      tripDetails.packages.forEach((pkg, index) => {
        if (!pkg.title)
          newErrors[`package-title-${index}`] = "Package title is required";
        if (!pkg.personCount || pkg.personCount <= 0)
          newErrors[`package-personCount-${index}`] =
            "Valid person count is required";
        if (!pkg.price || pkg.price <= 0)
          newErrors[`package-price-${index}`] = "Valid price is required";
      });

      tripDetails.roomChoices.forEach((room, index) => {
        if (room.description && (!room.roomCount || room.roomCount <= 0))
          newErrors[`room-roomCount-${index}`] =
            "Valid room count is required";
        if (room.description && (!room.price || room.price <= 0))
          newErrors[`room-price-${index}`] = "Valid price is required";
      });
    }

    if (step === 3) {
      if (!tripDetails.amenities || tripDetails.amenities.length === 0) {
        newErrors.amenities = "Select at least one amenity";
        isValid = false;
      }
      if (
        !tripDetails.boardingPoints?.length ||
        tripDetails.boardingPoints.every(
          (p) => !p.location?.trim() || !p.time?.trim(),
        )
      ) {
        newErrors.boardingPoints =
          "At least one boarding point with location and time is required";
        isValid = false;
      }
      setTouched((prev) => ({ ...prev, amenities: true }));
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    // Clear keys not in this step's newErrors for cleaner UX when re-validating
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
    }
    return isValid && Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (["title", "location", "state", "description", "category", "file"] as const).forEach(
      (field) => {
        if (!tripDetails[field as keyof TripDetails]) {
          newErrors[field] =
            field === "state"
              ? "State / destination is required"
              : `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
          isValid = false;
        }
      },
    );

    if (tripDetails.startDates.length === 0) {
      newErrors.startDates = "At least one date with seats must be selected";
      isValid = false;
    }

    tripDetails.startDates.forEach((d, idx) => {
      if (!d.numberOfBusesAvailable || d.numberOfBusesAvailable <= 0) {
        newErrors[`startDates-buses-${idx}`] = "Buses count must be > 0";
        isValid = false;
      }
      if (
        !Array.isArray(d.vehicles) ||
        d.vehicles.length !== d.numberOfBusesAvailable
      ) {
        newErrors[`startDates-vehicles-${idx}`] =
          `Date ${formatDateToString(d.date)} must have ${d.numberOfBusesAvailable} vehicle(s)`;
        isValid = false;
      } else {
        d.vehicles.forEach((v, vi) => {
          if (!v.instructorName?.trim()) {
            newErrors[`startDates-${idx}-instructor-${vi}`] =
              `Instructor name missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
            isValid = false;
          }
          if (!v.vehicleNumber?.trim()) {
            newErrors[`startDates-${idx}-vehicle-${vi}`] =
              `Vehicle number missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
            isValid = false;
          }
          if (!v.phoneNumber?.trim()) {
            newErrors[`startDates-${idx}-phone-${vi}`] =
              `Phone number missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
            isValid = false;
          }
        });
      }
    });

    if (
      tripDetails.packages.length === 0 &&
      (!tripDetails.price || tripDetails.price <= 0)
    ) {
      newErrors.price = "Price is required when no packages are provided";
      isValid = false;
    }

    tripDetails.packages.forEach((pkg, index) => {
      if (!pkg.title)
        newErrors[`package-title-${index}`] = "Package title is required";
      if (!pkg.personCount || pkg.personCount <= 0)
        newErrors[`package-personCount-${index}`] =
          "Valid person count is required";
      if (!pkg.price || pkg.price <= 0)
        newErrors[`package-price-${index}`] = "Valid price is required";
    });

    tripDetails.roomChoices.forEach((room, index) => {
      if (room.description && (!room.roomCount || room.roomCount <= 0))
        newErrors[`room-roomCount-${index}`] = "Valid room count is required";
      if (room.description && (!room.price || room.price <= 0))
        newErrors[`room-price-${index}`] = "Valid price is required";
    });

    if (
      tripDetails.advancePaymentPercentage !== undefined &&
      (tripDetails.advancePaymentPercentage < 0 ||
        tripDetails.advancePaymentPercentage > 100)
    ) {
      newErrors.advancePaymentPercentage =
        "Advance payment must be between 0 and 100";
      isValid = false;
    }

    if (
      tripDetails.discountPercentage !== undefined &&
      (tripDetails.discountPercentage < 0 ||
        tripDetails.discountPercentage > 100)
    ) {
      newErrors.discountPercentage = "Discount must be between 0 and 100";
      isValid = false;
    }

    if (!tripDetails.amenities || tripDetails.amenities.length === 0) {
      newErrors.amenities = "Select at least one amenity";
      isValid = false;
    }

    if (
      !tripDetails.boardingPoints?.length ||
      tripDetails.boardingPoints.every(
        (p) => !p.location?.trim() || !p.time?.trim(),
      )
    ) {
      newErrors.boardingPoints =
        "At least one boarding point with location and time is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }
    setCurrentStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =====================
  // SAVE
  // =====================
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", tripDetails.title);
      formData.append("location", tripDetails.location);
      formData.append(
        "state",
        (stateSelectValue === OTHER_STATE
          ? customState.trim()
          : tripDetails.state
        ).trim(),
      );
      formData.append("duration", tripDetails.duration);
      formData.append("description", tripDetails.description);

      // ✅ Include buses + vehicles per date
  formData.append(
  "startDates",
  JSON.stringify(
    tripDetails.startDates.map((d) => ({
      date: formatDateToString(d.date),
      seats: d.seats,
      numberOfBusesAvailable: d.numberOfBusesAvailable,
      minSeatsPerBooking: d.minSeatsPerBooking, // ✅ NEW
      vehicles: d.vehicles,
    })),
  ),
);

      formData.append("price", tripDetails.price.toString());
      formData.append("category", tripDetails.category);
      formData.append(
        "interconnection",
        JSON.stringify({
          enabled: tripDetails.interconnection.enabled,
          role: tripDetails.interconnection.role,
          outboundTrip: tripDetails.interconnection.outboundTrip || null,
          returnTrip: tripDetails.interconnection.returnTrip || null,
          stayTrip: tripDetails.interconnection.stayTrip || null,
          dayOffset: tripDetails.interconnection.dayOffset || 1,
        }),
      );
      formData.append("amenities", JSON.stringify(tripDetails.amenities));
      formData.append(
        "boardingPoints",
        JSON.stringify(tripDetails.boardingPoints),
      );
      formData.append("packages", JSON.stringify(tripDetails.packages));
      formData.append("roomChoices", JSON.stringify(tripDetails.roomChoices));

      // Details page extras
      formData.append(
        "highlights",
        JSON.stringify(
          tripDetails.highlights.map((h) => h.trim()).filter(Boolean),
        ),
      );
      formData.append(
        "includes",
        JSON.stringify(
          tripDetails.includes.map((h) => h.trim()).filter(Boolean),
        ),
      );
      formData.append(
        "faqs",
        JSON.stringify(
          tripDetails.faqs.filter((f) => f.question.trim() && f.answer.trim()),
        ),
      );
      formData.append("mapLink", tripDetails.mapLink || "");
      formData.append(
        "cancellationPolicy",
        tripDetails.cancellationPolicy || "",
      );
      if (tripDetails.brochureImage)
        formData.append("brochureImage", tripDetails.brochureImage);
      if (tripDetails.brochureFile)
        formData.append("brochureFile", tripDetails.brochureFile);

      if (tripDetails.file) formData.append("file", tripDetails.file);

      if (tripDetails.advancePaymentPercentage !== undefined) {
        formData.append(
          "advancePaymentPercentage",
          tripDetails.advancePaymentPercentage.toString(),
        );
      }

      if (tripDetails.discountPercentage !== undefined) {
        formData.append(
          "discountPercentage",
          tripDetails.discountPercentage.toString(),
        );
      }

      await createTrips(formData).unwrap();
      toast.success("Trip created successfully!");
      navigate("/admin/trips");
    } catch (error) {
      toast.error("Unable to create trip.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  const inputClassName = (field: string) =>
    `w-full ${touched[field] && errors[field] ? "border-red-500" : ""}`;

  // calendar events (safe normalize)
  const calendarEvents = useMemo(() => {
    return tripDetails.startDates.map((d, index) => {
      const start = normalizeToMidnight(d.date);
      const end = normalizeToMidnight(d.date);
      const seatsLabel = d.seats === "block" ? "Block" : `${d.seats} Seats`;
      const busesLabel = `${d?.numberOfBusesAvailable || 0} Bus(es)`;

      return {
        id: index,
        start,
        end,
        title: `${formatDateToString(d.date)} • ${seatsLabel} • ${busesLabel}`,
      };
    });
  }, [tripDetails.startDates]);

  const STEPS = [
    { id: 1 as const, title: "Basic Info", desc: "Banner, title & details" },
    { id: 2 as const, title: "Dates & Pricing", desc: "Calendar, packages" },
    { id: 3 as const, title: "Amenities & Pickup", desc: "Facilities & boarding" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Trip
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Complete all 3 steps. You can go back anytime to edit previous
            steps.
          </p>

          {/* ===================== STEP INDICATOR ===================== */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-2">
              {STEPS.map((step, idx) => {
                const active = currentStep === step.id;
                const done = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <button
                      type="button"
                      onClick={() => {
                        // Allow free navigation only to completed/current steps
                        if (step.id <= currentStep) {
                          setCurrentStep(step.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else if (step.id === currentStep + 1) {
                          goNext();
                        }
                      }}
                      className="flex flex-1 flex-col items-center text-center group"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                          done
                            ? "border-orange-500 bg-orange-500 text-white"
                            : active
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {done ? "✓" : step.id}
                      </div>
                      <span
                        className={`mt-2 text-xs font-semibold sm:text-sm ${
                          active || done ? "text-orange-600" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="hidden text-[11px] text-gray-400 sm:block">
                        {step.desc}
                      </span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`mb-6 h-0.5 flex-1 max-w-[80px] ${
                          currentStep > step.id
                            ? "bg-orange-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="mt-3 text-center text-sm text-gray-600">
              Step {currentStep} of 3 — {STEPS[currentStep - 1].title}
            </p>
          </div>

          <div className="space-y-8">
            {/* ===================== STEP 1: BASIC INFO ===================== */}
            {currentStep === 1 && (
            <>
            {/* ===================== BANNER ===================== */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Upload Trip Banner *
              </h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="banner-upload"
                />
                <Label htmlFor="banner-upload" className="cursor-pointer block">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">
                        Drag and drop or click to upload a banner (PNG, JPG,
                        JPEG)
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum file size: 5MB
                      </p>
                    </div>
                  )}
                </Label>
              </div>
              {touched.file && errors.file && (
                <p className="mt-2 text-sm text-red-500">{errors.file}</p>
              )}
            </div>

            {/* ===================== BASIC FIELDS ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  placeholder="Trip Title"
                  value={tripDetails.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  onBlur={() => handleBlur("title")}
                  className={inputClassName("title")}
                />
                {touched.title && errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Pickup / Departure Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Pune, Mumbai"
                  value={tripDetails.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  onBlur={() => handleBlur("location")}
                  className={inputClassName("location")}
                />
                {touched.location && errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State / Destination *</Label>
                <Select
                  value={stateSelectValue}
                  onValueChange={(value) => {
                    setStateSelectValue(value);
                    handleBlur("state");
                    if (value === OTHER_STATE) {
                      handleChange("state", customState.trim());
                    } else {
                      setCustomState("");
                      handleChange("state", value);
                    }
                  }}
                  onOpenChange={() => handleBlur("state")}
                >
                  <SelectTrigger className={inputClassName("state")}>
                    <SelectValue placeholder="Select state / destination" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {stateOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_STATE}>Other (type new)</SelectItem>
                  </SelectContent>
                </Select>
                {stateSelectValue === OTHER_STATE && (
                  <Input
                    className="mt-2"
                    placeholder="Enter new state / destination name"
                    value={customState}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomState(v);
                      handleChange("state", v.trim());
                    }}
                    onBlur={() => handleBlur("state")}
                  />
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Used in Tour navbar filter and destination pages. Pick the
                  trip destination (e.g. Mahabaleshwar), not departure city.
                </p>
                {touched.state && errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={tripDetails.category}
                  onValueChange={(value) => handleChange("category", value)}
                  onOpenChange={() => handleBlur("category")}
                >
                  <SelectTrigger className={inputClassName("category")}>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="One Day Tours">One Day Tours</SelectItem>
                    <SelectItem value="Stay Package">Stay Package</SelectItem>
                    <SelectItem value="Interconnected Tours">
                      Interconnected Tours
                    </SelectItem>
                    <SelectItem value="Domestic Tours">
                      Domestic Tours
                    </SelectItem>
                    <SelectItem value="Educational Tours">
                      Educational Tours
                    </SelectItem>
                  </SelectContent>
                </Select>
                {touched.category && errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Price"
                  value={tripDetails.price || ""}
                  onChange={(e) =>
                    handleChange("price", parseInt(e.target.value) || 0)
                  }
                  onBlur={() => handleBlur("price")}
                  className={inputClassName("price")}
                />
                {touched.price && errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <Label htmlFor="advancePaymentPercentage">
                  Advance Payment Percentage
                </Label>
                <Input
                  id="advancePaymentPercentage"
                  type="number"
                  placeholder="e.g., 20"
                  value={tripDetails.advancePaymentPercentage ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "advancePaymentPercentage",
                      e.target.value === ""
                        ? undefined
                        : parseFloat(e.target.value),
                    )
                  }
                  onBlur={() => handleBlur("advancePaymentPercentage")}
                  className={inputClassName("advancePaymentPercentage")}
                />
                {touched.advancePaymentPercentage &&
                  errors.advancePaymentPercentage && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.advancePaymentPercentage}
                    </p>
                  )}
              </div>

              <div>
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  placeholder="e.g., 10"
                  value={tripDetails.discountPercentage ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "discountPercentage",
                      e.target.value === ""
                        ? undefined
                        : parseFloat(e.target.value),
                    )
                  }
                  onBlur={() => handleBlur("discountPercentage")}
                  className={inputClassName("discountPercentage")}
                />
                {touched.discountPercentage && errors.discountPercentage && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.discountPercentage}
                  </p>
                )}
              </div>
            </div>

            {/* ===================== DESCRIPTION ===================== */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Trip Description *</h2>
              <ReactQuill
                theme="snow"
                value={tripDetails.description}
                onChange={(value) => handleChange("description", value)}
                onBlur={() => handleBlur("description")}
                modules={quillModules}
                formats={quillFormats}
                className={`border ${
                  touched.description && errors.description
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg`}
                style={{ height: "200px", marginBottom: "40px" }}
              />
              {touched.description && errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <InterconnectionEditor
              value={tripDetails.interconnection}
              onChange={(next) =>
                setTripDetails((prev) => ({ ...prev, interconnection: next }))
              }
              trips={(Array.isArray(allTripsData)
                ? allTripsData
                : (allTripsData as any)?.data ?? []
              ).map((t: any) => ({
                _id: t._id,
                title: t.title,
                category: t.category,
                state: t.state,
              }))}
            />
            </>
            )}

            {/* ===================== STEP 2: DATES & PRICING ===================== */}
            {currentStep === 2 && (
            <>
            {/* ===================== CALENDAR ===================== */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Select Trip Dates *
              </h2>
              <p className="mb-2 text-sm text-slate-500">
                Click an empty day to add seats. Click an existing date to edit
                or delete buses and vehicles.
              </p>
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                selectable
                onSelectSlot={(slotInfo) => handleDateSelection(slotInfo.start)}
                onSelectEvent={(event) =>
                  handleDateSelection(
                    (event as { start?: Date }).start || new Date(),
                  )
                }
                views={["month"]}
                defaultView="month"
                className="rounded-lg border border-gray-300"
                style={{ height: 500 }}
                startAccessor="start"
                endAccessor="end"
                min={today}
              />

              {errors.startDates && (
                <p className="mt-2 text-sm text-red-500">{errors.startDates}</p>
              )}

              {tripDetails.startDates.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700">
                    Selected Dates:
                  </h3>
                  <ul className="mt-2 space-y-2 text-gray-600">
                    {tripDetails.startDates.map((d, index) => (
                      <li
                        key={index}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 list-none hover:border-orange-300 hover:bg-orange-50"
                        onClick={() => {
                          setDateActionTarget(d);
                          setDateActionOpen(true);
                        }}
                      >
                        <div className="font-medium text-slate-800">
                          {formatDateToString(d.date)} —{" "}
                          {d.seats === "block" ? "Block" : `${d.seats} Seats`} —{" "}
                          {d.numberOfBusesAvailable} Bus(es)
                          <span className="ml-2 text-xs font-normal text-orange-600">
                            Tap to edit / delete
                          </span>
                        </div>
                        {Array.isArray(d.vehicles) && d.vehicles.length > 0 ? (
                          <div className="mt-1 text-sm text-gray-500">
                            {d.vehicles.map((v, vi) => (
                              <div key={vi}>
                                Bus #{vi + 1}: {v.instructorName} •{" "}
                                {v.vehicleNumber} • {v.phoneNumber}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ===================== PACKAGES ===================== */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Packages {tripDetails.packages.length === 0 ? "" : "*"}
              </h2>

              {tripDetails.packages.map((pkg, index) => (
                <div
                  key={index}
                  className="relative mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`package-title-${index}`}>
                        Package Title *
                      </Label>
                      <Input
                        id={`package-title-${index}`}
                        placeholder="e.g., Family Package"
                        value={pkg.title}
                        onChange={(e) =>
                          handlePackageChange(index, "title", e.target.value)
                        }
                        onBlur={() => validateField("packages")}
                      />
                      {errors[`package-title-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`package-title-${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`package-personCount-${index}`}>
                        Person Count *
                      </Label>
                      <Input
                        id={`package-personCount-${index}`}
                        type="number"
                        placeholder="e.g., 4"
                        value={pkg.personCount || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            "personCount",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        onBlur={() => validateField("packages")}
                      />
                      {errors[`package-personCount-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`package-personCount-${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`package-price-${index}`}>Price *</Label>
                      <Input
                        id={`package-price-${index}`}
                        type="number"
                        placeholder="e.g., 7900"
                        value={pkg.price || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            "price",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        onBlur={() => validateField("packages")}
                      />
                      {errors[`package-price-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`package-price-${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`package-description-${index}`}>
                        Description
                      </Label>
                      <Input
                        id={`package-description-${index}`}
                        placeholder="Package Description"
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemovePackage(index)}
                  >
                    <FaTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {errors.packages && (
                <p className="mt-2 text-sm text-red-500">{errors.packages}</p>
              )}
              <Button onClick={handleAddPackage} className="mt-2">
                Add Package
              </Button>
            </div>

            {/* ===================== ROOM CHOICES ===================== */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Room Choices</h2>
              {tripDetails.roomChoices.map((room, index) => (
                <div
                  key={index}
                  className="relative mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`room-description-${index}`}>
                        Room Description
                      </Label>
                      <Input
                        id={`room-description-${index}`}
                        placeholder="e.g., 1 room"
                        value={room.description}
                        onChange={(e) =>
                          handleRoomChoiceChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        onBlur={() => validateField("roomChoices")}
                      />
                      {errors[`room-description-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`room-description-${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`room-roomCount-${index}`}>
                        Room Count
                      </Label>
                      <Input
                        id={`room-roomCount-${index}`}
                        type="number"
                        placeholder="e.g., 1"
                        value={room.roomCount || ""}
                        onChange={(e) =>
                          handleRoomChoiceChange(
                            index,
                            "roomCount",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        onBlur={() => validateField("roomChoices")}
                      />
                      {errors[`room-roomCount-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`room-roomCount-${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`room-price-${index}`}>Price</Label>
                      <Input
                        id={`room-price-${index}`}
                        type="number"
                        placeholder="e.g., 2000"
                        value={room.price || ""}
                        onChange={(e) =>
                          handleRoomChoiceChange(
                            index,
                            "price",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        onBlur={() => validateField("roomChoices")}
                      />
                      {errors[`room-price-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`room-price-${index}`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveRoomChoice(index)}
                  >
                    <FaTrash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddRoomChoice} className="mt-2">
                Add Room Choice
              </Button>
            </div>
            </>
            )}

            {/* ===================== STEP 3: AMENITIES & PICKUP ===================== */}
            {currentStep === 3 && (
            <>
            {/* ===================== AMENITIES ===================== */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities *</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {availableAmenities.map((amenity) => (
                  <div
                    key={amenity.name}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={amenity.name}
                      checked={tripDetails.amenities.includes(amenity.name)}
                      onCheckedChange={(checked) => {
                        const newAmenities = checked
                          ? [...tripDetails.amenities, amenity.name]
                          : tripDetails.amenities.filter(
                              (a) => a !== amenity.name,
                            );
                        handleChange("amenities", newAmenities);
                        validateField("amenities");
                      }}
                    />
                    <Label
                      htmlFor={amenity.name}
                      className="flex items-center space-x-2"
                    >
                      <amenity.icon className="h-5 w-5 text-gray-600" />
                      <span>{amenity.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
              {touched.amenities && errors.amenities && (
                <p className="mt-2 text-sm text-red-500">{errors.amenities}</p>
              )}
            </div>

            {/* ===================== BOARDING POINTS ===================== */}
            <BoardingPointsEditor
              boardingPoints={tripDetails.boardingPoints}
              onChange={handleBoardingPointsChange}
              error={errors.boardingPoints}
            />

            {/* Map link for details page */}
            <div>
              <Label htmlFor="mapLink">Tour map link (Google Maps)</Label>
              <Input
                id="mapLink"
                placeholder="https://maps.google.com/..."
                value={tripDetails.mapLink}
                onChange={(e) =>
                  setTripDetails({ ...tripDetails, mapLink: e.target.value })
                }
              />
            </div>

            {/* Highlights */}
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Highlights of the Trip
              </h2>
              <p className="mb-3 text-sm text-gray-500">
                Point-wise highlights shown on the trip details page.
              </p>
              {tripDetails.highlights.map((h, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <Input
                    placeholder={`Highlight ${i + 1}`}
                    value={h}
                    onChange={(e) => {
                      const next = [...tripDetails.highlights];
                      next[i] = e.target.value;
                      setTripDetails({ ...tripDetails, highlights: next });
                    }}
                  />
                  {tripDetails.highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setTripDetails({
                          ...tripDetails,
                          highlights: tripDetails.highlights.filter(
                            (_, j) => j !== i,
                          ),
                        })
                      }
                    >
                      <FaTrash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-1"
                onClick={() =>
                  setTripDetails({
                    ...tripDetails,
                    highlights: [...tripDetails.highlights, ""],
                  })
                }
              >
                Add highlight
              </Button>
            </div>

            {/* Includes */}
            <div>
              <h2 className="mb-2 text-xl font-semibold">
                Trip Price Includes
              </h2>
              {tripDetails.includes.map((h, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <Input
                    placeholder={`Include ${i + 1}`}
                    value={h}
                    onChange={(e) => {
                      const next = [...tripDetails.includes];
                      next[i] = e.target.value;
                      setTripDetails({ ...tripDetails, includes: next });
                    }}
                  />
                  {tripDetails.includes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setTripDetails({
                          ...tripDetails,
                          includes: tripDetails.includes.filter(
                            (_, j) => j !== i,
                          ),
                        })
                      }
                    >
                      <FaTrash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-1"
                onClick={() =>
                  setTripDetails({
                    ...tripDetails,
                    includes: [...tripDetails.includes, ""],
                  })
                }
              >
                Add include item
              </Button>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="mb-2 text-xl font-semibold">FAQs</h2>
              {tripDetails.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="relative mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <Input
                    className="mb-2"
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => {
                      const next = [...tripDetails.faqs];
                      next[i] = { ...next[i], question: e.target.value };
                      setTripDetails({ ...tripDetails, faqs: next });
                    }}
                  />
                  <Input
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...tripDetails.faqs];
                      next[i] = { ...next[i], answer: e.target.value };
                      setTripDetails({ ...tripDetails, faqs: next });
                    }}
                  />
                  {tripDetails.faqs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() =>
                        setTripDetails({
                          ...tripDetails,
                          faqs: tripDetails.faqs.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <FaTrash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setTripDetails({
                    ...tripDetails,
                    faqs: [
                      ...tripDetails.faqs,
                      { question: "", answer: "" },
                    ],
                  })
                }
              >
                Add FAQ
              </Button>
            </div>

            {/* Cancellation */}
            <div>
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <textarea
                id="cancellationPolicy"
                rows={3}
                className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Cancellation and refund rules..."
                value={tripDetails.cancellationPolicy}
                onChange={(e) =>
                  setTripDetails({
                    ...tripDetails,
                    cancellationPolicy: e.target.value,
                  })
                }
              />
            </div>

            {/* Brochure URLs (upload paths after manual upload, or full URL) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="brochureImage">Brochure image path/URL</Label>
                <Input
                  id="brochureImage"
                  placeholder="uploads/... or https://..."
                  value={tripDetails.brochureImage || ""}
                  onChange={(e) =>
                    setTripDetails({
                      ...tripDetails,
                      brochureImage: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="brochureFile">Brochure download path/URL</Label>
                <Input
                  id="brochureFile"
                  placeholder="uploads/brochure.pdf"
                  value={tripDetails.brochureFile || ""}
                  onChange={(e) =>
                    setTripDetails({
                      ...tripDetails,
                      brochureFile: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            </>
            )}

            {/* ===================== STEP NAVIGATION ===================== */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={currentStep === 1 || loading}
                className="w-full sm:w-auto"
              >
                ← Back
              </Button>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 sm:w-auto"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 sm:min-w-[160px]"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                      "Save Trip"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================== EDIT / DELETE DATE ===================== */}
        <Dialog
          open={dateActionOpen}
          onOpenChange={(open) => {
            setDateActionOpen(open);
            if (!open) setDateActionTarget(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dateActionTarget
                  ? formatDateToString(dateActionTarget.date)
                  : "Date"}{" "}
                already configured
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              This date already has seats
              {dateActionTarget
                ? ` (${
                    dateActionTarget.seats === "block"
                      ? "Block"
                      : `${dateActionTarget.seats} seats`
                  }, ${dateActionTarget.numberOfBusesAvailable} bus(es))`
                : ""}
              . Do you want to edit buses / vehicles, or delete this date?
            </p>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateActionOpen(false);
                  setDateActionTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDateActionDelete}>
                Delete
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleDateActionEdit}
              >
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===================== MODAL ===================== */}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) resetModalState();
            else setIsModalOpen(true);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditingExistingDate ? "Edit" : "Select"} Seats for{" "}
                {selectedDate && formatDateToString(selectedDate)}
              </DialogTitle>
            </DialogHeader>

            {/* Seats */}
            <RadioGroup
              value={
                seatSelectionType === "block"
                  ? "block"
                  : selectedSeats
                    ? String(selectedSeats)
                    : ""
              }
              onValueChange={(value) => {
                setSelectedSeats(null);
                setBlockSeats("");
                setBlockSeatsError("");

                if (value === "block") {
                  setSeatSelectionType("block");
                } else {
                  setSeatSelectionType("fixed");
                  setSelectedSeats(parseInt(value));
                }
              }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="20" id="seats-20" />
                <Label htmlFor="seats-20">20 Seats</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="32" id="seats-32" />
                <Label htmlFor="seats-32">32 Seats</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="block" id="seats-block" />
                <Label htmlFor="seats-block">Block (Custom seat count)</Label>
              </div>
            </RadioGroup>

            {seatSelectionType === "block" && (
              <div className="mt-4">
                <Label htmlFor="block-seats">Number of Seats to Block</Label>
                <Input
                  id="block-seats"
                  type="number"
                  placeholder="Enter number of seats"
                  value={blockSeats}
                  onChange={(e) => {
                    setBlockSeats(e.target.value);
                    setBlockSeatsError(validateBlockSeats(e.target.value));
                  }}
                  className={blockSeatsError ? "border-red-500" : ""}
                />
                {blockSeatsError && (
                  <p className="mt-1 text-sm text-red-500">{blockSeatsError}</p>
                )}
              </div>
            )}

            {/* Buses */}
            <div className="mt-4">
              <Label htmlFor="numberOfBuses">Number of Buses Available</Label>
              <Input
                id="numberOfBuses"
                type="number"
                placeholder="e.g., 2"
                value={numberOfBuses}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : parseInt(e.target.value);
                  setNumberOfBuses(value);
                  setNumberOfBusesError(validateBuses(value));

                  // vehicles will auto resize in useEffect
                }}
                className={numberOfBusesError ? "border-red-500" : ""}
              />
              {numberOfBusesError && (
                <p className="mt-1 text-sm text-red-500">
                  {numberOfBusesError}
                </p>
              )}
            </div>
{/* Min Seats Per Booking */}
<div className="mt-4">
  <Label htmlFor="minSeats">Minimum Seats Per Booking</Label>
  <Input
    id="minSeats"
    type="number"
    placeholder="e.g., 2"
    value={minSeatsPerBooking}
    onChange={(e) => {
      const value = parseInt(e.target.value) || 1;
      setMinSeatsPerBooking(value);
      
      setMinSeatsError(validateMinSeats(value));
    }}
    className={minSeatsError ? "border-red-500" : ""}
  />

  {minSeatsError && (
    <p className="mt-1 text-sm text-red-500">{minSeatsError}</p>
  )}
</div>
            {/* ✅ NEW: Vehicles inputs based on buses */}
            {numberOfBuses !== "" &&
              !numberOfBusesError &&
              vehiclesInputs.length > 0 && (
                <div className="mt-5 space-y-4">
                  <div className="text-sm font-medium text-gray-800">
                    Enter Instructor + Vehicle Number (Total: {numberOfBuses})
                  </div>

                  {vehiclesInputs.map((v, idx) => (
                    <div key={idx} className="rounded-lg border p-3 bg-gray-50">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Bus #{idx + 1}
                      </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`instructor-${idx}`}>
                            Instructor Name
                          </Label>
                          <Input
                            id={`instructor-${idx}`}
                            placeholder="e.g., Ramesh"
                            value={v.instructorName}
                            onChange={(e) =>
                              handleVehicleChange(
                                idx,
                                "instructorName",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`phone-${idx}`}>
                            Instructor Phone
                          </Label>
                          <Input
                            id={`phone-${idx}`}
                            placeholder="e.g., 9876543210"
                            value={v.phoneNumber}
                            onChange={(e) =>
                              handleVehicleChange(
                                idx,
                                "phoneNumber",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`vehicle-${idx}`}>
                            Vehicle Number
                          </Label>
                          <Input
                            id={`vehicle-${idx}`}
                            placeholder="e.g., TN09CQ4102"
                            value={v.vehicleNumber}
                            onChange={(e) =>
                              handleVehicleChange(
                                idx,
                                "vehicleNumber",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {vehiclesError && (
                    <p className="text-sm text-red-500">{vehiclesError}</p>
                  )}
                </div>
              )}

            <DialogFooter>
              <Button variant="outline" onClick={resetModalState}>
                Cancel
              </Button>

              <Button
                onClick={handleModalSubmit}
                disabled={
                  // seats validation
                  (seatSelectionType === "block"
                    ? !!blockSeatsError || !blockSeats
                    : !selectedSeats) ||
                  // buses validation
                  !!numberOfBusesError ||
                  numberOfBuses === "" ||
                  // vehicles validation
                  !!vehiclesError ||
                  (numberOfBuses !== "" &&
                    !numberOfBusesError &&
                    vehiclesInputs.length !== Number(numberOfBuses))
                }
              >
                {isEditingExistingDate ? "Save changes" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTripForm;
