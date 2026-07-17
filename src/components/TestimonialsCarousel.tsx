import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { testimonials } from "../constants/testimonials";

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const previousTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
    }),
  };

  const t = testimonials[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-orange-100/80 bg-gradient-to-br from-white via-white to-orange-50/60 p-8 shadow-xl shadow-orange-100/50 md:p-12">
      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
      <Quote className="absolute right-6 top-6 h-14 w-14 text-orange-100 md:h-16 md:w-16" />

      <div className="mb-6 flex items-center gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>

      <div className="relative min-h-[220px] md:min-h-[200px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <p className="text-center text-lg font-medium leading-relaxed text-slate-700 md:text-xl">
              “{t.content}”
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="relative">
                <img
                  src={t.image}
                  alt={t.author}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-orange-100 shadow-md md:h-20 md:w-20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-orange-500 text-[10px] font-bold text-white">
                  ★
                </span>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-slate-900">{t.author}</p>
                <p className="font-medium text-orange-600">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-orange-100/80 pt-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={previousTestimonial}
            className="rounded-full border border-orange-200 bg-white p-2.5 text-orange-600 shadow-sm transition hover:bg-orange-50 hover:shadow"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextTestimonial}
            className="rounded-full border border-orange-200 bg-white p-2.5 text-orange-600 shadow-sm transition hover:bg-orange-50 hover:shadow"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-7 bg-orange-500"
                  : "w-2 bg-orange-200 hover:bg-orange-300"
              }`}
              aria-label={`Testimonial ${index + 1}`}
            />
          ))}
        </div>

        <Link
          to="/testimonials"
          className="hidden text-sm font-semibold text-orange-600 transition hover:text-orange-700 sm:inline"
        >
          View all →
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-100">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-linear"
          style={{
            width: `${((currentIndex + 1) / testimonials.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
