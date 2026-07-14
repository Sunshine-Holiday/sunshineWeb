import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Map,
  Wifi,
  Coffee,
  Snowflake,
  Power,
  Music2,
  CheckCircle2,
  MessageCircle,
  FileText,
  Armchair,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parse, isValid, format } from "date-fns";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import TranslatedText from "@/components/TranslatedText";

interface StartDate {
  date: string;
  _id?: string;
  seats?: number | "block";
}

export interface TripCardTrip {
  _id: string;
  readonly?: boolean;
  title: string;
  location?: string;
  category?: string;
  duration?: string;
  busSize?: string;
  startDates?: (StartDate | null | undefined)[];
  price?: number | string;
  banner?: string;
  image?: string;
  discountPercentage?: number;
  amenities?: string[];
  highlights?: string[];
  includes?: string[];
  mapLink?: string;
  boardingPoints?: {
    location?: string;
    maplink?: string;
  }[];
  brochureFile?: string;
  brochureImage?: string;
  description?: string;
}

interface TripCardProps {
  trip: TripCardTrip;
  /** Optional: compact mode for carousels */
  className?: string;
}

const amenityIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("wifi")) return Wifi;
  if (n.includes("refresh") || n.includes("food") || n.includes("meal"))
    return Coffee;
  if (n.includes("ac") || n.includes("air")) return Snowflake;
  if (n.includes("charg")) return Power;
  if (n.includes("music") || n.includes("fun")) return Music2;
  if (n.includes("seat")) return Armchair;
  return CheckCircle2;
};

const isValidStartDate = (
  startDate: unknown
): { date: Date; seats: number | "block" | "N/A" } | null => {
  if (!startDate || typeof startDate !== "object" || !("date" in startDate)) {
    return null;
  }
  const { date, seats } = startDate as StartDate;
  if (typeof date !== "string" || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return null;
  }
  const parsedDate = parse(date, "dd-MM-yyyy", new Date());
  if (!isValid(parsedDate)) return null;
  if (seats === undefined) return { date: parsedDate, seats: "N/A" };
  if (seats !== "block" && (typeof seats !== "number" || seats < 0)) return null;
  return { date: parsedDate, seats };
};

const mediaUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMAGE_URL}${path}`;
};

export const TripCard = ({ trip, className = "" }: TripCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bannerPath = trip.banner || trip.image;
  const bannerURL =
    mediaUrl(bannerPath) ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";

  const readonly = trip?.readonly || false;
  const priceNum = Number(trip.price) || 0;

  const validStartDates = (trip.startDates || [])
    .map(isValidStartDate)
    .filter(
      (item): item is { date: Date; seats: number | "block" | "N/A" } =>
        item !== null
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDates = validStartDates.filter((item) => item.date >= today);
  const datesCount = futureDates.length || validStartDates.length;

  const hasDiscount =
    trip.discountPercentage !== undefined &&
    trip.discountPercentage > 0 &&
    trip.discountPercentage <= 100 &&
    priceNum > 0;
  const discountedPrice = hasDiscount
    ? priceNum * (1 - (trip.discountPercentage as number) / 100)
    : null;

  const includes = (
    trip.includes?.length
      ? trip.includes
      : trip.amenities?.length
        ? trip.amenities
        : []
  ).slice(0, 5);

  const highlight =
    trip.highlights?.[0] ||
    trip.amenities?.[0] ||
    trip.category ||
    "";

  const mapHref =
    trip.mapLink ||
    trip.boardingPoints?.find((b) => b.maplink)?.maplink ||
    (trip.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          trip.location
        )}`
      : "");

  const itineraryHref =
    mediaUrl(trip.brochureFile || trip.brochureImage) ||
    `${window.location.origin}/trips/${trip._id}`;

  const goDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/trips/${trip._id}`, { state: { trip } });
  };

  const goBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readonly) {
      goDetails();
      return;
    }
    // Book from details so user picks date
    navigate(`/trips/${trip._id}`, { state: { trip, openBook: true } });
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Check out this trip: ${trip.title}\n${window.location.origin}/trips/${trip._id}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const getItinerary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trip.brochureFile || trip.brochureImage) {
      window.open(itineraryHref, "_blank", "noopener,noreferrer");
    } else {
      goDetails();
    }
  };

  const openMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapHref) window.open(mapHref, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition hover:border-orange-200 hover:shadow-xl ${className}`}
    >
      {/* Banner */}
      <div className="relative h-48 cursor-pointer overflow-hidden sm:h-52">
        <img
          src={bannerURL}
          alt={trip.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onClick={goDetails}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />

        {/* Category tag */}
        {trip.category && (
          <span className="absolute left-3 top-3 max-w-[60%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-orange-700 shadow backdrop-blur">
            {trip.category}
          </span>
        )}

        {/* Map button */}
        {mapHref && (
          <button
            type="button"
            onClick={openMap}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow backdrop-blur transition hover:bg-orange-500 hover:text-white"
          >
            <Map className="h-3.5 w-3.5" />
            Map
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3
          className="cursor-pointer text-lg font-bold leading-snug text-slate-900 transition group-hover:text-orange-600 line-clamp-2"
          onClick={goDetails}
        >
          <TranslatedText text={trip.title} as="span" />
        </h3>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            <span className="truncate">
              <TranslatedText
                text={trip.location || "—"}
                as="span"
              />
            </span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-orange-500" />
            {datesCount} date{datesCount === 1 ? "" : "s"} available
          </span>
        </div>

        {highlight && (
          <p className="mt-2 line-clamp-1 text-xs font-medium text-slate-600">
            <TranslatedText text={highlight} as="span" />
          </p>
        )}

        {/* Trip Includes */}
        {includes.length > 0 && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Trip Includes
            </span>
            <div className="flex items-center -space-x-1.5">
              {includes.map((item, i) => {
                const Icon = amenityIcon(item);
                return (
                  <span
                    key={i}
                    title={item}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-orange-100 text-orange-600 shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Price bar */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          {!readonly && (
            <div className="mb-3">
              <p className="text-[11px] font-medium text-slate-500">
                All including · Price starting from
              </p>
              <div className="mt-0.5 flex items-end gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-lg text-slate-400 line-through">
                      ₹{priceNum.toLocaleString("en-IN")}
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{Math.round(discountedPrice!).toLocaleString("en-IN")}
                    </span>
                    <span className="mb-1 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                      {trip.discountPercentage}
                      {t("common.off")}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-orange-600">
                    {priceNum > 0
                      ? `₹${priceNum.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={goDetails}
              className="rounded-xl border-orange-200 text-sm font-semibold text-orange-700 hover:bg-orange-50"
            >
              View Trip Details
            </Button>
            <Button
              type="button"
              onClick={goBook}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-orange-700"
            >
              {readonly ? t("trips.readMore") : t("trips.bookNow")}
            </Button>
          </div>

          {/* WhatsApp + Itinerary */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
            <button
              type="button"
              onClick={shareWhatsApp}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 transition hover:text-green-800"
            >
              <MessageCircle className="h-4 w-4" />
              Send on WhatsApp
            </button>
            <button
              type="button"
              onClick={getItinerary}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 transition hover:text-orange-800"
            >
              <FileText className="h-4 w-4" />
              Get Itinerary
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default TripCard;
