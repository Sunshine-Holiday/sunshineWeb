import React, { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format as formatDate, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Wifi, Coffee, Snowflake, Power, AudioLines } from "lucide-react";
import { enUS } from "date-fns/locale";
import { useCreatetripsMutation } from "@/store/api/trips";
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

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format: (date: any, formatStr: any) =>
    formatDate(date, formatStr, { locale: enUS }),
  parse: (dateStr: any, formatStr: any) =>
    parse(dateStr, formatStr, new Date(), { locale: enUS }),
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

interface TripDetails {
  title: string;
  price: string;
  location: string;
  duration: string;
  description: string;
  startDates: StartDate[];
  category: string;
  amenities: string[];
  boardingPoints: BoardingPoint[];
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
  return formatDate(date, "dd-MM-yyyy");
};

const AdminTripForm: React.FC = () => {
  const [createTrips] = useCreatetripsMutation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    title: "",
    price: "",
    location: "",
    duration: "",
    description: "",
    startDates: [],
    category: "",
    amenities: [],
    boardingPoints: [{ location: "", time: "", details: "", maplink: "" }],
    file: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number | "block" | null>(null);
  const [seatSelectionType, setSeatSelectionType] = useState<"fixed" | "block" | null>(null);
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

  const handleChange = (field: keyof TripDetails, value: string | any) => {
    setTripDetails({ ...tripDetails, [field]: value });
    if (value) {
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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
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
      case "price":
        if (!tripDetails.price) newErrors.price = "Price is required";
        else if (isNaN(Number(tripDetails.price)))
          newErrors.price = "Price must be a number";
        break;
      case "location":
        if (!tripDetails.location) newErrors.location = "Location is required";
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
    }
    setErrors(newErrors);
  };

  const validateBlockSeats = (value: string) => {
    const num = parseInt(value);
    if (!value) {
      return "Number of seats is required";
    }
    if (isNaN(num) || num <= 0) {
      return "Please enter a valid number of seats";
    }
    return "";
  };

  const handleAddBoardingPoint = () => {
    setTripDetails({
      ...tripDetails,
      boardingPoints: [
        ...tripDetails.boardingPoints,
        { location: "", time: "", details: "", maplink: "" },
      ],
    });
    setErrors({ ...errors, boardingPoints: "" });
  };

  const handleRemoveBoardingPoint = (index: number) => {
    const updatedPoints = tripDetails.boardingPoints.filter(
      (_, i) => i !== index
    );
    setTripDetails({ ...tripDetails, boardingPoints: updatedPoints });
    if (updatedPoints.length === 0) {
      setErrors({
        ...errors,
        boardingPoints: "Boarding points must have at least one entry",
      });
    }
  };

  const handleBoardingPointChange = (
    index: number,
    field: keyof BoardingPoint,
    value: string
  ) => {
    const updatedPoints = tripDetails.boardingPoints.map((point, i) =>
      i === index ? { ...point, [field]: value } : point
    );
    setTripDetails({ ...tripDetails, boardingPoints: updatedPoints });
  };

  const handleDateSelection = (date: Date) => {
    const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
    const existingDate = tripDetails.startDates.find(
      (d) => new Date(d.date).getTime() === normalizedDate.getTime()
    );

    if (existingDate) {
      setTripDetails({
        ...tripDetails,
        startDates: tripDetails.startDates.filter(
          (d) => new Date(d.date).getTime() !== normalizedDate.getTime()
        ),
      });
    } else {
      setSelectedDate(normalizedDate);
      setSelectedSeats(null);
      setSeatSelectionType(null);
      setBlockSeats("");
      setBlockSeatsError("");
      setIsModalOpen(true);
    }
  };

  const handleModalSubmit = () => {
    if (selectedDate && selectedSeats !== null) {
      const newStartDate: StartDate = {
        date: selectedDate,
        seats: selectedSeats === "block" ? "block" : selectedSeats,
      };
      const newDates = [...tripDetails.startDates, newStartDate].sort((a, b) =>
        a.date.getTime() - b.date.getTime()
      );
      setTripDetails({ ...tripDetails, startDates: newDates });
      setErrors({ ...errors, startDates: "" });
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
        const newStartDate: StartDate = { date: selectedDate!, seats: parseInt(blockSeats) };
        const newDates = [...tripDetails.startDates, newStartDate].sort((a, b) =>
          a.date.getTime() - b.date.getTime()
        );
        setTripDetails({ ...tripDetails, startDates: newDates });
        setErrors({ ...errors, startDates: "" });
        setIsModalOpen(false);
        setSelectedDate(null);
        setSelectedSeats(null);
        setSeatSelectionType(null);
        setBlockSeats("");
        setBlockSeatsError("");
      }
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "price",
      "location",
      "description",
      "category",
      "file",
    ];
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
      newErrors.boardingPoints =
        "Boarding points must have at least one entry";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", tripDetails.title);
      formData.append("price", tripDetails.price);
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

      if (tripDetails.file) {
        formData.append("file", tripDetails.file);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Create New Trip
          </h1>

          <div className="space-y-8">
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
                <Label
                  htmlFor="banner-upload"
                  className="cursor-pointer block"
                >
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
                  placeholder="Price"
                  value={tripDetails.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  onBlur={() => handleBlur("price")}
                  className={inputClassName("price")}
                />
                {touched.price && errors.price &&
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              }
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
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            Trip Description *
          </h2>
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
          <h2 className="text-xl font-semibold mb-4">Select Trip Dates *</h2>
          <BigCalendar
            localizer={localizer}
            events={tripDetails.startDates.map((d, index) => ({
              id: index,
              start: new Date(d.date.setHours(0, 0, 0, 0)),
              end: new Date(d.date.setHours(0, 0, 0, 0)),
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
                {tripDetails.startDates.map((d, index) => (
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
          <h2 className="text-xl font-semibold mb-4">Amenities *</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {availableAmenities.map((amenity) => (
              <div key={amenity.name} className="flex items-center space-x-2">
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
                  <Label htmlFor={`maplink-${index}`}>
                    Map Link (URL)
                  </Label>
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
                      handleBoardingPointChange(index, "time", e.target.value)
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
            </div>
          ))}
          {errors.boardingPoints && (
            <p className="mt-2 text-sm text-red-500">
              {errors.boardingPoints}
            </p>
          )}
          <Button
            onClick={handleAddBoardingPoint}
            className="mt-2"
          >
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
            "Save Trip"
          )}
        </Button>
      </div>
    </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Select Seats for {selectedDate && formatDateToString(selectedDate)}
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
              disabled={seatSelectionType === "block" ? !!blockSeatsError || !blockSeats : !selectedSeats}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  </div>

  
  );
};

export default AdminTripForm;