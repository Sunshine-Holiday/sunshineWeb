import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isValid } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";

// Define TypeScript interfaces
interface User {
  username?: string;
}

interface Review {
  _id: string;
  user?: User;
  description: string;
  bookingDate?: string;
  travelDate?: string;
  isAdminApproved: boolean;
  isAdminDisApproved: boolean;
}

interface ReviewCarouselProps {
  reviews?: Review[];
}

// Sample data (replace with your actual sample data)
const sampleReviews: Review[] = [
  {
    _id: "1",
    user: { username: "JohnDoe" },
    description: "Amazing trip! Highly recommend!",
    bookingDate: "2023-10-01",
    travelDate: "2023-10-15",
    isAdminApproved: true,
    isAdminDisApproved: false,
  },
  // Add more sample reviews as needed
];

// Format review date
const formatReviewDate = (dateString?: string): string => {
  if (!dateString) return "Unknown Date";
  const parsedDate = new Date(dateString);
  return isValid(parsedDate)
    ? format(parsedDate, "dd MMM yyyy")
    : "Invalid Date";
};

// Extract text content from HTML
const extractTextFromHtml = (html: string): string => {
  if (typeof document !== "undefined") {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  }
  return html.replace(/<[^>]*>/g, "");
};

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Use Map to store Embla API instances by row index
  const carouselApisRef = useRef<Map<number, CarouselApi>>(new Map());

  // Filter approved reviews
  const approvedReviews = reviews.filter(
    (review) => review.isAdminApproved && !review.isAdminDisApproved
  );

  // Use sample data if no reviews are available
  const displayReviews = approvedReviews.length > 0 ? approvedReviews : sampleReviews;

  // Split reviews into chunks for rows
  const chunkReviews = (arr: Review[], size: number): Review[][] => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const reviewRows = chunkReviews(displayReviews, 9);

  // Auto-loop for each carousel
  useEffect(() => {
    const intervals = Array.from(carouselApisRef.current.entries()).map(
      ([rowIndex, api]) => {
        if (!api) return null;
        return setInterval(() => {
          api.scrollNext(); // Use Embla API to scroll
        }, 5000); // Auto-scroll every 5 seconds
      }
    );

    // Clear intervals on unmount
    return () => {
      intervals.forEach((interval) => interval && clearInterval(interval));
    };
  }, [reviewRows.length]); // Re-run when number of rows changes

  // Custom navigation buttons
  const CustomPrevButton = ({ rowIndex }: { rowIndex: number }) => (
    <button
      onClick={() => {
        const api = carouselApisRef.current.get(rowIndex);
        if (api) {
          api.scrollPrev(); // Use Embla API
        }
      }}
      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
      aria-label="Previous slide"
    >
      <ChevronLeft className="h-6 w-6 text-gray-700" />
    </button>
  );

  const CustomNextButton = ({ rowIndex }: { rowIndex: number }) => (
    <button
      onClick={() => {
        const api = carouselApisRef.current.get(rowIndex);
        if (api) {
          api.scrollNext(); // Use Embla API
        }
      }}
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all z-10"
      aria-label="Next slide"
    >
      <ChevronRight className="h-6 w-6 text-gray-700" />
    </button>
  );

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6">Traveler Reviews</h2>

      <div className="space-y-12">
        {reviewRows.map((row, rowIndex) => (
          <div key={rowIndex} className="relative px-8">
            <Carousel
              setApi={(api) => {
                // Store the API in the Map using rowIndex
                if (api) {
                  carouselApisRef.current.set(rowIndex, api);
                } else {
                  carouselApisRef.current.delete(rowIndex);
                }
              }}
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                containScroll: false,
              }}
            >
              <CarouselContent>
                {row.map((review) => (
                  <CarouselItem
                    key={review._id}
                    className="md:basis-1/2 lg:basis-1/3 pl-4 pr-4"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="h-full"
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-white rounded-xl shadow-md p-6 h-64 overflow-hidden flex flex-col border border-gray-100">
                        {/* Review Header with User Info */}
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {review.user?.username || "Traveler"}
                            </h3>
                          </div>
                        </div>

                        {/* Travel Date Info */}
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            Traveled on{" "}
                            {formatReviewDate(
                              review.travelDate || review.bookingDate
                            )}
                          </span>
                        </div>

                        {/* Review Content */}
                        <div className="flex-grow overflow-y-auto">
                          <div className="prose prose-sm max-w-none">
                            {review.description.includes("<") ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: review.description,
                                }}
                              />
                            ) : (
                              <p>{review.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Read More Link for Long Reviews */}
                        {extractTextFromHtml(review.description).length >
                          200 && (
                          <button className="text-blue-600 text-sm mt-2 hover:underline">
                            Read more
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Custom navigation buttons */}
              <CustomPrevButton rowIndex={rowIndex} />
              <CustomNextButton rowIndex={rowIndex} />
            </Carousel>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewCarousel;