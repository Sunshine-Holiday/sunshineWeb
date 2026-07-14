import { useSpecial_sectionsQuery } from '@/store/api/trips';
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useTranslation } from 'react-i18next';
import TranslatedText from '@/components/TranslatedText';
import TripCard from '@/pages/trips/TripCard';

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
  [key: string]: any;
}

interface SpecialSection {
  _id: string;
  title: string;
  description?: string;
  trips: Trip[];
}

const SpecialSections = () => {
  const { t } = useTranslation();
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
    <div
      id="special-trips"
      className="scroll-mt-36 bg-gradient-to-b from-white via-orange-50/30 to-white py-16 sm:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mb-2">
            {t("special.eyebrow")}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
            {t("special.title")}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            {t("special.subtitle")}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-500 mx-auto rounded-full mt-5" />
        </div>

        <div className="space-y-14 sm:space-y-16">
          {specialSections.map((section: SpecialSection) => (
            <div
              key={section._id}
              id={`special-${section._id}`}
              className="scroll-mt-36 bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6 sm:p-8 md:p-10">
                <div className="mb-8 md:flex md:items-end md:justify-between md:gap-6">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                      <TranslatedText text={section.title} as="span" />
                    </h2>
                    {section.description && (
                      <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                        <TranslatedText text={section.description} as="span" />
                      </p>
                    )}
                  </div>
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
                        <SwiperSlide key={trip._id} className="h-auto pb-2">
                          <TripCard trip={trip} className="h-full" />
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