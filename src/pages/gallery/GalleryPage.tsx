import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { X, MapPin, Calendar, Heart, Share2, Download, Eye, Play } from "lucide-react";
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data, isLoading } = useGetGalleryQuery();


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
        closeModal();
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

  // const handleDeleteItem = async (_id: string) => {
  //   setLoadingId(_id);
  //   try {
  //     await deleteGalleryItem({ _id }).unwrap();
  //     setGallery(gallery.filter((item) => item._id !== _id));
  //   } catch (error) {
  //     console.error("Error deleting item:", error);
  //   } finally {
  //     setLoadingId(null);
  //   }
  // };

  const confirmDelete = (item: MediaItem) => {
    setConfirmDeleteItem(item);
  };

  const cancelDelete = () => {
    setConfirmDeleteItem(null);
  };

  // const confirmAndDelete = () => {
  //   if (confirmDeleteItem) {
  //     handleDeleteItem(confirmDeleteItem._id);
  //     setConfirmDeleteItem(null);
  //   }
  // };

  const toggleLike = (itemId: string) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(itemId)) {
      newLikedItems.delete(itemId);
    } else {
      newLikedItems.add(itemId);
    }
    setLikedItems(newLikedItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 pt-24 pb-16">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-16">
     
          <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Travel Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Capturing breathtaking moments from our incredible adventures around the world
          </p>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span>{gallery.length} Memories</span>
            </div>
           
          </div>
        </motion.div>

    

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-200 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <Eye className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No memories yet</h3>
            <p className="text-gray-600">Start your adventure and create your first memory!</p>
          </div>
        ) : (
          <Masonry breakpointCols={breakpoints} className="flex w-auto gap-6" columnClassName="masonry-grid_column">
            {gallery.map((item: MediaItem, index: number) => (
              <motion.div
                key={item._id}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 backdrop-blur-sm border border-white/50 cursor-pointer"
                onMouseEnter={() => setHoveredItem(item._id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image/Video Container */}
                <div className="relative overflow-hidden">
                  {item.mediaType === "image" ? (
                    <img
                      src={`${IMAGE_URL}${item.path}`}
                      alt={item.location}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={`${IMAGE_URL}${item.path}`} // Fallback thumbnail for video
                        alt={item.location}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-8 h-8 text-orange-600 ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Action Buttons */}
                  <div
                    className={`absolute top-4 right-4 flex space-x-2 transition-all duration-300 ${
                      hoveredItem === item._id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item._id);
                      }}
                      className={`w-10 h-10 rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center ${
                        likedItems.has(item._id)
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedItems.has(item._id) ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(item);
                      }}
                      className="w-10 h-10 bg-white/90 backdrop-blur-md text-gray-700 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center"
                      disabled={  loadingId === item._id}
                    >
                      {  loadingId === item._id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                      {item.location}
                    </h3>
                    {likedItems.has(item._id) && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Adventure</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.date).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                  {/* Progress Bar Animation */}
                  <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-1000 ${
                        hoveredItem === item._id ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </Masonry>
        )}

        {/* Media Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={closeModal}
          >
            <div
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedItem.location}</h2>
                      <p className="text-white/80">{new Date(selectedItem.date).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 flex items-center justify-center">
                      <Download className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 flex items-center justify-center">
                      <Share2 className="w-6 h-6" />
                    </button>
                    <button
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 flex items-center justify-center"
                      onClick={closeModal}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Media Content */}
              <div className="flex items-center justify-center">
                {selectedItem.mediaType === "image" ? (
                  <img
                    src={`${IMAGE_URL}${selectedItem.path}`}
                    alt={selectedItem.location}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                ) : (
                  <video
                    src={`${IMAGE_URL}${selectedItem.path}`}
                    className="max-w-full max-h-[90vh] object-contain"
                    controls
                    autoPlay
                    muted
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-in zoom-in-95 duration-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Memory?</h2>
                <p className="text-gray-600 mb-8">
                  Are you sure you want to delete this precious memory? This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    onClick={cancelDelete}
                  >
                    Keep It
                  </button>
        
                </div>
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
          button,
          h1,
          h2,
          p {
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          @keyframes animate-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-in {
            animation: animate-in 0.3s ease-out;
          }
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          .zoom-in-95 {
            animation: zoomIn 0.3s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GalleryPage;