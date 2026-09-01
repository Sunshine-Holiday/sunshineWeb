import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Wifi,
  Coffee,
  Snowflake,
  Power,
  HelpCircle,
  AlertCircle,
  Phone,
  Mail,
  Clock,
  Map,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  CheckCircle2,
  ExternalLink,
  Headphones,
  Shield,
  MessageCircle,
  Plus,
  Minus,
  Music2,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useGettripsIDQuery } from "@/store/api/trips";
import { format, parse, isValid, startOfDay } from "date-fns";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";
import ReviewCarousel from "@/components/ReviewCarousel";
import { useTranslation } from "react-i18next";
import TranslatedText from "@/components/TranslatedText";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

interface StartDate {
  date: string;
  seats: number | "block";
  _id?: string;
}

interface Review {
  _id: string;
  description: string;
  travelDate: string;
  bookingDate: string;
  isAdminApproved: boolean;
  isAdminDisApproved: boolean;
}

interface Faq {
  question: string;
  answer: string;
  _id?: string;
}

interface TripPackage {
  _id?: string;
  title: string;
  description?: string;
  personCount: number;
  price: number;
}

interface Trip {
  _id: string;
  title: string;
  location: string;
  duration?: string;
  startDates: (StartDate | null | undefined)[];
  price: number | string;
  banner: string;
  banners?: string[];
  description: string;
  amenities: string[];
  boardingPoints: {
    _id: string;
    location: string;
    date?: string;
    time: string;
    details: string;
    maplink: string;
  }[];
  dropPoints?: {
    _id?: string;
    location: string;
    details?: string;
    maplink?: string;
  }[];
  packages?: TripPackage[];
  highlights?: string[];
  includes?: string[];
  mapLink?: string;
  brochureImage?: string;
  brochureFile?: string;
  faqs?: Faq[];
  cancellationPolicy?: string;
  discountPercentage?: number;
  advancePaymentPercentage?: number;
  readonly?: boolean;
}

const amenityIcons: Record<string, React.ElementType> = {
  "Free WiFi": Wifi,
  Refreshments: Coffee,
  AC: Snowflake,
  "Charging Points": Power,
  "Music and Fun": Music2,
};

const contactInfo = {
  address:
    "Sr No 53/1 Ashtavinayak Chowk, Sainath Nagar, Vadgaon Sheri, Pune - 411014",
  phones: ["+91 9975375975", "+91 9175757178"],
  email: "sunshineholidaypackages@gmail.com",
  hours: "Mon-Fri: 9AM-7PM",
};

const DEFAULT_FAQS: Faq[] = [
  {
    question: "How do I book this trip?",
    answer:
      "Select your travel date, click Book Now, choose seats, fill passenger details, and complete payment.",
  },
  {
    question: "What is included in the price?",
    answer:
      "Please check the “Trip price includes” section. Extra personal expenses are usually not covered.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Cancellation rules are listed under Cancellation Policy. Contact helpline for assistance.",
  },
  {
    question: "Where is the pickup point?",
    answer:
      "Pickup locations and times are listed on this page under boarding points / map.",
  },
];

const formatDateWithSeats = (startDate: StartDate): string => {
  const parsedDate = parse(startDate.date, "dd-MM-yyyy", new Date());
  if (!isValid(parsedDate)) return "Invalid Date";
  const seatsLabel =
    startDate.seats === "block" ? "Block" : `${startDate.seats} Seats`;
  return `${format(parsedDate, "dd-MM-yyyy")} (${seatsLabel})`;
};

const mediaUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${IMAGE_URL}${path}`;
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 ${className}`}
  >
    {children}
  </div>
);

const TripDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState<StartDate | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data, isLoading, isError } = useGettripsIDQuery({ id: id! });

  // Always open trip details from the top (not mid-page scroll position)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id, location.key]);

  const readonly = trip?.readonly || false;
  const priceNum = Number(trip?.price) || 0;

  const gallery = useMemo(() => {
    if (!trip) return [] as string[];
    const list = [
      trip.banner,
      ...(Array.isArray(trip.banners) ? trip.banners : []),
    ].filter(Boolean) as string[];
    // unique
    return [...new Set(list)];
  }, [trip]);

  const mapUrl = useMemo(() => {
    if (!trip) return "";
    if (trip.mapLink) return trip.mapLink;
    const withMap = trip.boardingPoints?.find((b) => b.maplink);
    return withMap?.maplink || "";
  }, [trip]);

  /** Google Maps embed (iframe) */
  const mapEmbed = useMemo(() => {
    if (!trip) return "";
    if (mapUrl.includes("google.com/maps/embed")) return mapUrl;
    const query = trip.location || mapUrl;
    if (!query) return "";
    // Open/search embed for location
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }, [trip, mapUrl]);

  /** External Google Maps link for a boarding stop */
  const stopGoogleMapsUrl = (point: {
    location: string;
    maplink?: string;
  }) => {
    if (point.maplink?.trim()) return point.maplink.trim();
    const q = [point.location, trip?.location].filter(Boolean).join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  };

  const highlights = useMemo(() => {
    if (trip?.highlights?.length) return trip.highlights;
    // Fallback: amenities as soft highlights
    return trip?.amenities || [];
  }, [trip]);

  const includesList = useMemo(() => {
    if (trip?.includes?.length) return trip.includes;
    return trip?.amenities || [];
  }, [trip]);

  const faqs = useMemo(() => {
    if (trip?.faqs?.length) return trip.faqs;
    return DEFAULT_FAQS;
  }, [trip]);

  const packages = trip?.packages || [];

  const isDateValid = (startDate: StartDate): boolean => {
    if (!startDate?.date) return false;
    const today = startOfDay(new Date());
    const parsedDate = parse(startDate.date, "dd-MM-yyyy", new Date());
    return isValid(parsedDate) && parsedDate >= today;
  };

  useEffect(() => {
    if (data) {
      setTrip(data.trip);
      setReviews(data.reviews || []);
      const available =
        data.trip.startDates?.filter((d: StartDate) => isDateValid(d)) || [];
      if (available.length > 0) setSelectedDate(available[0]);
    }
  }, [data]);

  // Auto-rotate banners
  useEffect(() => {
    if (gallery.length <= 1) return;
    const tmr = setInterval(() => {
      setBannerIndex((i) => (i + 1) % gallery.length);
    }, 5000);
    return () => clearInterval(tmr);
  }, [gallery.length]);

  const { text: translatedDescription, loading: descLoading } =
    useAutoTranslate(trip?.description, { html: true });

  const hasDiscount =
    trip?.discountPercentage !== undefined &&
    trip.discountPercentage > 0 &&
    trip.discountPercentage <= 100 &&
    priceNum > 0;
  const discountedPrice = hasDiscount
    ? priceNum * (1 - (trip!.discountPercentage as number) / 100)
    : null;

  const availableDates =
    trip?.startDates?.filter((d): d is StartDate => !!d && isDateValid(d)) ||
    [];

  const approvedReviews = reviews.filter(
    (r) => r.isAdminApproved && !r.isAdminDisApproved
  );

  const handleBookNow = () => {
    if (!selectedDate) {
      alert(t("trips.selectDateAlert"));
      return;
    }
    navigate("/booking", { state: { tripId: trip?._id, selectedDate } });
  };

  const brochureDownload = trip?.brochureFile || trip?.brochureImage || "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-72 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />
            <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!trip || isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-3xl font-semibold text-slate-800">
          {t("trips.notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-slate-50 to-white pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ===================== LEFT COLUMN ===================== */}
          <div className="space-y-6 lg:col-span-2">
            {/* Card 1: Banner carousel + Map */}
            <Card className="overflow-hidden p-0">
              <div className="relative aspect-[16/9] w-full bg-slate-900 sm:aspect-[21/9]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={gallery[bannerIndex] || "empty"}
                    src={
                      mediaUrl(gallery[bannerIndex]) ||
                      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
                    }
                    alt={trip.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setBannerIndex(
                          (i) => (i - 1 + gallery.length) % gallery.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-800" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setBannerIndex((i) => (i + 1) % gallery.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-800" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {gallery.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBannerIndex(i)}
                          className={`h-2 rounded-full transition-all ${
                            i === bannerIndex
                              ? "w-6 bg-orange-500"
                              : "w-2 bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Google Map View */}
              <div className="border-t border-slate-100 p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Map className="h-5 w-5 text-orange-500" />
                    Map View
                  </h2>
                  {(mapUrl || trip.location) && (
                    <a
                      href={
                        mapUrl ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          trip.location
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                    >
                      Open in Google Maps
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {mapEmbed ? (
                    <iframe
                      title="Tour map"
                      src={mapEmbed}
                      className="h-52 w-full sm:h-64"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-52 flex-col items-center justify-center gap-2 text-slate-500 sm:h-64">
                      <MapPin className="h-8 w-8 text-orange-300" />
                      <p className="text-sm">
                        Map not available —{" "}
                        <TranslatedText text={trip.location} as="span" />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Card 2: Trip name, date, starting locations */}
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    <TranslatedText text={trip.title} as="span" />
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <TranslatedText text={trip.location} as="span" />
                    </span>
                    {trip.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-orange-500" />
                        {trip.duration}
                      </span>
                    )}
                    {trip.category && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                        {trip.category}
                      </span>
                    )}
                  </div>
                </div>

                {!readonly && (
                  <div className="w-full shrink-0 sm:w-56">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("trips.selectDate")}
                    </label>
                    <select
                      value={
                        selectedDate ? formatDateWithSeats(selectedDate) : ""
                      }
                      onChange={(e) => {
                        const selected = trip.startDates.find(
                          (d) =>
                            d && formatDateWithSeats(d as StartDate) === e.target.value
                        );
                        setSelectedDate((selected as StartDate) || null);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                      <option value="">{t("trips.chooseDate")}</option>
                      {(trip.startDates || []).map((date, index) => {
                        if (!date) return null;
                        const valid = isDateValid(date);
                        return (
                          <option
                            key={index}
                            value={formatDateWithSeats(date)}
                            disabled={!valid}
                          >
                            {formatDateWithSeats(date)}{" "}
                            {!valid ? t("common.pastDate") : ""}
                          </option>
                        );
                      })}
                    </select>
                    {availableDates.length === 0 && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {t("trips.noFutureDates")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Starting / boarding locations → open Google Maps */}
              {trip.boardingPoints?.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Starting locations
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {trip.boardingPoints.map((point) => (
                      <a
                        key={point._id}
                        href={stopGoogleMapsUrl(point)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 rounded-xl border border-transparent bg-orange-50/60 px-3 py-2.5 transition hover:border-orange-200 hover:bg-orange-50 hover:shadow-sm"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-orange-700">
                            <TranslatedText text={point.location} as="span" />
                          </p>
                          <p className="text-xs text-slate-500">
                            {point.date ? `${point.date} · ` : ""}
                            {point.time}
                            {point.details ? (
                              <>
                                {" · "}
                                <TranslatedText text={point.details} as="span" />
                              </>
                            ) : null}
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600">
                            Open in Google Maps
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropping locations → open Google Maps (no date/time) */}
              {trip.dropPoints && trip.dropPoints.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Dropping locations
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {trip.dropPoints.map((point, idx) => (
                      <a
                        key={point._id || idx}
                        href={stopGoogleMapsUrl(point)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 rounded-xl border border-transparent bg-sky-50/60 px-3 py-2.5 transition hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-sky-700">
                            <TranslatedText text={point.location} as="span" />
                          </p>
                          {point.details ? (
                            <p className="text-xs text-slate-500">
                              <TranslatedText text={point.details} as="span" />
                            </p>
                          ) : null}
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600">
                            Open in Google Maps
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Card 3: Highlights */}
            {highlights.length > 0 && (
              <Card>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Highlights of the Trip
                </h2>
                <ul className="space-y-3">
                  {highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                      <span className="text-slate-700">
                        <TranslatedText text={item} as="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Card 4: Itinerary + brochure */}
            <Card>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Itinerary Description
              </h2>
              {descLoading && (
                <p className="mb-2 text-xs text-orange-500">
                  {t("common.loading")}
                </p>
              )}
              <div
                className={`prose prose-slate max-w-none text-slate-600 ${
                  descLoading ? "opacity-70" : ""
                }`}
                dangerouslySetInnerHTML={{
                  __html: translatedDescription || trip.description || "",
                }}
              />

              {(trip.brochureImage || brochureDownload) && (
                <div className="mt-6 flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4 sm:flex-row sm:items-center">
                  {trip.brochureImage && (
                    <img
                      src={mediaUrl(trip.brochureImage)}
                      alt="Brochure"
                      className="h-36 w-full rounded-lg object-cover sm:h-28 sm:w-40"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      Trip brochure / itinerary guide
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Download the detailed grouser / brochure for offline
                      reference.
                    </p>
                  </div>
                  {brochureDownload && (
                    <a
                      href={mediaUrl(brochureDownload)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  )}
                </div>
              )}
            </Card>

            {/* Card 5: Packages — skip if empty */}
            {packages.length > 0 && (
              <Card>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Package Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg, i) => (
                    <div
                      key={pkg._id || i}
                      className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-orange-50/40 p-4 shadow-sm"
                    >
                      <h3 className="font-bold text-slate-900">
                        <TranslatedText text={pkg.title} as="span" />
                      </h3>
                      {pkg.description && (
                        <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                          <TranslatedText text={pkg.description} as="span" />
                        </p>
                      )}
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-xs text-slate-500">
                          {pkg.personCount} person
                          {pkg.personCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          ₹{Number(pkg.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Card 6: What tour includes */}
            {includesList.length > 0 && (
              <Card>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Trip Price Includes
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {includesList.map((item, i) => {
                    const Icon = amenityIcons[item] || CheckCircle2;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          <TranslatedText text={item} as="span" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* ===================== RIGHT COLUMN (sticky) ===================== */}
          <div className="space-y-6 lg:col-span-1">
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Pricing + Book Now */}
              <Card className="border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
                <h2 className="text-xl font-bold text-slate-900">
                  Pricing Details
                </h2>

                {!readonly && selectedDate && (
                  <p className="mt-2 text-sm text-slate-600">
                    <Calendar className="mr-1 inline h-4 w-4 text-orange-500" />
                    {formatDateWithSeats(selectedDate)}
                  </p>
                )}

                {!readonly && (
                  <div className="mt-4 space-y-2 border-t border-orange-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t("trips.price")}</span>
                      {hasDiscount ? (
                        <div className="text-right">
                          <span className="mr-2 text-slate-400 line-through">
                            ₹{priceNum.toLocaleString("en-IN")}
                          </span>
                          <span className="font-semibold text-slate-900">
                            ₹
                            {Math.round(discountedPrice!).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-900">
                          ₹{priceNum.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Discount</span>
                        <span className="font-medium text-green-600">
                          {trip.discountPercentage}
                          {t("common.off")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-orange-100 pt-3 text-base font-bold">
                      <span>{t("booking.total")}</span>
                      <span className="text-orange-600">
                        ₹
                        {(hasDiscount
                          ? Math.round(discountedPrice!)
                          : priceNum
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {readonly ? (
                  <Button
                    className="mt-5 w-full bg-gradient-to-r from-orange-500 to-orange-600 py-6 text-base font-semibold hover:from-orange-600 hover:to-orange-700"
                    onClick={() =>
                      window.open(`tel:${contactInfo.phones[0].replace(/\s/g, "")}`)
                    }
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {t("trips.contactUs")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleBookNow}
                    disabled={!selectedDate || availableDates.length === 0}
                    className={`mt-5 w-full py-6 text-base font-semibold ${
                      !selectedDate || availableDates.length === 0
                        ? "cursor-not-allowed bg-orange-300"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    }`}
                  >
                    {availableDates.length === 0
                      ? t("trips.noFutureDates")
                      : t("trips.bookNow")}
                  </Button>
                )}
              </Card>

              {/* Reviews */}
              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Reviews & Rating
                  </h2>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= 4 ? "fill-current" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {approvedReviews.length > 0 ? (
                  <ReviewCarousel reviews={approvedReviews} />
                ) : (
                  <p className="text-sm text-slate-500">
                    No reviews yet. Be the first to share your experience.
                  </p>
                )}
              </Card>

              {/* FAQ */}
              <Card>
                <h2 className="mb-1 text-lg font-bold text-slate-900">FAQ&apos;s</h2>
                <p className="mb-4 text-xs text-slate-500">
                  Get answers for common queries
                </p>
                <div className="divide-y divide-slate-100">
                  {faqs.map((faq, i) => {
                    const open = openFaq === i;
                    return (
                      <div key={faq._id || i} className="py-2">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : i)}
                          className="flex w-full items-center justify-between gap-2 py-2 text-left"
                        >
                          <span className="text-sm font-semibold text-slate-800">
                            <TranslatedText text={faq.question} as="span" />
                          </span>
                          {open ? (
                            <Minus className="h-4 w-4 shrink-0 text-orange-500" />
                          ) : (
                            <Plus className="h-4 w-4 shrink-0 text-slate-400" />
                          )}
                        </button>
                        {open && (
                          <p className="pb-2 text-sm text-slate-600">
                            <TranslatedText text={faq.answer} as="span" />
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Cancellation */}
              <Card>
                <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Cancellation Policy
                </h2>
                <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600">
                  {trip.cancellationPolicy ? (
                    <TranslatedText
                      text={trip.cancellationPolicy}
                      as="div"
                      html
                    />
                  ) : (
                    "A transparent overview of applicable fees. Please contact our team for refund timelines based on departure date. Advance payments may be non-refundable close to travel."
                  )}
                </div>
              </Card>

              {/* Helpline */}
              <Card className="border-orange-200 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Headphones className="h-5 w-5" />
                  Need Help?
                </h2>
                <p className="mt-1 text-sm text-orange-50">
                  Questions about booking? We&apos;re here to help.
                </p>
                <div className="mt-4 space-y-2">
                  {contactInfo.phones.map((ph) => (
                    <a
                      key={ph}
                      href={`tel:${ph.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/25"
                    >
                      <Phone className="h-4 w-4" />
                      {ph}
                    </a>
                  ))}
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/25"
                  >
                    <Mail className="h-4 w-4" />
                    {contactInfo.email}
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
