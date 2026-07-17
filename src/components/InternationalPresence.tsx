import { X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TestimonialsCarousel from "./TestimonialsCarousel";
import image1 from "../asserts/124E5F61E2BAB89C6551F1ECBE_1721113011983.avif";
import image2 from "../asserts/2ED916277B821A333BA88B7A29_1721113011470.avif";
import image3 from "../asserts/4C4CB5DBD724AB2E8B32D610D8_1721113012644.webp";
import image4 from "../asserts/5E1EC4661F4EA18E11541F5BC7_1721113011544.webp";
import image5 from "../asserts/C36E7446CE105FD1715FC0BE36_1721113011268.avif";
import image6 from "../asserts/image6.jpg";
import { useTranslation } from "react-i18next";

const galleryImages = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image1,
  image2,
];

const GlobalTraveler = () => {
  const { t } = useTranslation();
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <section className="bg-white py-8 sm:py-12">
      {/* Destination gallery */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            {t("galleryHome.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("galleryHome.title")}
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            {t("galleryHome.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {galleryImages.map((image, index) => (
            <motion.button
              key={`${index}-${image}`}
              type="button"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
              onClick={() => setModalImage(image)}
              className={`group relative overflow-hidden rounded-2xl bg-slate-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                index === 0 || index === 5
                  ? "md:col-span-2 md:row-span-2 min-h-[220px] md:min-h-[320px]"
                  : "min-h-[140px] sm:min-h-[180px]"
              }`}
            >
              <img
                src={image}
                alt={`Travel memory ${index + 1}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 transition group-hover:opacity-80" />
              <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 opacity-0 shadow backdrop-blur transition group-hover:opacity-100 sm:text-xs">
                {t("galleryHome.view")}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div
        id="testimonials"
        className="scroll-mt-36 relative overflow-hidden border-t border-orange-100/60 bg-gradient-to-b from-orange-50/90 via-slate-50 to-white py-16 sm:py-24"
      >
        <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-10 max-w-2xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              {t("galleryHome.storiesEyebrow")}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t("galleryHome.storiesTitle")}
            </h2>
            <p className="mt-4 text-base text-slate-600">
              {t("galleryHome.storiesSubtitle")}
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl">
            <TestimonialsCarousel />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
            onClick={() => setModalImage(null)}
          >
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              src={modalImage}
              alt="Gallery preview"
              className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GlobalTraveler;
