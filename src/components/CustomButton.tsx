
import React from "react";

interface CustomButtonProps {
  onClickHandler: () => void;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onClickHandler,
  className = "",
  children = "Get Started",
  ariaLabel = "Get Started",
}) => {
  return (
    <button
      onClick={onClickHandler}
      type="button"
      className={`flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg font-semibold text-base sm:text-lg backdrop-blur-md shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 group ${className}`}
      aria-label={ariaLabel}
    >
      <span>{children}</span>
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 group-hover:bg-orange-100 group-hover:fill-orange-500 fill-white border border-orange-500 rounded-full p-1 group-hover:border-none ease-linear duration-200"
        viewBox="0 0 16 19"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
        />
      </svg>

      <style jsx>{`
        button, span {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </button>
  );
};

export default CustomButton;
