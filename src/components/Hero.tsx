import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar } from 'lucide-react';

const travelImages: string[] = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
  'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'https://images.unsplash.com/photo-1496950866446-3253e1470e8e',
];

type MousePosition = {
  x: number;
  y: number;
};

export const Hero: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  // Handle mouse move to update position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Change image background every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % travelImages.length);
    }, 7000); // Change image every 7 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Static background with transition */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url("${travelImages[currentImage]}")`,
          filter: 'brightness(0.7)',
        }}
      />

      {/* Moving content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{
            translateX: mousePosition.x * 0.02,
            translateY: mousePosition.y * 0.02,
          }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-white/90 mb-12">
            Explore the world with unforgettable experiences
          </p>
        </motion.div>

        <motion.div
          style={{
            translateX: -mousePosition.x * 0.01,
            translateY: -mousePosition.y * 0.01,
          }}
          className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="Where to?"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Dates</label>
                <input
                  type="date"
                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <button className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors duration-200">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
