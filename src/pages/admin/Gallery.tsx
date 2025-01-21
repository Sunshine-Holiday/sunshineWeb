import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaPlus } from "react-icons/fa"; // Import the plus icon
import { fadeInUp } from "../../utils/animations";

import { useNavigate } from "react-router-dom";
import { useGetGalleryQuery } from "@/store/api/gallery";
interface MediaFile {
  public_id: string;
  url: string;
}
type MediaItem = {
  _id:string
  mediaType: "image" | "video"; // Enum type
  file: MediaFile;
  location: string;
  date: Date;
};

const breakpoints = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const { data, isLoading } = useGetGalleryQuery();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  useEffect(() => {
    if (data) {
      console.log(data);
      setGallery(data);
    }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleAddItemClick = () => {
    console.log("Add new item clicked");
    navigate("/admin/gallery/add-gallery");
    // You can implement functionality to add a new item to the gallery here
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Travel Gallery
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Capturing moments from our amazing adventures
          </p>
        </motion.div>

        <Masonry
          breakpointCols={breakpoints}
          className="flex w-auto gap-1"
          columnClassName="masonry-grid_column"
        >
          {gallery.map((item: MediaItem) => (
            <motion.div
              key={item._id}
              variants={fadeInUp}
              className="relative rounded-lg overflow-hidden mt-4 cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              {item.mediaType === "image" ? (
                <img
                  src={item.file.url}
                  alt={item.location}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <video
                  src={item.file.url}
                  className="w-full h-auto object-cover"
                  controls
                  muted
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white">
                  <span className="font-medium">{item.location}</span>
                  <br />
                  <span className="text-sm">
                    {new Date(item.date).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <div
              className="flex items-center justify-center"
              style={{ height: "50%" }}
            >
              {selectedItem.mediaType === "image" ? (
                <img
                  src={selectedItem.file.url}
                  alt={selectedItem.location}
                  className="object-cover"
                  style={{ width: "80%", height: "80%" }}
                />
              ) : (
                <video
                  src={selectedItem.file.url}
                  className="object-cover w-full h-full"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                  controls
                  autoPlay
                  muted
                />
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedItem.location}
              </h2>
              <p className="text-gray-600">
                Date: {new Date(selectedItem.date).toLocaleDateString("en-GB")}
              </p>

              <p className="text-gray-600 mt-4">
                Description: Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Pellentesque ac justo vel dui consectetur aliquam.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button with Plus Icon */}
      <button
        onClick={handleAddItemClick}
        className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Add New Item"
      >
        <FaPlus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default GalleryPage;
