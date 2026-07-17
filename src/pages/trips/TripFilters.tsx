import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

/**
 * Public website trip tabs only.
 * Interconnected trips are not a separate product line — they combine
 * One Day Tours + Stay Package via admin interconnection config.
 */
export const TRIP_CATEGORIES = [
  "All",
  "One Day Tours",
  "Stay Package",
  "Domestic Tours",
  "Educational Tours",
] as const;

const categoryKey: Record<string, string> = {
  All: "trips.categoryAll",
  "One Day Tours": "trips.categoryOneDay",
  "Stay Package": "trips.categoryStay",
  "Domestic Tours": "trips.categoryDomestic",
  "Educational Tours": "trips.categoryEdu",
};

export const TripFilters = ({
  filterTrips,
  selectedCategory,
}: {
  filterTrips: (category: string) => void;
  selectedCategory: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-10 flex flex-wrap justify-center gap-4">
      {TRIP_CATEGORIES.map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => filterTrips(category)}
          className={`rounded-lg border px-6 py-3 text-base font-medium shadow-sm transition-all duration-200 ${
            selectedCategory === category
              ? "border-orange-200 bg-orange-100 font-semibold text-orange-500"
              : "border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-500 hover:shadow-md"
          }`}
        >
          {t(categoryKey[category] || category)}
        </motion.button>
      ))}
    </div>
  );
};

export default TripFilters;
