import { useCreateGalleryMutation } from "@/store/api/gallery";
import React, { useState } from "react";
import { FaImage, FaVideo } from "react-icons/fa"; // Icons for file type selection
import { toast } from "react-toastify";

const AddGallery: React.FC = () => {
  // State to manage form input values
  const [createGallery] = useCreateGalleryMutation();
  const [mediaType, setMediaType] = useState<"image" | "video">("image"); // Default to image
  const [file, setFile] = useState<File | null>(null); // To hold the selected file
  const [location, setLocation] = useState<string>(""); // To store location
  const [date, setDate] = useState<string>(""); // To store date
  const [error, setError] = useState<string>(""); // To manage form errors
  const [loading, setLoading] = useState<boolean>(false); // To manage button loading state
  const [progress, setProgress] = useState<number>(0); // To manage the file upload progress

  // Handle file selection (Image or Video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle media type toggle
  const handleMediaTypeChange = (type: "image" | "video") => {
    setMediaType(type);
    setFile(null); // Clear the previous file when media type changes
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !location || !date) {
      setError("Please fill in all fields and select a file.");
      return;
    }

    // Construct FormData to handle file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("mediaType", mediaType);

    try {
      setLoading(true); // Start loading
      setProgress(0); // Reset progress

      // Create a custom fetch function to track progress
      const uploadProgress = (progressEvent: ProgressEvent) => {
        if (progressEvent.total) {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total)); // Update progress
        }
      };

      const resp = await createGallery(formData).unwrap();

      toast.success("Gallery item uploaded successfully");
      console.log(resp);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload gallery item");
    } finally {
      setLoading(false); // Stop loading
      setProgress(100); // Ensure progress reaches 100%
      // Reset the form after submission
      setFile(null);
      setLocation("");
      setDate("");
      setError(""); // Clear error message
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Add New Gallery Item</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          {/* Media Type Selector */}
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => handleMediaTypeChange("image")}
              className={`${
                mediaType === "image" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              } p-4 rounded-lg flex items-center space-x-2`}
            >
              <FaImage size={24} />
              <span>Image</span>
            </button>
            <button
              type="button"
              onClick={() => handleMediaTypeChange("video")}
              className={`${
                mediaType === "video" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              } p-4 rounded-lg flex items-center space-x-2`}
            >
              <FaVideo size={24} />
              <span>Video</span>
            </button>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select File</label>
            <input
              type="file"
              accept={mediaType === "image" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Location Input */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter the location"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Date Input */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Progress Bar */}
          {loading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button with Loading Spinner */}
          <button
            type="submit"
            className={`w-full ${loading ? "bg-gray-500" : "bg-blue-600"} text-white p-3 rounded-lg flex items-center justify-center space-x-2 ${loading ? "cursor-not-allowed" : "hover:bg-blue-700"}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <span>Add Item</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGallery;
