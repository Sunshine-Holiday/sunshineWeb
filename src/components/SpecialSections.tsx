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
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-sm" role="alert">
          <strong className="font-semibold">Something went wrong! </strong>
          <span className="block sm:inline">Please try again later.</span>
        </div>
      </div>
    );
  }

  if (specialSections.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            Explore Our Special Collections
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-20">
          {specialSections.map((section: SpecialSection) => (
            <div
              key={section._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{section.title}</h2>
                  {section.description && (
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="relative">
                  {section.trips && section.trips.length > 3 && (
                    <button
                      onClick={() => swiperRefs.current[section._id]?.slidePrev()}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white text-orange-500 p-4 rounded-full shadow-lg hover:bg-orange-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-orange-200"
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
                      spaceBetween={24}
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
                      className="trip-swiper py-6"
                    >
                      {section.trips.map((trip: Trip) => (
                        <SwiperSlide key={trip._id}>
                          <Link to={`/trips/${trip._id}`} className="group block h-full">
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col group-hover:-translate-y-1">
                              {trip.banner && (
                                <div className="relative h-56 overflow-hidden">
                                  <img
                                    src={`${IMAGE_URL}${trip.banner}`}
                                    alt={trip.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                                    {trip.price}
                                  </div>
                                </div>
                              )}

                              <div className="p-6 flex-grow flex flex-col">
                                <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition duration-300 leading-tight">
                                  {trip.title}
                                </h3>

                                <div className="flex items-center text-gray-500 mb-4">
                                  <svg
                                    className="h-5 w-5 mr-2 text-orange-500"
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
                                  <span className="text-sm font-medium">{trip.location}</span>
                                </div>

                                {trip.category && (
                                  <span className="inline-block bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full mb-4 font-medium w-fit">
                                    {trip.category}
                                  </span>
                                )}

                                {trip.startDates && trip.startDates.length > 0 && (
                                  <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-700 block mb-2">Available Dates:</span>
                                    <div className="flex flex-wrap gap-2">
                                      {trip.startDates
                                        .filter((date): date is StartDate => !!date && typeof date.date === 'string')
                                        .slice(0, 2)
                                        .map((date, index) => (
                                          <span key={index} className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-md border">
                                            {date.date}
                                          </span>
                                        ))}
                                      {trip.startDates.length > 2 && (
                                        <span className="text-xs text-orange-600 font-medium px-2 py-1">
                                          +{trip.startDates.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {trip.amenities && trip.amenities.length > 0 && (
                                  <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                      {trip.amenities.slice(0, 3).map((amenity, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md"
                                        >
                                          <svg
                                            className="h-3 w-3 mr-1 text-orange-500"
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
                                        <span className="text-sm text-orange-600 font-medium px-2 py-1">
                                          +{trip.amenities.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-auto flex items-center justify-between">
                                  <div className="flex items-center text-orange-600 font-semibold text-base">
                                    View Details
                                    <svg
                                      className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
                            </div>
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-gray-400 text-6xl mb-4">🎯</div>
                      <p className="text-gray-500 text-lg font-medium">Exciting trips coming soon!</p>
                    </div>
                  )}

                  {section.trips && section.trips.length > 3 && (
                    <button
                      onClick={() => swiperRefs.current[section._id]?.slideNext()}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white text-orange-500 p-4 rounded-full shadow-lg hover:bg-orange-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center border border-orange-200"
                      aria-label="Next trips"
                    >
                      <FaArrowRight size={20} />
                    </button>
                  )}
                </div>

                {section.trips && section.trips.length > 3 && (
                  <div className={`pagination-${section._id} flex justify-center gap-3 mt-8`}></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .swiper-pagination-bullet {
          background: #fed7aa;
          opacity: 0.7;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #f97316;
          width: 14px;
          height: 14px;
          transform: scale(1.1);
        }
        .swiper-pagination-bullet:hover {
          opacity: 1;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default SpecialSections;