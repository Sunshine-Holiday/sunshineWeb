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
}

interface TripDetails {
  title: string;
  price: string;
  location: string;
  duration: string;
  startDates: Date[];
  busSize: string;
  category: string;
  amenities: string[];
  boardingPoints: BoardingPoint[];
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
  const navigate=useNavigate()
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    title: "",
    price: "",
    location: "",
    duration: "",
    startDates: [],
    busSize: "",
    category: "",
    amenities: [],
    boardingPoints: [{ location: "", time: "", details: "" }],
  });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleChange = (field: keyof TripDetails, value: string | any) => {
    setTripDetails({ ...tripDetails, [field]: value });
    if (value) {
      setErrors({ ...errors, [field]: false });
    }
  };

  const handleAddBoardingPoint = () => {
    setTripDetails({
      ...tripDetails,
      boardingPoints: [
        ...tripDetails.boardingPoints,
        { location: "", time: "", details: "" },
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
    const newErrors: { [key: string]: boolean } = {};
    if (!tripDetails.title) newErrors.title = true;
    if (!tripDetails.price) newErrors.price = true;
    if (!tripDetails.location) newErrors.location = true;
   
    if (!tripDetails.busSize) newErrors.busSize = true;
    if (!tripDetails.category) newErrors.category = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      navigate("/admin/trips")
      console.log(resp);
    } catch (error) {
      toast.error("Unable to create trip.");
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Admin Trip Form
          </h1>
          <div className="space-y-6">
            {/* Trip Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Trip Title"
                value={tripDetails.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Price"
                value={tripDetails.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
              <input
                type="text"
                placeholder="Location"
                value={tripDetails.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
              />
              {/* <input
                type="text"
                placeholder="Duration"
                value={tripDetails.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
              /> */}
              <input
                type="text"
                placeholder="Bus Size"
                value={tripDetails.busSize}
                onChange={(e) => handleChange("busSize", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.busSize ? "border-red-500" : "border-gray-300"
                }`}
              />
              <select
                value={tripDetails.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="One Trips">One Trips</option>
                <option value="Night Stays">Night Stays</option>
                <option value="National">National</option>
                {/* <option value="International">International</option> */}
              </select>
            </div>

            {/* Calendar for Date Selection */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Select Trip Dates</h2>
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
            </div>

            {/* Amenities Selection */}
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

            {/* Boarding Points Section */}
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
                className="mt-4 p-2 bg-blue-500 text-white rounded-lg"
              >
                Add Boarding Point
              </button>
            </div>

            {/* Save Button */}
            <div>
              <button
                onClick={handleSave}
                className="w-full py-3 bg-green-500 text-white font-bold rounded-lg"
                disabled={loading ? true : false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  "      Save Trip"
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
