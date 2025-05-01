import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGettripsQuery,
  useSpecial_sectionsIDQuery,
  useUpdateSpecialSectionMutation,
} from "@/store/api/trips";

const EditSpecialSection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trips: [],
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // RTK Query hooks
  const {
    data: section,
    isLoading: isLoadingSection,
    error: sectionError,
    refetch: refetchSection,
  } = useSpecial_sectionsIDQuery({ id });

  const { data: trips = [], isLoading: isLoadingTrips } = useGettripsQuery({});
  const [updateSpecialSection, { isLoading: isSubmitting }] =
    useUpdateSpecialSectionMutation();

  // Update form data when section data is fetched
  useEffect(() => {
    if (section) {
      setFormData({
        title: section.title || "",
        description: section.description || "",
        trips: section.trips
          ? section.trips.map((trip) =>
              typeof trip === "object" ? trip._id : trip
            )
          : [],
      });
    }
  }, [section]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTripSelection = (e) => {
    const tripId = e.target.value;
    const isChecked = e.target.checked;

    setFormData((prev) => {
      if (isChecked) {
        return { ...prev, trips: [...prev.trips, tripId] };
      } else {
        return { ...prev, trips: prev.trips.filter((id) => id !== tripId) };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.trips.length === 0) {
      newErrors.trips = "Please select at least one trip";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitMessage({ type: "", text: "" });

    try {
      const payload = {
        id,
        title: formData.title,
        description: formData.description,
        trips: formData.trips,
      };
      console.log(payload);
      // Using RTK Query mutation hook
      const resp = await updateSpecialSection(payload).unwrap();
      console.log(resp);
      setSubmitMessage({
        type: "success",
        text: "Special section updated successfully!",
      });

      // Refetch the section to get updated data
      refetchSection();

      // Optionally navigate back to the list after a short delay
      //   setTimeout(() => {
          navigate("/admin/special_sections");
      //   }, 2000);
    } catch (error) {
      console.error("Error updating special section:", error);
      setSubmitMessage({
        type: "error",
        text:
          error.data?.message ||
          "Failed to update special section. Please try again.",
      });
    }
  };

  if (isLoadingSection) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sectionError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">
            Failed to load special section. It may have been deleted or doesn't
            exist.
          </span>
          <button
            onClick={() => navigate("/admin/special_sections")}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Back to Special Sections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Special Section</h1>
        <button
          onClick={() => navigate("/admin/special_sections")}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to List
        </button>
      </div>

      {submitMessage.text && (
        <div
          className={`mb-4 p-3 rounded ${
            submitMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 font-medium mb-2"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium mb-2"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select Trips <span className="text-red-500">*</span>
          </label>

          {isLoadingTrips ? (
            <p className="text-gray-600">Loading trips...</p>
          ) : trips.length === 0 ? (
            <p className="text-gray-600">No trips available</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
              {trips.map((trip) => (
                <div key={trip._id} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`trip-${trip._id}`}
                    value={trip._id}
                    checked={formData.trips.includes(trip._id)}
                    onChange={handleTripSelection}
                    className="mt-1"
                  />
                  <label htmlFor={`trip-${trip._id}`} className="ml-2 block">
                    <span className="font-medium">{trip.title}</span>
                    <span className="text-sm text-gray-600 block">
                      {trip.location} - {trip.price}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {errors.trips && (
            <p className="mt-1 text-sm text-red-500">{errors.trips}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/special_sections")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSpecialSection;
