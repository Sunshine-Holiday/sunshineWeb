import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CustomButton from "./CustomButton";
import { useGetHomeImagesQuery } from "@/store/api/gallery";
import { useGettripsQuery } from "@/store/api/trips";
import { IMAGE_URL } from "@/store/store";
import { AlertCircle, Loader2, Search, PlaneTakeoff } from "lucide-react";

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

  // slideshow
  const [currentImage, setCurrentImage] = useState<number>(0);
  const { data: images, isLoading: isImagesLoading, error: imagesError } =
    useGetHomeImagesQuery();

  // trips search
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const {
    data: tripsData,
    isLoading: isTripsLoading,
    error: tripsError,
  } = useGettripsQuery({}); // same as your TripsPage

  // Slideshow effect
  useEffect(() => {
    if (images && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [images]);

  const getStartedHandler = () => navigate("/trips");

  // normalize trips array (your API sometimes returns array directly)
  const trips = useMemo(() => {
    if (!tripsData) return [];
    return Array.isArray(tripsData) ? tripsData : tripsData?.data ?? [];
  }, [tripsData]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return trips
      .filter((t: any) => {
        const title = (t?.title ?? "").toLowerCase();
        const location = (t?.location ?? "").toLowerCase();
        return title.includes(q) || location.includes(q);
      })
      .slice(0, 6); // show top 6 results
  }, [query, trips]);

  const goToTrip = (trip: any) => {
    // ✅ choose ONE style (I used your TripsPage style)
    navigate(`/trips/${trip._id}`, { state: { trip } });
  };

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-96 lg:h-screen overflow-hidden">
      {/* Loading State */}
      {isImagesLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {imagesError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">
              Failed to load images. Please try again later.
            </p>
          </div>
        </div>
      )}

      {/* Image Slideshow */}
      {!isImagesLoading && !imagesError && images && images.length > 0 && (
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
      {!isImagesLoading && !imagesError && (!images || images.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-600">No images available.</p>
        </div>
      )}

      {/* ================= Overlay Content ================= */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
        {/* Search box */}
        <div className="w-full max-w-xl">


          {/* Suggestions dropdown */}
          <AnimatePresence>
            {isFocused && query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="mt-3 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden"
              >
                {isTripsLoading ? (
                  <div className="flex items-center gap-2 p-4 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading trips...</span>
                  </div>
                ) : tripsError ? (
                  <div className="p-4 text-red-600">
                    Failed to load trips.
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {suggestions.map((trip: any) => (
                      <button
                        key={trip._id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                        onClick={() => goToTrip(trip)}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition flex items-center gap-3"
                      >
                        <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center">
                          <PlaneTakeoff className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {trip.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trip.location}
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => navigate("/trips")}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition text-sm font-medium text-gray-700"
                    >
                      View all trips →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-gray-600">No trips found.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Button Container (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center w-full px-4 pb-3 sm:pb-5 md:pb-8 lg:pb-16">
        <CustomButton onClickHandler={getStartedHandler} />
      </div>
    </div>
  );
};

export default Hero;
