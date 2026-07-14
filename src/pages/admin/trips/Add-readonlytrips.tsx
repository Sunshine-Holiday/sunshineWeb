import React, { useMemo, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Wifi, Coffee, Snowflake, Power, AudioLines } from "lucide-react";
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
import BoardingPointsEditor from "@/components/admin/BoardingPointsEditor";
import { getStateOptions } from "@/utils/tripDestinations";

interface BoardingPoint {
  location: string;
  time: string;
  details: string;
  maplink: string;
  pickupLocationId?: string;
}

interface TripDetails {
  title: string;
  location: string;
  state: string;
  duration: string;
  description: string;
  category: string;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  file?: File | null;
  readonly: boolean;
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

const AddReadonlyTrips: React.FC = () => {
  const [createTrips] = useCreatetripsMutation();
  const { data: allTripsData } = useGettripsQuery({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [customState, setCustomState] = useState("");
  const [stateSelectValue, setStateSelectValue] = useState("");
  const stateOptions = useMemo(() => {
    const trips = Array.isArray(allTripsData)
      ? allTripsData
      : (allTripsData as any)?.data ?? [];
    return getStateOptions(trips);
  }, [allTripsData]);
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    title: "",
    location: "",
    state: "",
    duration: "",
    description: "",
    category: "",
    amenities: [],
    boardingPoints: [{ location: "", time: "", details: "", maplink: "" }],
    file: null,
    readonly: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"];

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
        setErrors({ ...errors, file: "Please upload a PNG, JPG, or JPEG file" });
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
      case "description":
        if (!tripDetails.description) newErrors.description = "Description is required";
        break;
      case "category":
        if (!tripDetails.category) newErrors.category = "Category is required";
        break;
      case "amenities":
        if (tripDetails.amenities.length === 0) newErrors.amenities = "At least one amenity is required";
        break;
      case "file":
        if (!tripDetails.file) newErrors.file = "Banner image is required";
        break;
    }
    setErrors(newErrors);
  };

  const handleBoardingPointsChange = (points: BoardingPoint[]) => {
    setTripDetails({ ...tripDetails, boardingPoints: points });
    if (points.length > 0) {
      setErrors({ ...errors, boardingPoints: "" });
    }
  };

  const validateForm = () => {
    const requiredFields = ["title", "location", "state", "description", "category", "file"];
    let newErrors: FormErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!tripDetails[field as keyof TripDetails]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
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
      formData.append("category", tripDetails.category);
      formData.append("amenities", JSON.stringify(tripDetails.amenities));
      formData.append("boardingPoints", JSON.stringify(tripDetails.boardingPoints));
      if (tripDetails.file) formData.append("file", tripDetails.file);
      formData.append("readonly", "true");

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

  const inputClassName = (field: string) => `w-full ${touched[field] && errors[field] ? "border-red-500" : ""}`;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Read-Only Trip</h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload Trip Banner *</h2>
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
                      <img src={imagePreview} alt="Banner preview" className="max-h-48 mx-auto rounded-lg" />
                      <p className="mt-2 text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">Drag and drop or click to upload a banner (PNG, JPG, JPEG)</p>
                      <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
                    </div>
                  )}
                </Label>
              </div>
              {touched.file && errors.file && <p className="mt-2 text-sm text-red-500">{errors.file}</p>}
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
                {touched.title && errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
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
                {touched.location && errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
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
                    <SelectItem value="Educational Tours">Educational Tours</SelectItem>
                  </SelectContent>
                </Select>
                {touched.category && errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
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
                className={`border ${touched.description && errors.description ? "border-red-500" : "border-gray-300"} rounded-lg`}
                style={{ height: "200px", marginBottom: "40px" }}
              />
              {touched.description && errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
                          : tripDetails.amenities.filter((a) => a !== amenity.name);
                        handleChange("amenities", newAmenities);
                        validateField("amenities");
                      }}
                    />
                    <Label htmlFor={amenity.name} className="flex items-center space-x-2">
                      <amenity.icon className="h-5 w-5 text-gray-600" />
                      <span>{amenity.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
              {touched.amenities && errors.amenities && <p className="mt-2 text-sm text-red-500">{errors.amenities}</p>}
            </div>

            <BoardingPointsEditor
              boardingPoints={tripDetails.boardingPoints}
              onChange={handleBoardingPointsChange}
              error={errors.boardingPoints}
            />

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              {loading ? <FaSpinner className="animate-spin h-5 w-5" /> : "Save Trip"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReadonlyTrips;