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
    arrows: true,
    dotsClass: "slick-dots custom-dots",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          rows: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          rows: 2,
        }
      }
    ]
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
      className="py-8 bg-white text-gray-900"
    >
      <SpecialSections />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative inline-block mb-6"
          >
            <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-full">
              <Globe className="w-16 h-16 text-white" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
          >
            Explore the World
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connecting travelers and explorers through shared experiences and
              unforgettable journeys around the globe
            </p>
          </motion.div>
        </div>

        {/* Image Gallery */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <div className="gallery-container">
            <Slider {...settings}>
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  className="p-3 group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="relative h-[220px] bg-cover bg-center rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                    style={{ backgroundImage: `url(${image})` }}
                    onClick={() => openModal(image)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/50 transition-all duration-300"></div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* View icon */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </Slider>
          </div>
        </motion.div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-white hover:text-orange-400 transition-colors duration-200 bg-black/50 hover:bg-orange-500/20 rounded-full p-3 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              className="relative max-w-4xl max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalImage ?? ""}
                alt="Gallery Image"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        )}

        {/* Testimonials Section */}
        <motion.div 
          className="mt-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Traveler Stories</h3>
            <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-4">
              Hear from our amazing travelers about their unforgettable experiences
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <TestimonialsCarousel />
          </div>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .gallery-container .slick-dots {
          bottom: -50px;
          display: flex !important;
          justify-content: center;
          gap: 12px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .gallery-container .slick-dots li {
          width: auto;
          height: auto;
          margin: 0;
        }
        
        .gallery-container .slick-dots li button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fed7aa;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.7;
        }
        
        .gallery-container .slick-dots li button:before {
          display: none;
        }
        
        .gallery-container .slick-dots li.slick-active button {
          background: #f97316;
          opacity: 1;
          transform: scale(1.2);
        }
        
        .gallery-container .slick-prev,
        .gallery-container .slick-next {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          border: 2px solid #fed7aa;
          color: #f97316;
          z-index: 10;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .gallery-container .slick-prev:hover,
        .gallery-container .slick-next:hover {
          background: #fff7ed;
          border-color: #f97316;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
          transform: scale(1.05);
        }
        
        .gallery-container .slick-prev {
          left: -60px;
        }
        
        .gallery-container .slick-next {
          right: -60px;
        }
        
        .gallery-container .slick-prev:before,
        .gallery-container .slick-next:before {
          font-size: 18px;
          color: #f97316;
          opacity: 1;
        }
        
        @media (max-width: 1024px) {
          .gallery-container .slick-prev {
            left: -30px;
          }
          .gallery-container .slick-next {
            right: -30px;
          }
        }
        
        @media (max-width: 640px) {
          .gallery-container .slick-prev,
          .gallery-container .slick-next {
            width: 40px;
            height: 40px;
          }
          .gallery-container .slick-prev {
            left: -20px;
          }
          .gallery-container .slick-next {
            right: -20px;
          }
        }
      `}</style>
    </motion.section>
  );
};

export default GlobalTraveler;