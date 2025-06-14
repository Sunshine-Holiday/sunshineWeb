import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CustomButton from "./CustomButton";
import { useGetHomeImagesQuery } from "@/store/api/gallery";
import { IMAGE_URL } from "@/store/store";
import { AlertCircle, Loader2 } from "lucide-react";

interface Image {
  _id: string;
  path: string;
  originalName: string;
  mimeType: string;
  sequence: number;
  createdAt: string;
}

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState<number>(0);
  const { data: images, isLoading, error } = useGetHomeImagesQuery();

  // Slideshow effect
  useEffect(() => {
    if (images && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImage((prevImage) => (prevImage + 1) % images.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [images]);

  const getStartedHandler = () => {
    navigate("/trips");
  };

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-96 lg:h-screen overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load images. Please try again later.</p>
          </div>
        </div>
      )}

      {/* Image Slideshow */}
      {!isLoading && !error && images && images.length > 0 && (
        <div className="relative w-full h-full">
          <motion.img
            key={images[currentImage]._id}
            src={`${IMAGE_URL}${images[currentImage].path}`}
            alt={images[currentImage].originalName}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!images || images.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-600">No images available.</p>
          </div>
        </div>
      )}

      {/* Content Container */}
     

      {/* Button Container */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center w-full px-4 pb-3 sm:pb-5 md:pb-8 lg:pb-16">
        <CustomButton onClickHandler={getStartedHandler} />
      </div>
    </div>
  );
};

export default Hero;