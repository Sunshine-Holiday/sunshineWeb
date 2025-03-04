import { useCreateGalleryMutation } from "@/store/api/gallery";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, VideoIcon, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const AddGallery: React.FC = () => {
  const navigate = useNavigate();
  const [createGallery] = useCreateGalleryMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    mediaType: "image" as "image" | "video",
    file: null as File | null,
    location: "",
    date: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFormData((prev) => ({ ...prev, file: selectedFile }));
    }
  };

  const handleMediaTypeChange = (type: "image" | "video") => {
    setFormData((prev) => ({ ...prev, mediaType: type, file: null }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.location || !formData.date) {
      setError("Please fill in all fields and select a file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", formData.file);
    uploadData.append("location", formData.location);
    uploadData.append("date", formData.date);
    uploadData.append("mediaType", formData.mediaType);

    try {
      setLoading(true);
      setProgress(0);

      const uploadProgress = (progressEvent: ProgressEvent) => {
        if (progressEvent.total) {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      };

      await createGallery(uploadData).unwrap();
      navigate("/admin/gallery");
      toast.success("Gallery item uploaded successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Reset form
      setFormData({
        mediaType: "image",
        file: null,
        location: "",
        date: "",
      });
      setError("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload gallery item", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="max-w-2xl w-full shadow-2xl hover:shadow-3xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-2 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold flex items-center justify-center space-x-3">
            <UploadCloud className="h-8 w-8" />
            <span>Add New Gallery Item</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Media Type Selector */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant={formData.mediaType === "image" ? "default" : "outline"}
                onClick={() => handleMediaTypeChange("image")}
                className={cn(
                  "flex-1 transition-all duration-300 ease-in-out",
                  formData.mediaType === "image" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "border-gray-300 hover:border-blue-500"
                )}
              >
                <ImageIcon className="mr-2 h-5 w-5" />
                Image
              </Button>
              <Button
                type="button"
                variant={formData.mediaType === "video" ? "default" : "outline"}
                onClick={() => handleMediaTypeChange("video")}
                className={cn(
                  "flex-1 transition-all duration-300 ease-in-out",
                  formData.mediaType === "video" 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-gray-300 hover:border-purple-500"
                )}
              >
                <VideoIcon className="mr-2 h-5 w-5" />
                Video
              </Button>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="file" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select File
              </Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  accept={formData.mediaType === "image" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                  disabled={loading}
                  className="
                    file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                    file:text-sm file:font-semibold file:bg-blue-500 
                    file:text-white hover:file:bg-blue-600
                    cursor-pointer
                    block w-full text-sm text-gray-500
                    file:transition-colors file:duration-300
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  "
                />
                {formData.file && (
                  <div className="mt-2 text-sm text-gray-500 truncate">
                    Selected: {formData.file.name}
                  </div>
                )}
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="location" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter the location"
                disabled={loading}
                className="
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all duration-300 ease-in-out
                "
              />
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="date" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                disabled={loading}
                className="
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  transition-all duration-300 ease-in-out
                "
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm animate-pulse">
                {error}
              </p>
            )}

            {/* Progress Bar */}
            {loading && (
              <Progress 
                value={progress} 
                className="w-full" 
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 mt-4 
                bg-gradient-to-r from-blue-600 to-purple-600 
                hover:from-blue-700 hover:to-purple-700 
                text-white font-bold
                transition-all duration-300 ease-in-out
                transform hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddGallery;