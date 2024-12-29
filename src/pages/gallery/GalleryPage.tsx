import { useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { fadeInUp } from "../../utils/animations";
import { media } from "../../constants/trip";

type MediaItem = {
  id: number;
  src?: string;
  videoSrc?: string;
  location: string;
  date: string;
};

const breakpoints = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const GalleryPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
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
          {media.map((item: MediaItem) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              className="relative rounded-lg overflow-hidden mt-4 cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.location}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <video
                  src={item.videoSrc}
                  className="w-full h-auto object-cover"
                  controls
                  muted
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white">
                  <span className="font-medium">{item.location}</span>
                  <br />
                  <span className="text-sm">{item.date}</span>
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
            <div className="flex items-center justify-center" style={{ height: "50%" }}>
  {selectedItem.src ? (
    <img
      src={selectedItem.src}
      alt={selectedItem.location}
      className="object-cover"
      style={{ width: "80%", height: "80%" }}
    />
  ) : (
    <video
      src={selectedItem.videoSrc}
      className="object-cover w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
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
              <p className="text-gray-600">Date: {selectedItem.date}</p>
              <p className="text-gray-600 mt-4">
                Description: Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Pellentesque ac justo vel dui consectetur aliquam.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
