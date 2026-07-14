import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Calendar, Hash, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { parse, isValid } from "date-fns";
import { scaleOnHover } from "@/utils/animations";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";

interface StartDate {
  date?: string;
  seats?: number | "block";
}

interface TripCardProps {
  trip?: {
    _id?: string | number;
    readonly?: boolean;
    title?: string;
    image?: string;
    banner?: string;
    location?: string;
    duration?: string;
    busSize?: string;
    startDates?: (StartDate | null | undefined)[];
    price?: number | string;
    displayIndex?: number;
  };
  /** Total trips — options for preference select (1..total) */
  totalTrips?: number;
  updatingIndex?: boolean;
  onDelete: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDisplayIndexChange?: (id: string | number, displayIndex: number) => void;
}

const isValidStartDate = (
  startDate: unknown
): { date: Date; seats: number | "block" } | null => {
  if (
    !startDate ||
    typeof startDate !== "object" ||
    !("date" in startDate) ||
    !("seats" in startDate)
  ) {
    return null;
  }

  const { date, seats } = startDate as StartDate;
  if (typeof date !== "string" || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return null;
  }

  const parsedDate = parse(date, "dd-MM-yyyy", new Date());
  if (!isValid(parsedDate)) {
    return null;
  }

  if (seats !== "block" && (typeof seats !== "number" || seats < 0)) {
    return null;
  }

  return { date: parsedDate, seats };
};

const formatDateWithSeats = (date?: Date): string => {
  if (!date || !isValid(date)) {
    return "N/A";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const TripCard = ({
  trip,
  totalTrips = 1,
  updatingIndex = false,
  onDelete,
  onEdit,
  onDisplayIndexChange,
}: TripCardProps) => {
  const navigate = useNavigate();
  const today = new Date();
  const [localIndex, setLocalIndex] = useState<number | "">(
    trip?.displayIndex && trip.displayIndex > 0 ? trip.displayIndex : ""
  );

  // Keep local select in sync when list reorders after API update
  React.useEffect(() => {
    setLocalIndex(
      trip?.displayIndex && trip.displayIndex > 0 ? trip.displayIndex : ""
    );
  }, [trip?.displayIndex, trip?._id]);

  const bannerURL = trip?.banner
    ? `${IMAGE_URL}${trip.banner}`
    : trip?.image
      ? `${IMAGE_URL}${trip.image}`
      : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b";

  const validStartDates = (trip?.startDates ?? [])
    .map(isValidStartDate)
    .filter(
      (item): item is { date: Date; seats: number | "block" } => item !== null
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const todayMatch = validStartDates.find(
    (item) => item.date.toDateString() === today.toDateString()
  );

  const displayDate =
    todayMatch ||
    validStartDates.find((item) => item.date > today) ||
    validStartDates[0];

  if (!trip?._id || !trip?.title) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-red-600">
        No valid trip data available.
      </div>
    );
  }

  const readonly = trip?.readonly || false;
  const maxIndex = Math.max(1, totalTrips);
  const indexOptions = Array.from({ length: maxIndex }, (_, i) => i + 1);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(trip._id!);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(trip._id!);
  };

  const handleCardClick = () => {
    navigate(`/trips/${trip._id}`, { state: { trip } });
  };

  const handleIndexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const value = Number(e.target.value);
    if (!value || Number.isNaN(value)) return;
    setLocalIndex(value);
    if (value !== trip.displayIndex && onDisplayIndexChange) {
      onDisplayIndexChange(trip._id!, value);
    }
  };

  return (
    <motion.div
      variants={scaleOnHover}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
    >
      <motion.div
        className="relative h-48 overflow-hidden cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
      >
        <img
          src={bannerURL}
          alt={trip.title ?? "Trip"}
          className="w-full h-full object-cover"
        />
        {/* Preference badge */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
          <Hash className="h-3 w-3" />
          {trip.displayIndex && trip.displayIndex > 0
            ? trip.displayIndex
            : "—"}
        </div>
      </motion.div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {trip.title ?? "N/A"}
        </h3>

        <div className="space-y-2 mb-4">
          {(trip as any).state && (
            <div className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
              {(trip as any).state}
            </div>
          )}
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
            <span>{trip.location ?? "N/A"}</span>
          </div>
          {!readonly && (
            <>
              <div className="flex items-center text-gray-600 text-sm">
                <Users className="h-4 w-4 mr-2 text-orange-500" />
                <span>{displayDate?.seats ?? "N/A"}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                <span>
                  {displayDate
                    ? formatDateWithSeats(displayDate.date)
                    : "N/A"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Preference index control */}
        {onDisplayIndexChange && (
          <div
            className="mb-4 rounded-lg border border-orange-100 bg-orange-50/70 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-700">
              <Hash className="h-3.5 w-3.5" />
              Display preference
            </label>
            <div className="flex items-center gap-2">
              <select
                value={localIndex === "" ? "" : String(localIndex)}
                onChange={handleIndexChange}
                disabled={updatingIndex}
                className="w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60"
              >
                <option value="" disabled>
                  Select position
                </option>
                {indexOptions.map((n) => (
                  <option key={n} value={n}>
                    #{n}
                    {n === 1 ? " (first)" : n === maxIndex ? " (last)" : ""}
                  </option>
                ))}
              </select>
              {updatingIndex && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-orange-500" />
              )}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
              Changing this shifts other trips automatically.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 gap-2">
          {!readonly && (
            <span className="text-xl font-bold text-orange-600">
              ₹
              {typeof trip.price === "number"
                ? trip.price.toLocaleString("en-IN")
                : trip.price ?? "N/A"}
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleEdit}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
