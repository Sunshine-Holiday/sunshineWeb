import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format as formatDate,
  parse,
  startOfWeek,
  getDay,
  startOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Wifi, Coffee, Snowflake, Power, AudioLines } from "lucide-react";
import {
  useEditTripsMutation,
  useGettripsIDQuery,
  useGettripsQuery,
} from "@/store/api/trips";
import { toast } from "react-toastify";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGE_URL } from "@/store/store";
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
import { useGetBrochuresQuery } from "@/store/api/brochures";
import InterconnectionEditor, {
  defaultInterconnection,
  type InterconnectionConfig,
} from "@/components/admin/InterconnectionEditor";
import { getStateOptions } from "@/utils/tripDestinations";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format: formatDate,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  vehicles: VehicleInput[];
  minSeatsPerBooking: number; // ✅ ADD
}

interface Package {
  title: string;
  description: string;
  personCount: number;
  price: number;
}

interface RoomChoice {
  description: string;
  personCount: number;
  roomCount: number;
  price: number;
}

interface TripDetails {
  _id?: string;
  title: string;
  price: number;
  location: string;
  /** Destination state for navbar / destination filtering */
  state: string;
  duration: string;
  description: string;
  startDates: StartDate[];
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
  brochureId?: string;
  interconnection: InterconnectionConfig;
}

const OTHER_STATE = "__other__";

interface FormErrors {
  [key: string]: string;
}

const availableAmenities = [
  { icon: AudioLines, name: "Music and Fun" },
  { icon: Wifi, name: "Free WiFi" },
  { icon: Coffee, name: "Refreshments" },
  { icon: Snowflake, name: "AC" },
  { icon: Power, name: "Charging Points" },
];

const formatDateToString = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error("Invalid date passed to formatDateToString:", date);
    return "Invalid Date";
  }
  return formatDate(date, "dd-MM-yyyy");
};

const EditTrips: React.FC = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();
  const [minSeatsPerBooking, setMinSeatsPerBooking] = useState<number>(1);
  const [minSeatsError, setMinSeatsError] = useState<string>("");
  const validateMinSeats = useCallback((value: number) => {
    if (!value || value < 1) return "Minimum seats must be at least 1";
    return "";
  }, []);
  const { data, isError, isLoading, error } = useGettripsIDQuery(
    { id },
    { skip: !id },
  );
  const { data: allTripsData } = useGettripsQuery({});
  const { data: brochuresData } = useGetBrochuresQuery();
  const brochures = brochuresData?.brochures ?? [];

  const [editTrips] = useEditTripsMutation();
  const [loading, setLoading] = useState(false);
  const [customState, setCustomState] = useState("");
  const [stateSelectValue, setStateSelectValue] = useState("");

  const stateOptions = useMemo(() => {
    const trips = Array.isArray(allTripsData)
      ? allTripsData
      : (allTripsData as any)?.data ?? [];
    return getStateOptions(trips);
  }, [allTripsData]);

  const [tripDetails, setTripDetails] = useState<TripDetails>({
    _id: id || "",
    title: "",
    price: 0,
    location: "",
    state: "",
    duration: "",
    description: "",
    startDates: [],
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
    brochureId: "",
    interconnection: defaultInterconnection(),
  });

  // ✅ MODAL: buses + vehicles state
  const [numberOfBuses, setNumberOfBuses] = useState<number | "">("");
  const [numberOfBusesError, setNumberOfBusesError] = useState<string>("");

  const [vehiclesInputs, setVehiclesInputs] = useState<VehicleInput[]>([]);
  const [vehiclesError, setVehiclesError] = useState<string>("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  /** Existing banner paths on server + newly added local files */
  const [existingBanners, setExistingBanners] = useState<string[]>([]);
  const [newBannerFiles, setNewBannerFiles] = useState<File[]>([]);
  const [newBannerPreviews, setNewBannerPreviews] = useState<string[]>([]);

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

  // =========================
  // HELPERS / VALIDATIONS
  // =========================
  const validateBlockSeats = useCallback((value: string) => {
    const num = parseInt(value);
    if (!value) return "Number of seats is required";
    if (isNaN(num) || num <= 0) return "Please enter a valid number of seats";
    return "";
  }, []);

  const validateBuses = useCallback((value: number | "") => {
    if (value === "") return "Number of buses is required";
    if (!Number.isInteger(value) || value <= 0)
      return "Enter a valid number of buses";
    return "";
  }, []);

  const validateVehicles = useCallback(
    (buses: number | "", list: VehicleInput[]) => {
      if (buses === "" || buses <= 0)
        return "Please enter number of buses first";
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
    },
    [],
  );

  const resetModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setIsEditingExistingDate(false);

    setSelectedSeats(null);
    setSeatSelectionType(null);

    setBlockSeats("");
    setBlockSeatsError("");

    setNumberOfBuses("");
    setNumberOfBusesError("");

    setVehiclesInputs([]);
    setVehiclesError("");

    setMinSeatsPerBooking(1);
    setMinSeatsError("");
  }, []);

  // ✅ auto-create vehicle inputs based on buses
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

    const buses = Number(numberOfBuses);

    setVehiclesInputs((prev) => {
      const next = [...prev];

      while (next.length < buses) {
        next.push({ instructorName: "", vehicleNumber: "", phoneNumber: "" }); // ✅ NEW
      }

      if (next.length > buses) {
        next.splice(buses);
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfBuses]);

  // =========================
  // LOAD EXISTING TRIP
  // =========================
  useEffect(() => {
    if (data?.trip) {
      const parsedDates: StartDate[] = (data.trip.startDates || [])
        .map(
          (
            item: {
              date: string;
              seats: number | "block";
              numberOfBusesAvailable?: number;
              minSeatsPerBooking?: number;
              vehicles?: {
                instructorName?: string;
                vehicleNumber?: string;
                phoneNumber?: string;
              }[];
            },
            index: number,
          ) => {
            try {
              const parsedDate = parse(item.date, "dd-MM-yyyy", new Date());
              if (isNaN(parsedDate.getTime())) {
                console.error(`Invalid date at index ${index}: ${item.date}`);
                return null as any;
              }

              const buses = item.numberOfBusesAvailable ?? 1;

              // ✅ map vehicles if exists; else create empty placeholders
              const vehiclesFromApi: VehicleInput[] = Array.isArray(
                item.vehicles,
              )
                ? item.vehicles.map((v) => ({
                    instructorName: (v?.instructorName || "").toString(),
                    vehicleNumber: (v?.vehicleNumber || "").toString(),
                    phoneNumber: (v?.phoneNumber || "").toString(), // ✅ NEW
                  }))
                : [];

              const normalizedVehicles =
                vehiclesFromApi.length > 0
                  ? vehiclesFromApi
                  : Array.from({ length: buses }).map(() => ({
                      instructorName: "",
                      vehicleNumber: "",
                    }));

              // if mismatch, fix length to buses
              const fixedVehicles = [...normalizedVehicles];
              while (fixedVehicles.length < buses)
                fixedVehicles.push(
                  { instructorName: "", vehicleNumber: "", phoneNumber: "" }, // ✅ NEW
                );
              if (fixedVehicles.length > buses) fixedVehicles.splice(buses);

              return {
                date: startOfDay(parsedDate),
                seats: item.seats,
                numberOfBusesAvailable: buses,
                minSeatsPerBooking: item.minSeatsPerBooking ?? 1, // ✅ ADD
                vehicles: fixedVehicles,
              } as StartDate;
            } catch (e) {
              console.error(
                `Error parsing date at index ${index}: ${item.date}`,
                e,
              );
              return null as any;
            }
          },
        )
        .filter(Boolean);

      const loadedState = (data.trip.state || "").trim();
      if (loadedState) {
        const known = getStateOptions(
          Array.isArray(allTripsData)
            ? allTripsData
            : (allTripsData as any)?.data ?? [],
        );
        if (known.includes(loadedState)) {
          setStateSelectValue(loadedState);
          setCustomState("");
        } else {
          setStateSelectValue(OTHER_STATE);
          setCustomState(loadedState);
        }
      }

      const updatedDetails: TripDetails = {
        _id: data.trip._id || id,
        title: data.trip.title || "",
        price: data.trip.price ? parseFloat(data.trip.price) : 0,
        location: data.trip.location || "",
        state: loadedState,
        duration: data.trip.duration || "",
        description: data.trip.description || "",
        startDates: parsedDates,
        category: data.trip.category || "",
        interconnection: (() => {
          const ic = data.trip.interconnection || {};
          return {
            enabled: Boolean(ic.enabled) && ic.role && ic.role !== "none",
            role: (ic.role || "none") as InterconnectionConfig["role"],
            outboundTrip: ic.outboundTrip
              ? String(ic.outboundTrip._id || ic.outboundTrip)
              : "",
            returnTrip: ic.returnTrip
              ? String(ic.returnTrip._id || ic.returnTrip)
              : "",
            stayTrip: ic.stayTrip
              ? String(ic.stayTrip._id || ic.stayTrip)
              : "",
            dayOffset: Math.max(1, Number(ic.dayOffset) || 1),
          };
        })(),
        amenities:
          Array.isArray(data.trip.amenities) && data.trip.amenities.length > 0
            ? data.trip.amenities
            : [],
        boardingPoints:
          Array.isArray(data.trip.boardingPoints) &&
          data.trip.boardingPoints.length > 0
            ? data.trip.boardingPoints
            : [{ location: "", time: "", details: "", maplink: "" }],
        packages:
          Array.isArray(data.trip.packages) && data.trip.packages.length > 0
            ? data.trip.packages.map((pkg: any) => ({
                title: pkg.title || "",
                description: pkg.description || "",
                personCount: pkg.personCount || 0,
                price: pkg.price || 0,
              }))
            : [],
        roomChoices:
          Array.isArray(data.trip.roomChoices) &&
          data.trip.roomChoices.length > 0
            ? data.trip.roomChoices.map((room: any) => ({
                description: room.description || "",
                personCount: room.personCount || 0,
                roomCount: room.roomCount || 0,
                price: room.price || 0,
              }))
            : [],
        file: null,
        advancePaymentPercentage:
          data.trip.advancePaymentPercentage ?? undefined,
        discountPercentage: data.trip.discountPercentage ?? undefined,
        highlights:
          Array.isArray(data.trip.highlights) && data.trip.highlights.length > 0
            ? data.trip.highlights.map((h: string) => String(h || ""))
            : [""],
        includes:
          Array.isArray(data.trip.includes) && data.trip.includes.length > 0
            ? data.trip.includes.map((h: string) => String(h || ""))
            : [""],
        mapLink: data.trip.mapLink || "",
        cancellationPolicy: data.trip.cancellationPolicy || "",
        faqs:
          Array.isArray(data.trip.faqs) && data.trip.faqs.length > 0
            ? data.trip.faqs.map((f: any) => ({
                question: f?.question || "",
                answer: f?.answer || "",
              }))
            : [{ question: "", answer: "" }],
        brochureImage: data.trip.brochureImage || "",
        brochureFile: data.trip.brochureFile || "",
        brochureId: data.trip.brochureId
          ? String(data.trip.brochureId._id || data.trip.brochureId)
          : "",
      };

      setTripDetails(updatedDetails);

      const loadedBanners = [
        data.trip.banner,
        ...(Array.isArray(data.trip.banners) ? data.trip.banners : []),
      ].filter((b): b is string => typeof b === "string" && !!b.trim());
      setExistingBanners([...new Set(loadedBanners)]);
      setNewBannerFiles([]);
      setNewBannerPreviews([]);
    }
  }, [data?.trip, id]);

  // =========================
  // QUILL
  // =========================
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
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
    "color",
    "background",
    "list",
    "bullet",
    "link",
  ];

  // =========================
  // FORM HANDLERS
  // =========================
  const handleChange = useCallback((field: keyof TripDetails, value: any) => {
    setTripDetails((prev) => ({ ...prev, [field]: value }));
    if (value || (field === "price" && value > 0)) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files || []);
      e.target.value = "";
      if (!picked.length) return;

      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      setNewBannerFiles((prevFiles) => {
        const nextFiles = [...prevFiles];
        const nextPreviews: string[] = [];
        // rebuild previews from remaining + new — handled after loop via setState
        for (const file of picked) {
          if (!validTypes.includes(file.type)) {
            setErrors((prev) => ({
              ...prev,
              file: "Please upload PNG, JPG, or JPEG images only",
            }));
            continue;
          }
          if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
              ...prev,
              file: "Each image must be under 5MB",
            }));
            continue;
          }
          const total =
            existingBanners.length + nextFiles.length;
          if (total >= 12) {
            setErrors((prev) => ({
              ...prev,
              file: "Maximum 12 banner images",
            }));
            break;
          }
          nextFiles.push(file);
        }
        setNewBannerPreviews((prevPrev) => {
          // keep previews in sync with files that already had previews + new ones
          const kept = prevPrev.slice(0, Math.min(prevPrev.length, nextFiles.length));
          while (kept.length < nextFiles.length) {
            const f = nextFiles[kept.length];
            kept.push(URL.createObjectURL(f));
          }
          return kept;
        });
        setTripDetails((prev) => ({
          ...prev,
          file: nextFiles[0] || prev.file,
        }));
        setErrors((prev) => ({ ...prev, file: "" }));
        return nextFiles;
      });
    },
    [existingBanners.length],
  );

  const removeExistingBanner = (index: number) => {
    setExistingBanners((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewBanner = (index: number) => {
    setNewBannerFiles((prev) => prev.filter((_, i) => i !== index));
    setNewBannerPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateField = useCallback(
    (field: string) => {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };

        switch (field) {
          case "title":
            if (!tripDetails.title) newErrors.title = "Title is required";
            else delete newErrors.title;
            break;

          case "location":
            if (!tripDetails.location)
              newErrors.location = "Location is required";
            else delete newErrors.location;
            break;

          case "description":
            if (!tripDetails.description)
              newErrors.description = "Description is required";
            else delete newErrors.description;
            break;

          case "category":
            if (!tripDetails.category)
              newErrors.category = "Category is required";
            else delete newErrors.category;
            break;

          case "amenities":
            if (tripDetails.amenities.length === 0)
              newErrors.amenities = "At least one amenity is required";
            else delete newErrors.amenities;
            break;

          case "price":
            if (
              tripDetails.packages.length === 0 &&
              (!tripDetails.price || tripDetails.price <= 0)
            ) {
              newErrors.price =
                "Price is required when no packages are provided";
            } else {
              delete newErrors.price;
            }
            break;

          case "packages":
            if (
              tripDetails.packages.length === 0 &&
              (!tripDetails.price || tripDetails.price <= 0)
            ) {
              newErrors.packages =
                "At least one package is required if no single price is provided";
            } else {
              delete newErrors.packages;
              tripDetails.packages.forEach((pkg, index) => {
                if (!pkg.title)
                  newErrors[`package-title-${index}`] =
                    "Package title is required";
                else delete newErrors[`package-title-${index}`];

                if (!pkg.personCount || pkg.personCount <= 0)
                  newErrors[`package-personCount-${index}`] =
                    "Valid person count is required";
                else delete newErrors[`package-personCount-${index}`];

                if (!pkg.price || pkg.price <= 0)
                  newErrors[`package-price-${index}`] =
                    "Valid price is required";
                else delete newErrors[`package-price-${index}`];
              });
            }
            break;

          case "roomChoices":
            tripDetails.roomChoices.forEach((room, index) => {
              if (
                room.description &&
                (!room.personCount || room.personCount <= 0)
              )
                newErrors[`room-personCount-${index}`] =
                  "Valid person count is required";
              else delete newErrors[`room-personCount-${index}`];

              if (room.description && (!room.roomCount || room.roomCount <= 0))
                newErrors[`room-roomCount-${index}`] =
                  "Valid room count is required";
              else delete newErrors[`room-roomCount-${index}`];

              if (room.description && (!room.price || room.price <= 0))
                newErrors[`room-price-${index}`] = "Valid price is required";
              else delete newErrors[`room-price-${index}`];
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
            } else {
              delete newErrors.advancePaymentPercentage;
            }
            break;

          case "discountPercentage":
            if (
              tripDetails.discountPercentage !== undefined &&
              (tripDetails.discountPercentage < 0 ||
                tripDetails.discountPercentage > 100)
            ) {
              newErrors.discountPercentage =
                "Discount must be between 0 and 100";
            } else {
              delete newErrors.discountPercentage;
            }
            break;
        }

        return newErrors;
      });
    },
    [tripDetails],
  );

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field);
    },
    [validateField],
  );

  // =========================
  // LISTS (boarding, pkg, rooms)
  // =========================
  const handleBoardingPointsChange = useCallback((points: BoardingPoint[]) => {
    setTripDetails((prev) => ({ ...prev, boardingPoints: points }));
    if (points.length > 0) {
      setErrors((prev) => ({ ...prev, boardingPoints: "" }));
    }
  }, []);

  const handleAddPackage = useCallback(() => {
    setTripDetails((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        { title: "", description: "", personCount: 0, price: 0 },
      ],
      price: 0,
    }));
    setErrors((prev) => ({ ...prev, packages: "", price: "" }));
  }, []);

  const handleRemovePackage = useCallback(
    (index: number) => {
      const updatedPackages = tripDetails.packages.filter(
        (_, i) => i !== index,
      );
      setTripDetails((prev) => ({ ...prev, packages: updatedPackages }));
      if (updatedPackages.length === 0) {
        setErrors((prev) => ({
          ...prev,
          packages:
            "At least one package is required if no single price is provided",
        }));
      }
      validateField("price");
    },
    [tripDetails.packages, validateField],
  );

  const handlePackageChange = useCallback(
    (index: number, field: keyof Package, value: string | number) => {
      const updatedPackages = tripDetails.packages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg,
      );
      setTripDetails((prev) => ({
        ...prev,
        packages: updatedPackages,
        price: 0,
      }));
      validateField("packages");
    },
    [tripDetails.packages, validateField],
  );

  const handleAddRoomChoice = useCallback(() => {
    setTripDetails((prev) => ({
      ...prev,
      roomChoices: [
        ...prev.roomChoices,
        { description: "", personCount: 0, roomCount: 0, price: 0 },
      ],
    }));
  }, []);

  const handleRemoveRoomChoice = useCallback(
    (index: number) => {
      const updatedRoomChoices = tripDetails.roomChoices.filter(
        (_, i) => i !== index,
      );
      setTripDetails((prev) => ({ ...prev, roomChoices: updatedRoomChoices }));
    },
    [tripDetails.roomChoices],
  );

  const handleRoomChoiceChange = useCallback(
    (index: number, field: keyof RoomChoice, value: string | number) => {
      const updatedRoomChoices = tripDetails.roomChoices.map((room, i) =>
        i === index ? { ...room, [field]: value } : room,
      );
      setTripDetails((prev) => ({ ...prev, roomChoices: updatedRoomChoices }));
      validateField("roomChoices");
    },
    [tripDetails.roomChoices, validateField],
  );

  // =========================
  // DATE SELECTION (open modal)
  // =========================
  const openNewDateModal = useCallback((normalizedDate: Date) => {
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
  }, []);

  const openEditDateModal = useCallback(
    (entry: StartDate) => {
      const normalizedDate = startOfDay(entry.date);
      setIsEditingExistingDate(true);
      setSelectedDate(normalizedDate);

      if (entry.seats === 20 || entry.seats === 32) {
        setSeatSelectionType("fixed");
        setSelectedSeats(entry.seats);
        setBlockSeats("");
        setBlockSeatsError("");
      } else {
        setSeatSelectionType("block");
        setSelectedSeats(null);
        const blockVal =
          entry.seats === "block" ? "" : String(entry.seats ?? "");
        setBlockSeats(blockVal);
        setBlockSeatsError(
          blockVal
            ? validateBlockSeats(blockVal)
            : "Number of seats is required",
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
    },
    [validateBlockSeats],
  );

  const handleDateSelection = useCallback(
    (date: Date) => {
      const normalizedDate = startOfDay(date);

      const existingDate = tripDetails.startDates.find(
        (d) => d.date.getTime() === normalizedDate.getTime(),
      );

      // Already configured → ask Edit or Delete (do not wipe immediately)
      if (existingDate) {
        setDateActionTarget(existingDate);
        setDateActionOpen(true);
        return;
      }

      openNewDateModal(normalizedDate);
    },
    [tripDetails.startDates, openNewDateModal],
  );

  const handleDateActionEdit = useCallback(() => {
    if (!dateActionTarget) return;
    const entry = dateActionTarget;
    setDateActionOpen(false);
    setDateActionTarget(null);
    openEditDateModal(entry);
  }, [dateActionTarget, openEditDateModal]);

  const handleDateActionDelete = useCallback(() => {
    if (!dateActionTarget) return;
    const targetTime = startOfDay(dateActionTarget.date).getTime();
    setTripDetails((prev) => ({
      ...prev,
      startDates: prev.startDates.filter(
        (d) => d.date.getTime() !== targetTime,
      ),
    }));
    setDateActionOpen(false);
    setDateActionTarget(null);
  }, [dateActionTarget]);

  const handleVehicleChange = useCallback(
    (index: number, field: keyof VehicleInput, value: string) => {
      setVehiclesInputs((prev) => {
        const next = prev.map((v, i) =>
          i === index ? { ...v, [field]: value } : v,
        );
        const vErr = validateVehicles(numberOfBuses, next);
        setVehiclesError(vErr);
        return next;
      });
    },
    [numberOfBuses, validateVehicles],
  );

  // =========================
  // MODAL SUBMIT (add start date)
  // =========================
  const handleModalSubmit = useCallback(() => {
    if (!selectedDate) return;

    const busError = validateBuses(numberOfBuses);
    if (busError) {
      setNumberOfBusesError(busError);
      return;
    }

    const vErr = validateVehicles(numberOfBuses, vehiclesInputs);
    if (vErr) {
      setVehiclesError(vErr);
      return;
    }

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

    const selectedTime = startOfDay(selectedDate).getTime();
    // Edit replaces the same date; add appends a new one
    const baseDates = isEditingExistingDate
      ? tripDetails.startDates.filter((d) => d.date.getTime() !== selectedTime)
      : tripDetails.startDates;

    const newDates = [...baseDates, newStartDate].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    setTripDetails((prev) => ({ ...prev, startDates: newDates }));
    setErrors((prev) => ({ ...prev, startDates: "" }));

    resetModal();
  }, [
    selectedDate,
    selectedSeats,
    seatSelectionType,
    blockSeats,
    numberOfBuses,
    vehiclesInputs,
    tripDetails.startDates,
    validateBuses,
    validateVehicles,
    validateBlockSeats,
    resetModal,
    isEditingExistingDate,
    minSeatsPerBooking,
  ]);

  // =========================
  // VALIDATE FORM (including vehicles)
  // =========================
  const validateForm = useCallback(() => {
    const requiredFields = ["title", "location", "state", "description", "category"];
    let newErrors: FormErrors = {};
    let isValid = true;

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

    if (tripDetails.startDates.length === 0) {
      newErrors.startDates = "At least one date with seats must be selected";
      isValid = false;
    }

    // ✅ Validate each date has correct vehicle count and non-empty fields
    tripDetails.startDates.forEach((d, idx) => {
      if (!d.numberOfBusesAvailable || d.numberOfBusesAvailable <= 0) {
        newErrors[`startDates-buses-${idx}`] = "Number of buses must be > 0";
        isValid = false;
      }

      // if (!Array.isArray(d.vehicles) || d.vehicles.length !== d.numberOfBusesAvailable) {
      //   newErrors[`startDates-vehicles-${idx}`] = `Date ${formatDateToString(d.date)} must have ${d.numberOfBusesAvailable} vehicle(s)`;
      //   isValid = false;
      // } else {
      //   d.vehicles.forEach((v, vi) => {
      //     if (!v.instructorName?.trim()) {
      //       newErrors[`startDates-${idx}-instructor-${vi}`] =
      //         `Instructor name missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
      //       isValid = false;
      //     }
      //     if (!v.vehicleNumber?.trim()) {
      //       newErrors[`startDates-${idx}-vehicle-${vi}`] =
      //         `Vehicle number missing for ${formatDateToString(d.date)} Bus #${vi + 1}`;
      //       isValid = false;
      //     }
      //   });
      // }
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
      if (room.description && (!room.personCount || room.personCount <= 0))
        newErrors[`room-personCount-${index}`] =
          "Valid person count is required";
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

    setErrors(newErrors);
    console.log("Validation result:", { isValid, errors: newErrors });
    return isValid && Object.keys(newErrors).length === 0;
  }, [tripDetails, stateSelectValue, customState]);

  // =========================
  // SAVE (include vehicles)
  // =========================
  const handleSave = useCallback(async () => {
    console.log("Validating form with details:", validateForm());
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("_id", tripDetails._id || "");
      formData.append("title", tripDetails.title);
      formData.append("price", tripDetails.price.toString());
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

  formData.append(
  "startDates",
  JSON.stringify(
    tripDetails.startDates.map((d) => ({
      date: formatDateToString(d.date),
      seats: d.seats,
      numberOfBusesAvailable: d.numberOfBusesAvailable,
      minSeatsPerBooking: d.minSeatsPerBooking,
      vehicles: d.vehicles,
    })),
  ),
);

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

      formData.append("brochureImage", tripDetails.brochureImage || "");
      formData.append("brochureFile", tripDetails.brochureFile || "");
      formData.append("brochureId", tripDetails.brochureId || "");

      if (existingBanners.length === 0 && newBannerFiles.length === 0) {
        toast.error("At least one banner image is required");
        setLoading(false);
        return;
      }
      // Kept existing paths (JSON) + new image files (multipart field "banners")
      formData.append("existingBanners", JSON.stringify(existingBanners));
      newBannerFiles.forEach((f, i) => {
        if (i === 0 && existingBanners.length === 0) {
          formData.append("file", f);
        }
        formData.append("banners", f);
      });

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

      await editTrips(formData).unwrap();
      toast.success("Trip updated successfully!");
      navigate("/admin/trips");
    } catch (e) {
      toast.error("Unable to update trip.");
      console.error("Save error:", e);
    } finally {
      setLoading(false);
    }
  }, [
    tripDetails,
    editTrips,
    navigate,
    validateForm,
    stateSelectValue,
    customState,
    existingBanners,
    newBannerFiles,
  ]);

  // =========================
  // UI HELPERS
  // =========================
  const today = new Date();

  const inputClassName = (field: string) =>
    `w-full ${touched[field] && errors[field] ? "border-red-500" : ""}`;

  const calendarEvents = useMemo(() => {
    return tripDetails.startDates.map((d, index) => ({
      id: index,
      start: d.date,
      end: d.date,
      title: `${formatDateToString(d.date)} • ${
        d.seats === "block" ? "Block" : `${d.seats} Seats`
      } • ${d.numberOfBusesAvailable} Bus(es)`,
    }));
  }, [tripDetails.startDates]);

  // =========================
  // EARLY RETURNS
  // =========================
  if (!id)
    return (
      <div className="text-center py-10 text-red-500">Invalid trip ID</div>
    );
  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError) {
    console.error("Error fetching trip details:", error);
    return (
      <div className="text-center py-10 text-red-500">
        Error loading trip details
      </div>
    );
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Trip</h1>

          <div className="space-y-8">
            {/* Banners (multi) */}
            <div>
              <h2 className="mb-1 text-xl font-semibold">Trip Banners</h2>
              <p className="mb-4 text-sm text-slate-500">
                Multiple images rotate on the trip card and details page. First
                image is primary.
              </p>

              {(existingBanners.length > 0 || newBannerPreviews.length > 0) && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {existingBanners.map((path, index) => (
                    <div
                      key={`ex-${path}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={
                          path.startsWith("http")
                            ? path
                            : `${IMAGE_URL}${path}`
                        }
                        alt={`Banner ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      {index === 0 && newBannerFiles.length === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingBanner(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {newBannerPreviews.map((src, index) => (
                    <div
                      key={`new-${src}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-orange-200 bg-orange-50/40"
                    >
                      <img
                        src={src}
                        alt={`New banner ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewBanner(index)}
                        className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="banner-upload"
                />
                <Label htmlFor="banner-upload" className="block cursor-pointer">
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
                      Click to add more banner images (multiple allowed)
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Max 5MB each · up to 12 total
                    </p>
                  </div>
                </Label>
              </div>
              {errors.file && (
                <p className="mt-2 text-sm text-red-500">{errors.file}</p>
              )}
            </div>

            {/* Basic Fields */}
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
                  Used for Tour navbar and destination pages (e.g. Mahabaleshwar).
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

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Trip Description *</h2>
              <p className="mb-2 text-sm text-slate-500">
                Use the toolbar to style text — including text color and
                highlight (background) color.
              </p>
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
              currentTripId={tripDetails._id}
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

            {/* Calendar */}
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
                    {tripDetails.startDates
                      .slice()
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((d, index) => (
                        <li
                          key={index}
                          className="cursor-pointer list-none rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-orange-300 hover:bg-orange-50"
                          onClick={() => {
                            setDateActionTarget(d);
                            setDateActionOpen(true);
                          }}
                        >
                          <div className="font-medium text-slate-800">
                            {formatDateToString(d.date)} —{" "}
                            {d.seats === "block" ? "Block" : `${d.seats} Seats`}{" "}
                            — {d.numberOfBusesAvailable} Bus(es)
                            <span className="ml-2 text-xs font-normal text-orange-600">
                              Tap to edit / delete
                            </span>
                          </div>

                          {Array.isArray(d.vehicles) &&
                            d.vehicles.length > 0 && (
                              <div className="mt-1 text-sm text-gray-500">
                                {d.vehicles.map((v, vi) => (
                                  <div key={vi}>
                                    Bus #{vi + 1}: {v.instructorName} •{" "}
                                    {v.vehicleNumber} • {v.phoneNumber}
                                  </div>
                                ))}
                              </div>
                            )}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Packages */}
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

            {/* Room Choices */}
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
                        placeholder="e.g., 1 room 4 people"
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
                      <Label htmlFor={`room-personCount-${index}`}>
                        Person Count
                      </Label>
                      <Input
                        id={`room-personCount-${index}`}
                        type="number"
                        placeholder="e.g., 4"
                        value={room.personCount || ""}
                        onChange={(e) =>
                          handleRoomChoiceChange(
                            index,
                            "personCount",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        onBlur={() => validateField("roomChoices")}
                      />
                      {errors[`room-personCount-${index}`] && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[`room-personCount-${index}`]}
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

            {/* Amenities */}
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

            {/* Boarding Points */}
            <BoardingPointsEditor
              boardingPoints={tripDetails.boardingPoints}
              onChange={handleBoardingPointsChange}
              error={errors.boardingPoints}
            />

            {/* Map link */}
            <div>
              <Label htmlFor="mapLink">Tour map link (Google Maps)</Label>
              <Input
                id="mapLink"
                placeholder="https://maps.google.com/..."
                value={tripDetails.mapLink}
                onChange={(e) =>
                  setTripDetails((prev) => ({
                    ...prev,
                    mapLink: e.target.value,
                  }))
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
                      setTripDetails((prev) => ({
                        ...prev,
                        highlights: next,
                      }));
                    }}
                  />
                  {tripDetails.highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setTripDetails((prev) => ({
                          ...prev,
                          highlights: prev.highlights.filter(
                            (_, j) => j !== i,
                          ),
                        }))
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
                  setTripDetails((prev) => ({
                    ...prev,
                    highlights: [...prev.highlights, ""],
                  }))
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
                      setTripDetails((prev) => ({ ...prev, includes: next }));
                    }}
                  />
                  {tripDetails.includes.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setTripDetails((prev) => ({
                          ...prev,
                          includes: prev.includes.filter((_, j) => j !== i),
                        }))
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
                  setTripDetails((prev) => ({
                    ...prev,
                    includes: [...prev.includes, ""],
                  }))
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
                      setTripDetails((prev) => ({ ...prev, faqs: next }));
                    }}
                  />
                  <Input
                    placeholder="Answer"
                    value={faq.answer}
                    onChange={(e) => {
                      const next = [...tripDetails.faqs];
                      next[i] = { ...next[i], answer: e.target.value };
                      setTripDetails((prev) => ({ ...prev, faqs: next }));
                    }}
                  />
                  {tripDetails.faqs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() =>
                        setTripDetails((prev) => ({
                          ...prev,
                          faqs: prev.faqs.filter((_, j) => j !== i),
                        }))
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
                  setTripDetails((prev) => ({
                    ...prev,
                    faqs: [...prev.faqs, { question: "", answer: "" }],
                  }))
                }
              >
                Add FAQ
              </Button>
            </div>

            {/* Cancellation */}
            <div>
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <p className="mb-2 mt-1 text-sm text-slate-500">
                Style text with color or background highlight as needed.
              </p>
              <ReactQuill
                theme="snow"
                value={tripDetails.cancellationPolicy}
                onChange={(value) =>
                  setTripDetails((prev) => ({
                    ...prev,
                    cancellationPolicy: value,
                  }))
                }
                modules={quillModules}
                formats={quillFormats}
                className="rounded-lg border border-gray-300"
                style={{ height: "160px", marginBottom: "40px" }}
              />
            </div>

            {/* Brochure from library */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Brochure</h2>
              <Label htmlFor="edit-brochureId">Select brochure</Label>
              <Select
                value={tripDetails.brochureId || "__none__"}
                onValueChange={(value) => {
                  if (value === "__none__") {
                    setTripDetails((prev) => ({
                      ...prev,
                      brochureId: "",
                      brochureImage: "",
                      brochureFile: "",
                    }));
                    return;
                  }
                  const selected = brochures.find((b) => b._id === value);
                  setTripDetails((prev) => ({
                    ...prev,
                    brochureId: value,
                    brochureImage: selected?.image || "",
                    brochureFile: selected?.image || "",
                  }));
                }}
              >
                <SelectTrigger id="edit-brochureId" className="mt-1">
                  <SelectValue placeholder="Select a brochure (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No brochure</SelectItem>
                  {brochures.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-slate-500">
                Manage brochures under Admin → Brochures.
              </p>
              {tripDetails.brochureImage && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <img
                    src={
                      /^https?:\/\//i.test(tripDetails.brochureImage)
                        ? tripDetails.brochureImage
                        : `${IMAGE_URL.replace(/\/?$/, "/")}${String(tripDetails.brochureImage).replace(/^\//, "")}`
                    }
                    alt="Selected brochure"
                    className="mx-auto max-h-40 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                "Update Trip"
              )}
            </Button>
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
          if (!open) resetModal();
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

                // also clear vehicles error when typing
                if (value === "") {
                  setVehiclesInputs([]);
                  setVehiclesError("");
                }
              }}
              className={numberOfBusesError ? "border-red-500" : ""}
            />
            {numberOfBusesError && (
              <p className="mt-1 text-sm text-red-500">{numberOfBusesError}</p>
            )}
          </div>
          {/* Minimum Seats Per Booking */}
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
          {/* ✅ Vehicles inputs (depends on buses) */}
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
                        <Label htmlFor={`phone-${idx}`}>Instructor Phone</Label>
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
                        <Label htmlFor={`vehicle-${idx}`}>Vehicle Number</Label>
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
            <Button variant="outline" onClick={resetModal}>
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
                  vehiclesInputs.length !== Number(numberOfBuses))
              }
            >
              {isEditingExistingDate ? "Save changes" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditTrips;
