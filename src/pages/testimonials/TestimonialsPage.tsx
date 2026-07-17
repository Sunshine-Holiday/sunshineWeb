import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageCircleHeart,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { testimonials } from "@/constants/testimonials";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const TestimonialsPage: React.FC = () => {
  const [featured, setFeatured] = useState(0);

  const prev = () =>
    setFeatured((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setFeatured((i) => (i + 1) % testimonials.length);

  const current = testimonials[featured];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 pb-24 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md"
          >
            <MessageCircleHeart className="h-3.5 w-3.5" />
            Traveller stories
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            What our guests say
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-base text-orange-50 sm:text-lg"
          >
            Real experiences from day trips and stay packages with Sunshine
            Holiday Packages — guides, memories, and paisa-vasool journeys.
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Featured carousel card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-orange-900/10 sm:p-10"
        >
          <div className="absolute right-6 top-6 text-orange-100">
            <Quote className="h-16 w-16 fill-current" />
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>

          <div className="relative mt-6 min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={featured}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
                  “{current.content}”
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={current.image}
                    alt={current.author}
                    className="h-14 w-14 rounded-full object-cover ring-4 ring-orange-100"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{current.author}</p>
                    <p className="text-sm font-medium text-orange-600">
                      {current.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                className="rounded-full border border-orange-200 p-2.5 text-orange-600 transition hover:bg-orange-50"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="rounded-full border border-orange-200 p-2.5 text-orange-600 transition hover:bg-orange-50"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFeatured(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === featured ? "w-7 bg-orange-500" : "w-2 bg-orange-200"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Grid of all stories */}
        <div className="mt-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              All reviews
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              More happy journeys
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (index % 3) * 0.06 }}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-orange-100 transition group-hover:text-orange-200" />
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600 line-clamp-6">
                  “{item.content}”
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={item.image}
                    alt={item.author}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-orange-100"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {item.author}
                    </p>
                    <p className="text-xs font-medium text-orange-600">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center text-white shadow-xl shadow-orange-200/50 sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Write your own sunshine story
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-orange-50">
            Join thousands of travellers who trust us for day trips and stay
            packages across Maharashtra.
          </p>
          <Link
            to="/trips"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-orange-600 shadow-md transition hover:bg-orange-50"
          >
            Browse trips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;
