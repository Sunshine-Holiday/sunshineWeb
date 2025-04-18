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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${travelImages[currentImage]})`,
          filter: "brightness(0.7)",
        }}
      />

      {/* Button container */}
      <div className="relative flex items-end justify-center min-h-screen px-4 pb-36">
        <CustomButton onClickHandler={getStartedHandler} />
      </div>
    </div>
  );
};

export default Hero;
