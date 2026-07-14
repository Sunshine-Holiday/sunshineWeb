import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ChevronDown, Loader2 } from "lucide-react";
import { useGettripsQuery } from "@/store/api/trips";
import TripCard from "@/pages/trips/TripCard";
import {
  filterTripsByDestination,
  findDestinationFromSlug,
  getDestinationDescription,
} from "@/utils/tripDestinations";

const DEFAULT_FAQS = [
  {
    q: "How do I book a tour in this destination?",
    a: "Browse the tours below, open trip details, choose a date, and complete booking online.",
  },
  {
    q: "Are pickups available from major cities?",
    a: "Most packages list boarding points such as Pune or Mumbai. Check each trip’s starting locations.",
  },
  {
    q: "Can I get the itinerary on WhatsApp?",
    a: "Yes — use “Send on WhatsApp” on any trip card, or open the trip and download the brochure if available.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Policies vary by package. See the cancellation section on the trip details page or contact our helpline.",
  },
];

const StateDetailPage = () => {
  const { slug = "" } = useParams();
  const { data: tripsData, isLoading, error } = useGettripsQuery({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const trips = useMemo(() => {
    if (!tripsData) return [];
    return Array.isArray(tripsData) ? tripsData : tripsData?.data ?? [];
  }, [tripsData]);

  const destinationName = useMemo(
    () => findDestinationFromSlug(slug, trips),
    [slug, trips]
  );

  const stateTrips = useMemo(() => {
    if (!destinationName) return [];
    return filterTripsByDestination(trips, destinationName);
  }, [trips, destinationName]);

  const description = destinationName
    ? getDestinationDescription(destinationName)
    : "";

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !destinationName) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Destination not found
        </h1>
        <p className="mt-2 text-slate-600">
          We couldn’t find tours for this destination.
        </p>
        <Link
          to="/trips"
          className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          Browse all trips
        </Link>
      </div>
    );
  }

  const heroImage =
    stateTrips.find((t: any) => t.banner)?.banner ||
    stateTrips.find((t: any) => t.banners?.[0])?.banners?.[0] ||
    null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* State hero — matches statedetail wireframe */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        {heroImage && (
          <img
            src={heroImage}
            alt={destinationName}
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-orange-950/80" />
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <nav className="mb-4 text-xs text-slate-400">
            <Link to="/" className="hover:text-orange-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/trips" className="hover:text-orange-300">
              Tours
            </Link>
            <span className="mx-2">/</span>
            <span className="text-orange-300">{destinationName}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-orange-100">
              <MapPin className="h-3.5 w-3.5" />
              Destination
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {destinationName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {description}
            </p>
            <p className="mt-4 text-sm font-medium text-orange-200">
              {stateTrips.length} tour{stateTrips.length === 1 ? "" : "s"}{" "}
              available
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tours grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Tours in {destinationName}
          </h2>
          <Link
            to="/trips"
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            View all trips →
          </Link>
        </div>

        {stateTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <p className="text-slate-600">
              No tours listed for this destination yet.
            </p>
            <Link
              to="/trips"
              className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:underline"
            >
              Explore all trips →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stateTrips.map((trip: any) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">
            FAQ Section
          </h2>
          <p className="mb-8 text-center text-sm text-slate-500">
            Common questions about tours in {destinationName}
          </p>
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50">
            {DEFAULT_FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="px-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-orange-500 transition ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <p className="pb-4 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StateDetailPage;
