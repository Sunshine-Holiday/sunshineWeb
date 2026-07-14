import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGetHomeImagesQuery } from "@/store/api/gallery";
import { useGettripsQuery } from "@/store/api/trips";
import { IMAGE_URL } from "@/store/store";
import {
  AlertCircle,
  Loader2,
  Search,
  MapPin,
  ArrowRight,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import TranslatedText from "@/components/TranslatedText";

interface Image {
  _id: string;
  path: string;
  originalName: string;
  mimeType: string;
  sequence: number;
  createdAt: string;
}

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const {
    data: images,
    isLoading: isImagesLoading,
    error: imagesError,
  } = useGetHomeImagesQuery();

  const {
    data: tripsData,
    isLoading: isTripsLoading,
    error: tripsError,
  } = useGettripsQuery({});

  useEffect(() => {
    if (images && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 6500);
      return () => clearInterval(interval);
    }
  }, [images]);

  const trips = useMemo(() => {
    if (!tripsData) return [];
    return Array.isArray(tripsData) ? tripsData : tripsData?.data ?? [];
  }, [tripsData]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return trips
      .filter((t: any) => {
        const title = (t?.title ?? "").toLowerCase();
        const location = (t?.location ?? "").toLowerCase();
        return title.includes(q) || location.includes(q);
      })
      .slice(0, 6);
  }, [query, trips]);

  const goToTrip = (trip: any) => {
    navigate(`/trips/${trip._id}`, { state: { trip } });
    setQuery("");
    setIsFocused(false);
  };

  const hasImages = !isImagesLoading && !imagesError && images && images.length > 0;

  return (
    <section className="relative min-h-[88vh] lg:min-h-[92vh] w-full overflow-hidden bg-slate-950">
      {/* Background slideshow */}
      <div className="absolute inset-0">
        {isImagesLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <Loader2 className="h-10 w-10 animate-spin text-orange-400" />
          </div>
        )}

        {imagesError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center px-6">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
              <p className="text-slate-300">Unable to load hero images.</p>
            </div>
          </div>
        )}

        {hasImages && (
          <AnimatePresence mode="wait">
            <motion.img
              key={(images as Image[])[currentImage]._id}
              src={`${IMAGE_URL}${(images as Image[])[currentImage].path}`}
              alt={(images as Image[])[currentImage].originalName || "Travel destination"}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </AnimatePresence>
        )}

        {!isImagesLoading && !imagesError && (!images || images.length === 0) && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80)",
            }}
          />
        )}

        {/* Layered overlays for depth & readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-orange-950/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[88vh] lg:min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-orange-100 backdrop-blur-md sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-orange-300" />
            {t("hero.badge")}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            {t("hero.titleLine1")}
            <span className="block bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">
              {t("hero.titleLine2")}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </motion.div>

        {/* Search + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 w-full max-w-2xl"
        >
          <div className="rounded-2xl border border-white/15 bg-white/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-2.5">
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                  placeholder={t("hero.searchPlaceholder")}
                  className="w-full rounded-xl border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-base"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (suggestions[0]) goToTrip(suggestions[0]);
                  else navigate("/trips");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:to-orange-700 sm:text-base"
              >
                {t("hero.exploreTrips")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence>
              {isFocused && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
                >
                  {isTripsLoading ? (
                    <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("hero.searching")}
                    </div>
                  ) : tripsError ? (
                    <div className="p-4 text-sm text-red-600">
                      {t("hero.failedLoad")}
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {suggestions.map((trip: any) => (
                        <button
                          key={trip._id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goToTrip(trip)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-orange-50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                            <PlaneTakeoff className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-slate-800">
                              <TranslatedText text={trip.title} as="span" />
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              <TranslatedText text={trip.location} as="span" />
                            </div>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => navigate("/trips")}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-orange-600 hover:bg-slate-50"
                      >
                        {t("hero.viewAllTrips")}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-slate-500">
                      {t("hero.noResults", { query })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/trips")}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              {t("hero.browsePackages")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/gallery")}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-orange-100/90 transition hover:text-white"
            >
              {t("hero.viewGallery")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            {
              icon: ShieldCheck,
              title: t("hero.trust1Title"),
              desc: t("hero.trust1Desc"),
            },
            {
              icon: Users,
              title: t("hero.trust2Title"),
              desc: t("hero.trust2Desc"),
            },
            {
              icon: MapPin,
              title: t("hero.trust3Title"),
              desc: t("hero.trust3Desc"),
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-md"
            >
              <div className="mt-0.5 rounded-lg bg-orange-500/20 p-2 text-orange-300">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-300/90">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Slide indicators */}
      {hasImages && (images as Image[]).length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {(images as Image[]).map((img, i) => (
            <button
              key={img._id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrentImage(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentImage
                  ? "w-8 bg-orange-400"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
