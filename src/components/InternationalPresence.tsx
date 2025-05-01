import { Globe, X, ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import TestimonialsCarousel from "./TestimonialsCarousel";
import image1 from "../asserts/124E5F61E2BAB89C6551F1ECBE_1721113011983.avif";
import image2 from "../asserts/2ED916277B821A333BA88B7A29_1721113011470.avif";
import image3 from "../asserts/4C4CB5DBD724AB2E8B32D610D8_1721113012644.webp";
import image4 from "../asserts/5E1EC4661F4EA18E11541F5BC7_1721113011544.webp";
import image5 from "../asserts/C36E7446CE105FD1715FC0BE36_1721113011268.avif";
import image6 from "../asserts/image6.jpg";
import { useState } from "react";
import { motion } from "framer-motion";
import SpecialSections from "./SpecialSections";

const GlobalTraveler = () => {
  const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image1,
    image2,
    image3,
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);


  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    rows: 3,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true, // Disable default arrows


  };

  const openModal = (image: string) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-gray-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Globe className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h2 className="text-4xl font-bold mb-4">Explore the World</h2>
          <p className="text-xl text-gray-300">
            Connecting travelers and explorers through shared experiences and
            journeys
          </p>
        </div>

        {/* Slick Carousel */}
        <div className="mt-12">
          <Slider {...settings}>
            {images.map((image, index) => (
              <motion.div
                key={index}
                className="p-4 group"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="relative h-[200px] bg-cover bg-center rounded-xl overflow-hidden"
                  style={{ backgroundImage: `url(${image})` }}
                  onClick={() => openModal(image)}
                >
                  <div className="absolute inset-0"></div>
                </div>
              </motion.div>
            ))}
          </Slider>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2"
            >
              <X />
            </button>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={modalImage ?? ""}
                alt="Modal"
                className="max-w-full max-h-screen object-contain"
              />
            </motion.div>
          </div>
        )}
        <SpecialSections/>

        {/* Video and Testimonials Section */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <motion.div
            className="bg-gray-800 p-8 rounded-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6">Our Journey</h3>
            <div className="aspect-w-16 aspect-h-9 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 transition-colors">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800 p-8 rounded-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold mb-6">Traveler Stories</h3>
            <TestimonialsCarousel />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default GlobalTraveler;
