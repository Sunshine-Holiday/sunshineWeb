
import React, { useEffect, useRef } from "react";
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

// Format review date
const formatReviewDate = (dateString?: string): string => {
  if (!dateString) return "Unknown Date";
  const parsedDate = new Date(dateString);
  return isValid(parsedDate) ? format(parsedDate, "dd MMM yyyy") : "Invalid Date";
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
  const carouselApisRef = useRef<Map<number, CarouselApi>>(new Map());

  // Filter approved reviews
  const approvedReviews = reviews.filter(
    (review) => review.isAdminApproved && !review.isAdminDisApproved
  );

  // Split reviews into chunks for rows
  const chunkReviews = (arr: Review[], size: number): Review[][] => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const reviewRows = chunkReviews(approvedReviews, 9);

  // Auto-loop for each carousel
  useEffect(() => {
    const intervals = Array.from(carouselApisRef.current.entries()).map(
      ([rowIndex, api]) => {
        if (!api) return null;
        return setInterval(() => {
          api.scrollNext();
        }, 5000);
      }
    );

    return () => {
      intervals.forEach((interval) => interval && clearInterval(interval));
    };
  }, [reviewRows.length]);

  // Custom navigation buttons
  const CustomPrevButton = ({ rowIndex }: { rowIndex: number }) => (
    <button
      onClick={() => {
        const api = carouselApisRef.current.get(rowIndex);
        if (api) api.scrollPrev();
      }}
      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 rounded-full p-2 shadow-md hover:bg-orange-50 transition-all duration-200 z-10"
      aria-label="Previous slide"
    >
      <ChevronLeft className="h-6 w-6 text-orange-500" />
    </button>
  );

  const CustomNextButton = ({ rowIndex }: { rowIndex: number }) => (
    <button
      onClick={() => {
        const api = carouselApisRef.current.get(rowIndex);
        if (api) api.scrollNext();
      }}
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 rounded-full p-2 shadow-md hover:bg-orange-50 transition-all duration-200 z-10"
      aria-label="Next slide"
    >
      <ChevronRight className="h-6 w-6 text-orange-500" />
    </button>
  );

  return (
    <div className="my-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Traveler Reviews
      </h2>

      {approvedReviews.length === 0 ? (
        <div className="text-center text-gray-600 py-12 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium">
            No reviews found. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {reviewRows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative px-6">
              <Carousel
                setApi={(api) => {
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
                        <div className="bg-white rounded-lg shadow-sm p-6 h-64 overflow-hidden flex flex-col border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200">
                          <div className="flex items-center mb-4">
                            <div className="bg-orange-100 p-2 rounded-full mr-3">
                              <User className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {review.user?.username || "Traveler"}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500 hover:text-orange-500 transition-colors duration-200" />
                            <span>
                              Traveled on{" "}
                              {formatReviewDate(
                                review.travelDate || review.bookingDate
                              )}
                            </span>
                          </div>

                          <div className="flex-grow overflow-y-auto">
                            <div className="prose prose-sm max-w-none text-gray-600">
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

                          {extractTextFromHtml(review.description).length >
                            200 && (
                            <button className="text-orange-500 text-sm font-medium mt-2 hover:text-orange-600 transition-colors duration-200">
                              Read more
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CustomPrevButton rowIndex={rowIndex} />
                <CustomNextButton rowIndex={rowIndex} />
              </Carousel>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        h2, h3, p, span, button {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default ReviewCarousel;
