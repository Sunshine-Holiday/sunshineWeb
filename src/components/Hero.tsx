import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import { useNavigate } from "react-router-dom";
import image1 from "@/asserts/Kokan1.png";
import image2 from "@/asserts/Kokan2.png";
import image3 from "@/asserts/Kokan3.png";
import image4 from "@/asserts/Kokan4.png";
import image5 from "@/asserts/Kokan5.png";
import image6 from "@/asserts/Kokan.png";

const travelImages: string[] = [image1, image2, image3, image4, image5, image6];

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % travelImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const getStartedHandler = () => {
    navigate("/trips");
  };

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-96 lg:h-screen overflow-hidden">
      {/* Image as regular element with better mobile optimization */}
      <div className="relative w-full h-full">
        <img
          src={travelImages[currentImage]}
          alt="Travel destination"
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
          style={{ filter: "brightness(0.7)" }}
        />
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center px-4 sm:px-6 md:px-8">
          {/* You can add a heading or text here if needed */}
        </div>
      </div>

      {/* Button Container - positioned better for mobile */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center w-full px-4 pb-3 sm:pb-5 md:pb-8 lg:pb-16">
        <CustomButton onClickHandler={getStartedHandler} />
      </div>
    </div>
  );
};

export default Hero;