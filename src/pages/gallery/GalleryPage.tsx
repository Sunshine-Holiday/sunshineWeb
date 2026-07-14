import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Heart,
  Share2,
  Download,
  Eye,
  Play,
  X,
  Sparkles,
  Camera,
} from "lucide-react";
import { useGetGalleryQuery } from "@/store/api/gallery";
import { IMAGE_URL } from "@/store/store";
import { useTranslation } from "react-i18next";

interface MediaFile {
  path: string;
  originalName: string;
}

type MediaItem = {
  _id: string;
  mediaType: "image" | "video";
  file: MediaFile;
  location: string;
  date: string;
  path: string;
  originalName?: string;
};

/** Pinterest-style column counts */
const breakpoints = {
  default: 5,
  1400: 4,
  1100: 3,
  700: 2,
  480: 2,
};

const GalleryPage: React.FC = () => {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetGalleryQuery();

  useEffect(() => {
    if (data) {
      const transformedGallery = (data as any[]).map((item) => ({
        ...item,
        file: {
          path: item.path,
          originalName: item.originalName,
        },
      }));
      setGallery(transformedGallery);
    }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleLike = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr || "";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 pt-20 pb-16">
      {/* Soft orange ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-orange-300/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6">
        {/* Header — compact spacing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 pt-2 text-center sm:mb-6 sm:pt-3"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            {t("gallery.badge")}
          </div>

          <h1 className="bg-gradient-to-r from-slate-900 via-orange-600 to-amber-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {t("gallery.title")}
          </h1>

          <p className="mx-auto mt-1.5 max-w-xl text-sm text-slate-600 sm:text-base">
            {t("gallery.subtitle")}
          </p>

          {gallery.length > 0 && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              {gallery.length}{" "}
              {gallery.length === 1
                ? t("gallery.memory")
                : t("gallery.memories")}
            </div>
          )}

          <div className="mx-auto mt-3 h-0.5 w-14 rounded-full bg-gradient-to-r from-orange-400 to-amber-500" />
        </motion.div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="pinterest-masonry">
            {[
              [200, 280, 220, 300],
              [260, 190, 290, 210],
              [230, 310, 180, 250],
              [270, 200, 240],
            ].map((heights, col) => (
              <div
                key={col}
                className={`pinterest-masonry-column ${
                  col === 2 ? "hidden sm:block" : ""
                } ${col === 3 ? "hidden lg:block" : ""}`}
              >
                {heights.map((h, i) => (
                  <div
                    key={i}
                    className="mb-3 animate-pulse rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50"
                    style={{ height: h }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && gallery.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-orange-100 bg-white/70 px-6 py-24 text-center shadow-sm backdrop-blur-sm">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 shadow-inner">
              <Camera className="h-9 w-9 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {t("gallery.emptyTitle")}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {t("gallery.emptyDesc")}
            </p>
          </div>
        )}

        {/* Pinterest masonry — orange theme */}
        {!isLoading && gallery.length > 0 && (
          <Masonry
            breakpointCols={breakpoints}
            className="pinterest-masonry"
            columnClassName="pinterest-masonry-column"
          >
            {gallery.map((item, index) => {
              const isHovered = hoveredItem === item._id;
              const isLiked = likedItems.has(item._id);
              const src = `${IMAGE_URL}${item.path}`;

              return (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.03, 0.45),
                  }}
                  className="pinterest-pin group mb-3 break-inside-avoid"
                  onMouseEnter={() => setHoveredItem(item._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative cursor-pointer overflow-hidden rounded-2xl border border-orange-100/80 bg-white shadow-md shadow-orange-100/40 transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-200/50">
                    {/* Natural height media */}
                    {item.mediaType === "image" ? (
                      <img
                        src={src}
                        alt={item.location || "Gallery"}
                        loading="lazy"
                        className="block h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-[0.92]"
                      />
                    ) : (
                      <div className="relative">
                        <img
                          src={src}
                          alt={item.location || "Video"}
                          loading="lazy"
                          className="block h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-[0.92]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-orange-950/30 to-transparent">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 ring-4 ring-white/40">
                            <Play className="ml-0.5 h-5 w-5 fill-current" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warm hover overlay */}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-950/75 via-orange-900/10 to-transparent transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    {/* Top-right like */}
                    <div
                      className={`absolute right-2.5 top-2.5 transition-all duration-300 ${
                        isHovered
                          ? "translate-y-0 opacity-100"
                          : "-translate-y-1 opacity-0"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => toggleLike(item._id, e)}
                        className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition ${
                          isLiked
                            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                            : "bg-white/95 text-orange-600 hover:bg-orange-50"
                        }`}
                        aria-label="Like"
                      >
                        <Heart
                          className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Bottom meta on hover */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-3.5 transition-all duration-300 ${
                        isHovered
                          ? "translate-y-0 opacity-100"
                          : "translate-y-2 opacity-0"
                      }`}
                    >
                      {item.location && (
                        <p className="truncate text-sm font-bold text-white drop-shadow-sm">
                          {item.location}
                        </p>
                      )}
                      {item.date && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-100/95">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.date)}
                        </p>
                      )}
                    </div>

                    {/* Subtle bottom accent bar */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 opacity-0 transition group-hover:opacity-100" />
                  </div>

                  {/* Caption under pin */}
                  {item.location && (
                    <div className="mt-2 flex items-center gap-1.5 px-1">
                      <MapPin className="h-3 w-3 shrink-0 text-orange-500" />
                      <p className="truncate text-xs font-semibold text-slate-700">
                        {item.location}
                      </p>
                      {isLiked && (
                        <Heart className="ml-auto h-3 w-3 shrink-0 fill-orange-500 text-orange-500" />
                      )}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </Masonry>
        )}

        {/* Lightbox — orange themed */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-6"
            onClick={() => setSelectedItem(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-orange-500 hover:border-orange-400"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-900/20 sm:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media */}
              <div className="relative flex max-h-[58vh] flex-1 items-center justify-center bg-gradient-to-br from-slate-900 to-orange-950 sm:max-h-[92vh]">
                {selectedItem.mediaType === "image" ? (
                  <img
                    src={`${IMAGE_URL}${selectedItem.path}`}
                    alt={selectedItem.location}
                    className="max-h-[58vh] w-full object-contain sm:max-h-[92vh]"
                  />
                ) : (
                  <video
                    src={`${IMAGE_URL}${selectedItem.path}`}
                    className="max-h-[58vh] w-full object-contain sm:max-h-[92vh]"
                    controls
                    autoPlay
                    muted
                  />
                )}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-orange-500/20 to-transparent" />
              </div>

              {/* Side panel */}
              <div className="flex w-full flex-col bg-gradient-to-b from-orange-50/80 to-white p-5 sm:w-80 sm:shrink-0 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedItem.location || "Memory"}
                    </h2>
                    {selectedItem.date && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-orange-500" />
                        {formatDate(selectedItem.date)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2 h-px w-full bg-gradient-to-r from-orange-200 via-amber-100 to-transparent" />

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => toggleLike(selectedItem._id, e)}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                      likedItems.has(selectedItem._id)
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200"
                        : "border border-orange-100 bg-white text-orange-700 hover:bg-orange-50"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        likedItems.has(selectedItem._id) ? "fill-current" : ""
                      }`}
                    />
                    {likedItems.has(selectedItem._id) ? "Liked" : "Like"}
                  </button>
                  <a
                    href={`${IMAGE_URL}${selectedItem.path}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white text-orange-600 transition hover:bg-orange-50"
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: selectedItem.location,
                            url: `${IMAGE_URL}${selectedItem.path}`,
                          })
                          .catch(() => {});
                      }
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-white text-orange-600 transition hover:bg-orange-50"
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto rounded-2xl border border-orange-100 bg-white/80 p-4 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
                    <Eye className="h-3.5 w-3.5" />
                    Sunshine Gallery
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Press Esc or click outside to close this memory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
