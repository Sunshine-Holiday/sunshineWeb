import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useGettripsQuery } from "@/store/api/trips";
import { useTranslation } from "react-i18next";
import TripCard from "@/pages/trips/TripCard";

export const FeaturedTrips = () => {
  const { t } = useTranslation();
  const { data: tripsData, isLoading, error } = useGettripsQuery({});

  const trips = useMemo(() => {
    if (!tripsData) return [];
    const list = Array.isArray(tripsData) ? tripsData : tripsData?.data ?? [];
    // Prefer display order, take first 6
    return [...list]
      .sort(
        (a: any, b: any) =>
          (Number(a.displayIndex) || 999) - (Number(b.displayIndex) || 999)
      )
      .slice(0, 6);
  }, [tripsData]);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              {t("featured.eyebrow")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t("featured.title")}
            </h2>
            <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
              {t("featured.subtitle")}
            </p>
          </motion.div>

          <Link
            to="/trips"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
          >
            {t("featured.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center text-red-700">
            {t("featured.loadError")}
          </div>
        )}

        {!isLoading && !error && trips.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
            {t("featured.noTrips")}
          </div>
        )}

        {!isLoading && !error && trips.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip: any, index: number) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
