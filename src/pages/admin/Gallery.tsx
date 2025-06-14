import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { X, MapPin, Calendar, AlertCircle } from "lucide-react";
import { FaPlus } from "react-icons/fa";
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
  thumbnail?: string; // Added for video thumbnails
};

const breakpoints = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<MediaItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { data, isLoading, error } = useGetGalleryQuery();
  const [deleteGalleryItem, { isLoading: isDeleting }] = useDeleteGalleryMutation();

  useEffect(() => {
    if (data) {
      const transformedGallery = data.map((item) => ({
        ...item,
        file: {
          path: item.path,
          originalName: item.originalName,
        },
      }));
      setGallery(transformedGallery);
    }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
        setConfirmDeleteItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 pt-24 pb-16 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-16">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Travel Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Relive your adventures through stunning moments captured around the globe.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              {gallery.length} Memories
            </span>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 bg-red-50 rounded-lg shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load gallery. Please try again later.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && gallery.length === 0 && (
          <div className="text-center py-16 bg-white/80 rounded-lg shadow-sm">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Memories Yet</h3>
            <p className="text-gray-600">Start your journey by adding your first memory!</p>
            <button
              onClick={handleAddItemClick}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Add Memory
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !error && gallery.length > 0 && (
          <Masonry breakpointCols={breakpoints} className="flex w-auto gap-6" columnClassName="masonry-grid_column">
            {gallery.map((item, index) => (
              <motion.div
                key={item._id}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border border-white/20 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleItemClick(item)}
              >
                {/* Media */}
                <div className="relative overflow-hidden">
                  {item.mediaType === "image" ? (
                    <img
                      src={`${IMAGE_URL}${item.path}`}
                      alt={item.location}
                      className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={item.thumbnail ? `${IMAGE_URL}${item.thumbnail}` : `${IMAGE_URL}${item.path}`}
                        alt={item.location}
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  {/* Delete Button */}
                  <button
                    className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(item);
                    }}
                    disabled={isDeleting || loadingId === item._id}
                    aria-label={`Delete ${item.location}`}
                  >
                    {isDeleting || loadingId === item._id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{item.location}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(item.date).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </Masonry>
        )}

        {/* Media Modal */}
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative bg-white/95 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-white" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedItem.location}</h2>
                    <p className="text-sm text-white/80">{new Date(selectedItem.date).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                <button
                  className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors duration-200"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Media Content */}
              <div className="flex items-center justify-center p-4">
                {selectedItem.mediaType === "image" ? (
                  <img
                    src={`${IMAGE_URL}${selectedItem.path}`}
                    alt={selectedItem.location}
                    className="max-w-full max-h-[80vh] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={`${IMAGE_URL}${selectedItem.path}`}
                    className="max-w-full max-h-[80vh] object-contain"
                    controls
                    autoPlay
                    muted
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white/95 rounded-2xl shadow-lg p-6 max-w-md w-full border border-white/20"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Delete Memory?</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this memory from {confirmDeleteItem.location}? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    onClick={cancelDelete}
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    onClick={confirmAndDelete}
                    aria-label="Confirm deletion"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={handleAddItemClick}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none hover:scale-110"
          aria-label="Add new memory"
        >
          <FaPlus className="w-6 h-6" />
        </button>

        <style jsx>{`
          .masonry-grid_column {
            background-clip: padding-box;
          }
          .masonry-grid_column > div {
            margin-bottom: 1.5rem;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GalleryPage;