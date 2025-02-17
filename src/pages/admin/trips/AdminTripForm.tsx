import React, { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Wifi, Coffee, Snowflake, Power } from "lucide-react";
import { enUS } from "date-fns/locale";
import { useCreatetripsMutation } from "@/store/api/trips";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
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

interface TripDetails {
  title: string;
  price: string;
  location: string;
  duration: string;
  description: string;
  startDates: Date[];
  busSize: string;
  category: string;
  amenities: string[];
  boardingPoints: BoardingPoint[];
}

interface FormErrors {
  [key: string]: string;
}

const availableAmenities = [
  { icon: Wifi, name: "Free WiFi" },
  { icon: Coffee, name: "Refreshments" },
  { icon: Snowflake, name: "AC" },
  { icon: Power, name: "Charging Points" },
];

const AdminTripForm: React.FC = () => {
  const [createTrips] = useCreatetripsMutation();
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    title: "",
    price: "",
    location: "",
    duration: "",
    description: "",
    startDates: [],
    busSize: "",
    category: "",
    amenities: [],
    boardingPoints: [{ location: "", time: "", details: "", maplink: "" }],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleChange = (field: keyof TripDetails, value: string | any) => {
    setTripDetails({ ...tripDetails, [field]: value });
    if (value) {
      setErrors({ ...errors, [field]: "" });
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
        if (!tripDetails.title) {
          newErrors.title = "Title is required";
        }
        break;
      case "price":
        if (!tripDetails.price) {
          newErrors.price = "Price is required";
        } else if (isNaN(Number(tripDetails.price))) {
          newErrors.price = "Price must be a number";
        }
        break;
      case "location":
        if (!tripDetails.location) {
          newErrors.location = "Location is required";
        }
        break;
      case "description":
        if (!tripDetails.description) {
          newErrors.description = "Description is required";
        }
        break;
      case "busSize":
        if (!tripDetails.busSize) {
          newErrors.busSize = "Bus size is required";
        }
        break;
      case "category":
        if (!tripDetails.category) {
          newErrors.category = "Category is required";
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleAddBoardingPoint = () => {
    setTripDetails({
      ...tripDetails,
      boardingPoints: [
        ...tripDetails.boardingPoints,
        { location: "", time: "", details: "", maplink: "" },
      ],
    });
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
    const selectedDates = [...tripDetails.startDates];
    if (selectedDates.some((d) => d.getTime() === date.getTime())) {
      setTripDetails({
        ...tripDetails,
        startDates: selectedDates.filter((d) => d.getTime() !== date.getTime()),
      });
    } else {
      setTripDetails({
        ...tripDetails,
        startDates: [...selectedDates, date],
      });
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "price",
      "location",
      "description",
      "busSize",
      "category",
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
      newErrors.startDates = "At least one date must be selected";
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
    setloading(true);
    try {
      const resp = await createTrips(tripDetails).unwrap();
      toast.success("Trip created successfully!");
      navigate("/admin/trips");
    } catch (error) {
      toast.error("Unable to create trip.");
      console.error(error);
    } finally {
      setloading(false);
    }
  };

  const today = new Date();

  const inputClassName = (field: string) => `
    w-full rounded-lg p-2 
    ${
      touched[field] && errors[field]
        ? "border-2 border-red-500 focus:ring-red-500"
        : "border border-gray-300 focus:ring-blue-500"
    }
    focus:outline-none focus:ring-2
  `;

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Admin Trip Form
          </h1>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Trip Title *"
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
                <input
                  type="text"
                  placeholder="Price *"
                  value={tripDetails.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  onBlur={() => handleBlur("price")}
                  className={inputClassName("price")}
                />
                {touched.price && errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Location *"
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
                <select
                  value={tripDetails.busSize}
                  onChange={(e) => handleChange("busSize", e.target.value)}
                  onBlur={() => handleBlur("busSize")}
                  className={inputClassName("busSize")}
                >
                  <option value="">Select Bus Size *</option>
                  <option value="20">20</option>
                  <option value="32">32</option>
                </select>
                {touched.busSize && errors.busSize && (
                  <p className="mt-1 text-sm text-red-500">{errors.busSize}</p>
                )}
              </div>

              <div>
                <select
                  value={tripDetails.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  onBlur={() => handleBlur("category")}
                  className={inputClassName("category")}
                >
                  <option value="">Select Category *</option>
                  <option value="One Day Tours">One Day Tours</option>
                  <option value="Stay Package">Stay Package</option>
                  <option value="Domestic Tours">Domestic Tours</option>
                </select>
                {touched.category && errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <textarea
                  placeholder="Trip Description *"
                  value={tripDetails.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  className={`${inputClassName(
                    "description"
                  )} h-32 resize-none`}
                />
                {touched.description && errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Select Trip Dates *
              </h2>
              <BigCalendar
                localizer={localizer}
                events={tripDetails.startDates.map((date) => ({
                  start: date,
                  end: date,
                  title: "Selected",
                }))}
                selectable
                onSelectSlot={(slotInfo) => handleDateSelection(slotInfo.start)}
                views={["month"]}
                defaultView="month"
                style={{ height: 500 }}
                startAccessor="start"
                endAccessor="end"
                min={today}
              />
              {errors.startDates && (
                <p className="mt-1 text-sm text-red-500">{errors.startDates}</p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableAmenities.map((amenity) => (
                  <label key={amenity.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={tripDetails.amenities.includes(amenity.name)}
                      onChange={(e) =>
                        handleChange(
                          "amenities",
                          e.target.checked
                            ? [...tripDetails.amenities, amenity.name]
                            : tripDetails.amenities.filter(
                                (a) => a !== amenity.name
                              )
                        )
                      }
                      className="mr-2"
                    />
                    <amenity.icon className="h-5 w-5 mr-2 text-gray-600" />
                    {amenity.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Boarding Points</h2>
              {tripDetails.boardingPoints.map((boardingPoint, index) => (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Pick Up Location"
                      value={boardingPoint.location}
                      onChange={(e) =>
                        handleBoardingPointChange(
                          index,
                          "location",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg p-2 border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Map Link (URL)"
                      value={boardingPoint.maplink}
                      onChange={(e) =>
                        handleBoardingPointChange(
                          index,
                          "maplink",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg p-2 border-gray-300"
                    />
                    <input
                      type="time"
                      placeholder="Time"
                      value={boardingPoint.time}
                      onChange={(e) =>
                        handleBoardingPointChange(index, "time", e.target.value)
                      }
                      className="w-full rounded-lg p-2 border-gray-300"
                    />
                    <input
                      type="text"
                      placeholder="Pick Up Location Details"
                      value={boardingPoint.details}
                      onChange={(e) =>
                        handleBoardingPointChange(
                          index,
                          "details",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg p-2 border-gray-300"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddBoardingPoint}
                className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Boarding Point
              </button>
            </div>

            <div>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
                disabled={loading}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  "Save Trip"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTripForm;
