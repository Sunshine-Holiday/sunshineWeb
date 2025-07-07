import React, { useEffect, useState, useCallback } from "react";
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
import { useEditTripsMutation, useGettripsIDQuery } from "@/store/api/trips";
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

interface StartDate {
  date: Date;
  seats: number | "block";
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
  duration: string;
  description: string;
  startDates: StartDate[];
  category: string;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  packages: Package[];
  roomChoices: RoomChoice[];
  file?: File | null;
}

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
  const { data, isError, isLoading, error } = useGettripsIDQuery(
    { id },
    { skip: !id }
  );
  const [editTrips] = useEditTripsMutation();
  const [loading, setLoading] = useState(false);

  const [tripDetails, setTripDetails] = useState<TripDetails>({
    _id: id || "",
    title: "",
    price: 0,
    location: "",
    duration: "",
    description: "",
    startDates: [],
    category: "",
    amenities: [],
    boardingPoints: [{ location: "", time: "", details: "", maplink: "" }],
    packages: [],
    roomChoices: [],
    file: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number | "block" | null>(
    null
  );
  const [seatSelectionType, setSeatSelectionType] = useState<
    "fixed" | "block" | null
  >(null);
  const [blockSeats, setBlockSeats] = useState<string>("");
  const [blockSeatsError, setBlockSeatsError] = useState<string>("");

  useEffect(() => {
    if (data) {
      const parsedDates = data?.trip.startDates
        .map(
          (item: { date: string; seats: number | "block" }, index: number) => {
            try {
              const parsedDate = parse(item.date, "dd-MM-yyyy", new Date());
              if (isNaN(parsedDate.getTime())) {
                console.error(`Invalid date at index ${index}: ${item.date}`);
                return null;
              }
              return {
                date: startOfDay(parsedDate),
                seats: item.seats,
              };
            } catch (error) {
              console.error(
                `Error parsing date at index ${index}: ${item.date}`,
                error
              );
              return null;
            }
          }
        )
        .filter((item: StartDate | null): item is StartDate => item !== null);

      const updatedDetails = {
        _id: data.trip._id || id,
        title: data?.trip.title || "",
        price: data?.trip.price ? parseFloat(data.trip.price) : 0,
        location: data?.trip.location || "",
        duration: data?.trip.duration || "",
        description: data?.trip.description || "",
        startDates: parsedDates,
        category: data?.trip.category || "",
        amenities:
          Array.isArray(data?.trip.amenities) && data?.trip.amenities.length > 0
            ? data?.trip.amenities
            : [],
        boardingPoints:
          Array.isArray(data?.trip.boardingPoints) &&
          data?.trip.boardingPoints.length > 0
            ? data?.trip.boardingPoints
            : [{ location: "", time: "", details: "", maplink: "" }],
        packages:
          Array.isArray(data?.trip.packages) && data?.trip.packages.length > 0
            ? data?.trip.packages.map((pkg: any) => ({
                title: pkg.title || "",
                description: pkg.description || "",
                personCount: pkg.personCount || 0,
                price: pkg.price || 0,
              }))
            : [],
        roomChoices:
          Array.isArray(data?.trip.roomChoices) &&
          data?.trip.roomChoices.length > 0
            ? data?.trip.roomChoices.map((room: any) => ({
                description: room.description || "",
                personCount: room.personCount || 0,
                roomCount: room.roomCount || 0,
                price: room.price || 0,
              }))
            : [],
        file: null,
      };
      setTripDetails(updatedDetails);
      if (data?.trip.banner) {
        setImagePreview(`${IMAGE_URL}${data?.trip.banner}`);
      }
    }
  }, [data?.trip, id]);

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

  const handleChange = useCallback((field: keyof TripDetails, value: any) => {
    setTripDetails((prev) => ({ ...prev, [field]: value }));
    if (value || (field === "price" && value > 0)) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
          setErrors((prev) => ({
            ...prev,
            file: "Please upload a PNG, JPG, or JPEG file",
          }));
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            file: "File size must be less than 5MB",
          }));
          return;
        }
        setTripDetails((prev) => ({ ...prev, file }));
        setErrors((prev) => ({ ...prev, file: "" }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  }, []);

  const validateField = useCallback(
    (field: string) => {
      let newErrors = { ...errors };
      switch (field) {
        case "title":
          if (!tripDetails.title) newErrors.title = "Title is required";
          break;
        case "location":
          if (!tripDetails.location)
            newErrors.location = "Location is required";
          break;
        case "description":
          if (!tripDetails.description)
            newErrors.description = "Description is required";
          break;
        case "category":
          if (!tripDetails.category)
            newErrors.category = "Category is required";
          break;
        case "amenities":
          if (tripDetails.amenities.length === 0)
            newErrors.amenities = "At least one amenity is required";
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
          if (
            tripDetails.packages.length === 0 &&
            (!tripDetails.price || tripDetails.price <= 0)
          ) {
            newErrors.packages =
              "At least one package is required if no single price is provided";
          } else {
            tripDetails.packages.forEach((pkg, index) => {
              if (!pkg.title)
                newErrors[`package-title-${index}`] =
                  "Package title is required";
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
            if (
              room.description &&
              (!room.personCount || room.personCount <= 0)
            )
              newErrors[`room-personCount-${index}`] =
                "Valid person count is required";
            if (room.description && (!room.roomCount || room.roomCount <= 0))
              newErrors[`room-roomCount-${index}`] =
                "Valid room count is required";
            if (room.description && (!room.price || room.price <= 0))
              newErrors[`room-price-${index}`] = "Valid price is required";
          });
          break;
      }
      setErrors(newErrors);
    },
    [errors, tripDetails]
  );

  const handleAddBoardingPoint = useCallback(() => {
    setTripDetails((prev) => ({
      ...prev,
      boardingPoints: [
        ...prev.boardingPoints,
        { location: "", time: "", details: "", maplink: "" },
      ],
    }));
    setErrors((prev) => ({ ...prev, boardingPoints: "" }));
  }, []);

  const handleRemoveBoardingPoint = useCallback(
    (index: number) => {
      const updatedPoints = tripDetails.boardingPoints.filter(
        (_, i) => i !== index
      );
      setTripDetails((prev) => ({ ...prev, boardingPoints: updatedPoints }));
      if (updatedPoints.length === 0) {
        setErrors((prev) => ({
          ...prev,
          boardingPoints: "Boarding points must have at least one entry",
        }));
      }
    },
    [tripDetails.boardingPoints]
  );

  const handleBoardingPointChange = useCallback(
    (index: number, field: keyof BoardingPoint, value: string) => {
      const updatedPoints = tripDetails.boardingPoints.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      );
      setTripDetails((prev) => ({ ...prev, boardingPoints: updatedPoints }));
    },
    [tripDetails.boardingPoints]
  );

  const handleAddPackage = useCallback(() => {
    setTripDetails((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        { title: "", description: "", personCount: 0, price: 0 },
      ],
      price: 0, // Reset single price when adding a package
    }));
    setErrors((prev) => ({ ...prev, packages: "", price: "" }));
  }, []);

  const handleRemovePackage = useCallback(
    (index: number) => {
      const updatedPackages = tripDetails.packages.filter(
        (_, i) => i !== index
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
    [tripDetails.packages, validateField]
  );

  const handlePackageChange = useCallback(
    (index: number, field: keyof Package, value: string | number) => {
      const updatedPackages = tripDetails.packages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      );
      setTripDetails((prev) => ({
        ...prev,
        packages: updatedPackages,
        price: 0,
      }));
      validateField("packages");
    },
    [tripDetails.packages, validateField]
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
        (_, i) => i !== index
      );
      setTripDetails((prev) => ({ ...prev, roomChoices: updatedRoomChoices }));
    },
    [tripDetails.roomChoices]
  );

  const handleRoomChoiceChange = useCallback(
    (index: number, field: keyof RoomChoice, value: string | number) => {
      const updatedRoomChoices = tripDetails.roomChoices.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      );
      setTripDetails((prev) => ({ ...prev, roomChoices: updatedRoomChoices }));
      validateField("roomChoices");
    },
    [tripDetails.roomChoices, validateField]
  );

  const handleDateSelection = useCallback(
    (date: Date) => {
      const normalizedDate = startOfDay(date);
      const existingDate = tripDetails.startDates.find(
        (d) => d.date.getTime() === normalizedDate.getTime()
      );

      if (existingDate) {
        setTripDetails((prev) => ({
          ...prev,
          startDates: prev.startDates.filter(
            (d) => d.date.getTime() !== normalizedDate.getTime()
          ),
        }));
      } else {
        setSelectedDate(normalizedDate);
        setSelectedSeats(null);
        setSeatSelectionType(null);
        setBlockSeats("");
        setBlockSeatsError("");
        setIsModalOpen(true);
      }
    },
    [tripDetails.startDates]
  );

  const validateBlockSeats = useCallback((value: string) => {
    const num = parseInt(value);
    if (!value) {
      return "Number of seats is required";
    }
    if (isNaN(num) || num <= 0) {
      return "Please enter a valid number of seats";
    }
    return "";
  }, []);

  const handleModalSubmit = useCallback(() => {
    if (selectedDate && selectedSeats !== null) {
      const newStartDate: StartDate = {
        date: selectedDate,
        seats: selectedSeats,
      };
      const newDates = [...tripDetails.startDates, newStartDate].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      setTripDetails((prev) => ({ ...prev, startDates: newDates }));
      setErrors((prev) => ({ ...prev, startDates: "" }));
      setIsModalOpen(false);
      setSelectedDate(null);
      setSelectedSeats(null);
      setSeatSelectionType(null);
      setBlockSeats("");
      setBlockSeatsError("");
    } else if (seatSelectionType === "block") {
      const error = validateBlockSeats(blockSeats);
      if (error) {
        setBlockSeatsError(error);
      } else {
        const newStartDate: StartDate = {
          date: selectedDate!,
          seats: parseInt(blockSeats),
        };
        const newDates = [...tripDetails.startDates, newStartDate].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );
        setTripDetails((prev) => ({ ...prev, startDates: newDates }));
        setErrors((prev) => ({ ...prev, startDates: "" }));
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedSeats(null);
        setSeatSelectionType(null);
        setBlockSeats("");
        setBlockSeatsError("");
      }
    }
  }, [
    selectedDate,
    selectedSeats,
    seatSelectionType,
    blockSeats,
    tripDetails.startDates,
  ]);

  const validateForm = useCallback(() => {
    const requiredFields = ["title", "location", "description", "category"];
    let newErrors: FormErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!tripDetails[field as keyof TripDetails]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        isValid = false;
      }
    });

    if (tripDetails.startDates.length === 0) {
      newErrors.startDates = "At least one date with seats must be selected";
      isValid = false;
    }

    if (tripDetails.boardingPoints.length === 0) {
      newErrors.boardingPoints = "Boarding points must have at least one entry";
      isValid = false;
    } else {
      tripDetails.boardingPoints.forEach((point, index) => {
        if (!point.location || !point.time) {
          newErrors[`boardingPoint_${index}`] = `Boarding point ${
            index + 1
          }: Location and time are required`;
          isValid = false;
        }
      });
    }

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

    setErrors(newErrors);
    return isValid;
  }, [tripDetails]);

  const handleSave = useCallback(async () => {
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
      formData.append("duration", tripDetails.duration);
      formData.append("description", tripDetails.description);
      formData.append(
        "startDates",
        JSON.stringify(
          tripDetails.startDates.map((d) => ({
            date: formatDateToString(d.date),
            seats: d.seats,
          }))
        )
      );
      formData.append("category", tripDetails.category);
      formData.append("amenities", JSON.stringify(tripDetails.amenities));
      formData.append(
        "boardingPoints",
        JSON.stringify(tripDetails.boardingPoints)
      );
      formData.append("packages", JSON.stringify(tripDetails.packages));
      formData.append("roomChoices", JSON.stringify(tripDetails.roomChoices));
      if (tripDetails.file) {
        formData.append("file", tripDetails.file);
      }

      await editTrips(formData).unwrap();
      toast.success("Trip updated successfully!");
      navigate("/admin/trips");
    } catch (error) {
      toast.error("Unable to update trip.");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  }, [tripDetails, editTrips, navigate, validateForm]);

  const today = new Date();

  const inputClassName = (field: string) =>
    `w-full ${touched[field] && errors[field] ? "border-red-500" : ""}`;

  if (!id) {
    return (
      <div className="text-center py-10 text-red-500">Invalid trip ID</div>
    );
  }
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  if (isError) {
    console.error("Error fetching trip details:", error);
    return (
      <div className="text-center py-10 text-red-500">
        Error loading trip details
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Trip</h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Update Trip Banner</h2>
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
                        Drag and drop or click to upload a new banner (PNG, JPG,
                        JPEG)
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum file size: 5MB (Leave empty to keep existing
                        image)
                      </p>
                    </div>
                  )}
                </Label>
              </div>
              {touched.file && errors.file && (
                <p className="mt-2 text-sm text-red-500">{errors.file}</p>
              )}
            </div>

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
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Location"
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
                    <SelectItem value="Domestic Tours">
                      Domestic Tours
                    </SelectItem>
                  </SelectContent>
                </Select>
                {touched.category && errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>
            </div>

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

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Select Trip Dates *
              </h2>
              <BigCalendar
                localizer={localizer}
                events={tripDetails.startDates.map((d, index) => ({
                  id: index,
                  start: d.date,
                  end: d.date,
                  title: `${formatDateToString(d.date)} (${
                    d.seats === "block" ? "Block" : `${d.seats} Seats`
                  })`,
                }))}
                selectable
                onSelectSlot={(slotInfo) => handleDateSelection(slotInfo.start)}
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
                  <ul className="mt-2 list-disc pl-5 text-gray-600">
                    {tripDetails.startDates
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map((d, index) => (
                        <li key={index}>
                          {formatDateToString(d.date)} -{" "}
                          {d.seats === "block" ? "Block" : `${d.seats} Seats`}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

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
                            parseInt(e.target.value) || 0
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
                            parseInt(e.target.value) || 0
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
                            e.target.value
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
                            e.target.value
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
                            parseInt(e.target.value) || 0
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
                            parseInt(e.target.value) || 0
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
                            parseInt(e.target.value) || 0
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
                              (a) => a !== amenity.name
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

            <div>
              <h2 className="text-xl font-semibold mb-4">Boarding Points *</h2>
              {tripDetails.boardingPoints.map((boardingPoint, index) => (
                <div
                  key={index}
                  className="relative mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`location-${index}`}>
                        Pick Up Location
                      </Label>
                      <Input
                        id={`location-${index}`}
                        placeholder="Pick Up Location"
                        value={boardingPoint.location}
                        onChange={(e) =>
                          handleBoardingPointChange(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`maplink-${index}`}>Map Link (URL)</Label>
                      <Input
                        id={`maplink-${index}`}
                        placeholder="Map Link (URL)"
                        value={boardingPoint.maplink}
                        onChange={(e) =>
                          handleBoardingPointChange(
                            index,
                            "maplink",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`time-${index}`}>Pick Up Time</Label>
                      <Input
                        id={`time-${index}`}
                        type="time"
                        value={boardingPoint.time}
                        onChange={(e) =>
                          handleBoardingPointChange(
                            index,
                            "time",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`details-${index}`}>
                        Pick Up Details
                      </Label>
                      <Input
                        id={`details-${index}`}
                        placeholder="Pick Up Details"
                        value={boardingPoint.details}
                        onChange={(e) =>
                          handleBoardingPointChange(
                            index,
                            "details",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  {tripDetails.boardingPoints.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveBoardingPoint(index)}
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  )}
                  {errors[`boardingPoint_${index}`] && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors[`boardingPoint_${index}`]}
                    </p>
                  )}
                </div>
              ))}
              {errors.boardingPoints && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.boardingPoints}
                </p>
              )}
              <Button onClick={handleAddBoardingPoint} className="mt-2">
                Add Boarding Point
              </Button>
            </div>

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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Select Seats for{" "}
              {selectedDate && formatDateToString(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          <RadioGroup
            value={seatSelectionType || ""}
            onValueChange={(value) => {
              setSeatSelectionType(value as "fixed" | "block");
              setSelectedSeats(null);
              setBlockSeats("");
              setBlockSeatsError("");
              if (value === "20" || value === "32") {
                setSelectedSeats(parseInt(value));
                setSeatSelectionType("fixed");
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSeats(null);
                setSeatSelectionType(null);
                setBlockSeats("");
                setBlockSeatsError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalSubmit}
              disabled={
                seatSelectionType === "block"
                  ? !!blockSeatsError || !blockSeats
                  : !selectedSeats
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditTrips;
