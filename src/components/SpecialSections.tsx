import { useSpecial_sectionsQuery } from '@/store/api/trips';
import { IMAGE_URL } from '@/store/store';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface StartDate {
  date: string;
  seats: number | 'block';
}

interface Trip {
  _id: string;
  title: string;
  banner: string;
  price: string;
  location: string;
  category: string;
  startDates: StartDate[];
  amenities: string[];
}

interface SpecialSection {
  _id: string;
  title: string;
  description?: string;
  trips: Trip[];
}

const SpecialSections = () => {
  const { data: specialSections = [], isLoading, error } = useSpecial_sectionsQuery({});
  const swiperRefs = useRef<{ [key: string]: any }>({});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-800">
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Something went wrong! </strong>
          <span className="block sm:inline">Please try again later.</span>
        </div>
      </div>
    );
  }

  if (specialSections.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Explore Our Special Collections
          </h2>
        </div>

        <div className="space-y-16">
          {specialSections.map((section: SpecialSection) => (
            <div
              key={section._id}
              className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>

                {section.description && (
                  <p className="text-gray-300 mb-8 max-w-3xl">{section.description}</p>
                )}

                <div className="relative">
                  {section.trips && section.trips.length > 3 && (
                    <button
                      onClick={() => swiperRefs.current[section._id]?.slidePrev()}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      aria-label="Previous trips"
                    >
                      <FaArrowLeft size={20} />
                    </button>
                  )}

                  {section.trips && section.trips.length > 0 ? (
                    <Swiper
                      onSwiper={(swiper) => {
                        swiperRefs.current[section._id] = swiper;
                      }}
                      modules={[Navigation, Pagination]}
                      spaceBetween={20}
                      slidesPerView={1}
                      pagination={{
                        clickable: true,
                        el: `.pagination-${section._id}`,
                      }}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                        },
                        1024: {
                          slidesPerView: 3,
                        },
                      }}
                      className="trip-swiper py-4"
                    >
                      {section.trips.map((trip: Trip) => (
                        <SwiperSlide key={trip._id}>
                          <Link to={`/trips/${trip._id}`} className="group block h-full">
                            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 border border-gray-700 h-full flex flex-col">
                              {trip.banner && (
                                <div className="relative h-48 overflow-hidden">
                                  <img
                                    src={`${IMAGE_URL}${trip.banner}`}
                                    alt={trip.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                                  />
                                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-bl-md">
                                    {trip.price}
                                  </div>
                                </div>
                              )}

                              <div className="p-4 flex-grow flex flex-col">
                                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition duration-300">
                                  {trip.title}
                                </h3>

                                <div className="flex items-center text-gray-400 mb-3">
                                  <svg
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  <span className="text-sm">{trip.location}</span>
                                </div>

                                {trip.category && (
                                  <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded mb-3">
                                    {trip.category}
                                  </span>
                                )}

                                {trip.startDates && trip.startDates.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    <span className="text-xs text-gray-400">Available:</span>
                                    {trip.startDates
                                      .filter((date): date is StartDate => !!date && typeof date.date === 'string')
                                      .slice(0, 2)
                                      .map((date, index) => (
                                        <span key={index} className="text-xs text-gray-300">
                                          {date.date}
                                          {index < Math.min(1, trip.startDates.length - 1) ? ',' : ''}
                                        </span>
                                      ))}
                                    {trip.startDates.length > 2 && (
                                      <span className="text-xs text-gray-400">
                                        +{trip.startDates.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                {trip.amenities && trip.amenities.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-auto mb-3">
                                    {trip.amenities.slice(0, 3).map((amenity, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center text-xs text-gray-300"
                                      >
                                        <svg
                                          className="h-3 w-3 mr-1 text-green-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        {amenity}
                                      </span>
                                    ))}
                                    {trip.amenities.length > 3 && (
                                      <span className="text-xs text-gray-400">
                                        +{trip.amenities.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="mt-auto flex items-center text-blue-400 font-medium text-sm">
                                  View Details
                                  <svg
                                    className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <p className="text-gray-400 italic">Trips coming soon!</p>
                  )}

                  {section.trips && section.trips.length > 3 && (
                    <button
                      onClick={() => swiperRefs.current[section._id]?.slideNext()}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      aria-label="Next trips"
                    >
                      <FaArrowRight size={20} />
                    </button>
                  )}
                </div>

                {section.trips && section.trips.length > 3 && (
                  <div className={`pagination-${section._id} flex justify-center gap-2 mt-6`}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.5;
          width: 8px;
          height: 8px;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #3b82f6;
          width: 10px;
          height: 10px;
        }
      `}</style>
    </div>
  );
};

export default SpecialSections;