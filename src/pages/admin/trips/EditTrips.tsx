import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Wifi, Coffee, Snowflake, Power } from "lucide-react";
import { enUS } from "date-fns/locale";
import { useCreatetripsMutation, useEditTtipsMutation, useGettripsIDQuery } from "@/store/api/trips";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useLocation } from "react-router-dom";

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
    _id?:string;
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

const EditTrips: React.FC = () => {
  const location = useLocation();
  const { id } = location.state;
  const { data, isError, isLoading } = useGettripsIDQuery({ id });

  const [createTrips] = useEditTtipsMutation();
  const [loading, setLoading] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    _id:id,
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

  useEffect(() => {
    if (data) {
      setTripDetails({
        _id:data._id,
        title: data.title,
        price: data.price,
        location: data.location,
        duration: data.duration,
        startDates: data.startDates.map((date: string) => new Date(date)),
        busSize: data.busSize,
        category: data.category,
        amenities: data.amenities,
        boardingPoints: data.boardingPoints,
      });
    }
  }, [data]);

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
    if (!tripDetails.duration) newErrors.duration = true;
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
    setLoading(true);
    try {
      const resp = await createTrips(tripDetails).unwrap();
      toast.success("Trip updated successfully!");
      console.log(resp);
    } catch (error) {
      toast.error("Unable to update trip.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Admin Trip Form
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
              <input
                type="text"
                placeholder="Duration"
                value={tripDetails.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className={`w-full rounded-lg p-2 ${
                  errors.duration ? "border-red-500" : "border-gray-300"
                }`}
              />
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
                <option value="Day Trips">Day Trips</option>
                <option value="Night Stays">Night Stays</option>
                <option value="National">National</option>
                <option value="International">International</option>
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
                    <amenity.icon className="w-5 h-5 mr-2" />
                    {amenity.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Boarding Points */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Boarding Points</h2>
              {tripDetails.boardingPoints.map((point, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={point.location}
                    onChange={(e) =>
                      handleBoardingPointChange(index, "location", e.target.value)
                    }
                   placeholder="Pick Up Location"
                    className="w-full rounded-lg p-2"
                  />
                  <input
                    type="time"
                    value={point.time}
                    onChange={(e) =>
                      handleBoardingPointChange(index, "time", e.target.value)
                    }
                    placeholder="Time"
                    className="w-full rounded-lg p-2"
                  />
                  <input
                    type="text"
                    value={point.details}
                    onChange={(e) =>
                      handleBoardingPointChange(index, "details", e.target.value)
                    }
                  placeholder="Pick Up Location Details"
                    className="w-full rounded-lg p-2"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddBoardingPoint}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Boarding Point
              </button>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-white" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTrips;
