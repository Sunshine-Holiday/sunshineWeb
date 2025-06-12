
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
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-semibold text-gray-800 mb-4">Travel Gallery</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Capturing moments from our amazing adventures
          </p>
        </motion.div>

      

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center text-gray-600">
            No gallery items found. Add your first item!
          </div>
        ) : (
          <Masonry
            breakpointCols={breakpoints}
            className="flex w-auto gap-6"
            columnClassName="masonry-grid_column"
          >
            {gallery.map((item: MediaItem) => (
              <motion.div
                key={item._id}
                variants={fadeInUp}
                className="relative rounded-lg overflow-hidden mt-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
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
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <span className="font-medium">{item.location}</span>
                    <br />
                    <span className="text-sm">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(item);
                  }}
                  className="absolute top-2 right-2 bg-orange-500 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
                  disabled={isDeleting && loadingId === item._id}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </Masonry>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white/90 backdrop-blur-md rounded-lg overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-orange-500 transition-colors duration-200"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-center p-6">
              {selectedItem.mediaType === "image" ? (
                <img
                  src={`${IMAGE_URL}${selectedItem.path}`}
                  alt={selectedItem.location}
                  className="object-contain max-w-full max-h-[80vh]"
                />
              ) : (
                <video
                  src={`${IMAGE_URL}${selectedItem.path}`}
                  className="object-contain max-w-full max-h-[80vh]"
                  controls
                  autoPlay
                  muted
                />
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedItem.location}
              </h2>
              <p className="text-sm text-gray-600">
                Date: {new Date(selectedItem.date).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to delete this item?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={cancelDelete}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors duration-200"
                onClick={confirmAndDelete}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .masonry-grid_column {
          background-clip: padding-box;
        }
        .masonry-grid_column > div {
          margin-bottom: 1.5rem;
        }
        button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        h1, h2, p {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;
