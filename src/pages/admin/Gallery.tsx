import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { fadeInUp } from "../../utils/animations";

import { useNavigate } from "react-router-dom";
import { useGetGalleryQuery, useDeleteGalleryMutation } from "@/store/api/gallery";
import { IMAGE_URL } from "@/store/store";

interface MediaFile {
  path: string;
  originalName: string;
}

type MediaItem = {
  _id: string;
  mediaType: "image" | "video";
  file: MediaFile;
  location: string;
  date: string;
  path: string;
};

const breakpoints = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const { data, isLoading } = useGetGalleryQuery();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteGalleryItem, { isLoading: isDeleting }] = useDeleteGalleryMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (data) {
      // Transform data to match MediaItem type
      const transformedGallery = data.map(item => ({
        ...item,
        file: {
          path: item.path,
          originalName: item.originalName
        }
      }));
      setGallery(transformedGallery);
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
    navigate("/admin/gallery/add-gallery");
  };

  const handleDeleteItem = async (_id: string) => {
    setLoadingId(_id);
    try {
      await deleteGalleryItem({ _id }).unwrap();
      setGallery(gallery.filter((item) => item._id !== _id));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const confirmDelete = (item: MediaItem) => {
    setConfirmDeleteItem(item);
  };

  const cancelDelete = () => {
    setConfirmDeleteItem(null);
  };

  const confirmAndDelete = () => {
    if (confirmDeleteItem) {
      handleDeleteItem(confirmDeleteItem._id);
      setConfirmDeleteItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Travel Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Capturing moments from our amazing adventures
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center text-gray-500">
            No gallery items found. Add your first item!
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpoints}
            className="flex w-auto gap-4"
            columnClassName="masonry-grid_column"
          >
            {gallery.map((item: MediaItem) => (
              <motion.div
                key={item._id}
                variants={fadeInUp}
                className="relative rounded-lg overflow-hidden mt-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {item.mediaType === "image" ? (
                  <img
                    src={`${IMAGE_URL}${item.path}`}
                    alt={item.location}
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video
                  src={`${IMAGE_URL}${item.path}`}
                    className="w-full h-auto object-cover"
                    muted
                    playsInline
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

                <button
                  className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 focus:outline-none transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(item);
                  }}
                  disabled={isDeleting || loadingId === item._id}
                >
                  {isDeleting || loadingId === item._id ? (
                    <span className="loader">Loading...</span>
                  ) : (
                    <X size={18} />
                  )}
                </button>
              </motion.div>
            ))}
          </Masonry>
        )}
      </div>

      {/* Modal and Confirmation Modal components remain the same as in previous version */}
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
            <div className="flex items-center justify-center" style={{ height: "50%" }}>
              {selectedItem.mediaType === "image" ? (
                <img
                src={`${IMAGE_URL}${selectedItem.path}`}
                  alt={selectedItem.location}
                  className="object-cover"
                  style={{ width: "80%", height: "80%" }}
                />
              ) : (
                <video
                  src={`${IMAGE_URL}${selectedItem.path}`}
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
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Are you sure you want to delete this item?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={cancelDelete}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmAndDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleAddItemClick}
        className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-110"
        aria-label="Add New Item"
      >
        <FaPlus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default GalleryPage;