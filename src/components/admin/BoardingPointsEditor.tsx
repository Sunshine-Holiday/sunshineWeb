import React from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetPickupLocationsQuery,
  type PickupLocation,
} from "@/store/api/pickupLocations";

/** Matches trip boardingPoint schema */
export type BoardingPoint = {
  location: string;
  time: string;
  details: string;
  maplink: string;
  pickupLocationId?: string;
};

type Props = {
  boardingPoints: BoardingPoint[];
  onChange: (points: BoardingPoint[]) => void;
  error?: string;
};

const emptyPoint = (): BoardingPoint => ({
  location: "",
  time: "",
  details: "",
  maplink: "",
  pickupLocationId: "",
});

/**
 * Trip boarding points editor.
 * Shows all 4 schema fields: location, time, details, maplink.
 * Select a saved master location to fill location / details / maplink;
 * set time for this trip.
 */
export default function BoardingPointsEditor({
  boardingPoints,
  onChange,
  error,
}: Props) {
  const { data, isLoading } = useGetPickupLocationsQuery();
  const locations: PickupLocation[] = data?.locations ?? [];

  const updatePoint = (index: number, patch: Partial<BoardingPoint>) => {
    const next = boardingPoints.map((p, i) =>
      i === index ? { ...p, ...patch } : p
    );
    onChange(next);
  };

  const handleSelectLocation = (index: number, locationId: string) => {
    if (!locationId) {
      updatePoint(index, {
        pickupLocationId: "",
        location: "",
        maplink: "",
        details: "",
      });
      return;
    }
    const loc = locations.find((l) => l._id === locationId);
    if (!loc) return;
    updatePoint(index, {
      pickupLocationId: loc._id,
      location: loc.name || "",
      maplink: loc.maplink || "",
      details: loc.details || "",
    });
  };

  const resolveSelectedId = (point: BoardingPoint): string => {
    if (point.pickupLocationId) {
      const byId = locations.find((l) => l._id === point.pickupLocationId);
      if (byId) return byId._id;
    }
    if (point.location) {
      const byName = locations.find(
        (l) =>
          l.name.trim().toLowerCase() === point.location.trim().toLowerCase()
      );
      if (byName) return byName._id;
    }
    return "";
  };

  const addPoint = () => onChange([...boardingPoints, emptyPoint()]);

  const removePoint = (index: number) => {
    if (boardingPoints.length <= 1) return;
    onChange(boardingPoints.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Boarding Points *
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Select a saved pickup for{" "}
            <span className="font-medium text-slate-700">location</span>,{" "}
            <span className="font-medium text-slate-700">details</span> &{" "}
            <span className="font-medium text-slate-700">maplink</span>. Set{" "}
            <span className="font-medium text-slate-700">time</span> for this
            trip.
          </p>
        </div>
        <Link
          to="/admin/pickup-locations"
          className="text-sm font-medium text-orange-600 hover:underline"
        >
          Manage locations →
        </Link>
      </div>

      {isLoading && (
        <p className="mb-3 text-sm text-slate-500">Loading locations...</p>
      )}

      {!isLoading && locations.length === 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No saved pickup locations yet.{" "}
          <Link
            to="/admin/pickup-locations"
            className="font-semibold underline"
          >
            Add locations
          </Link>{" "}
          first (location, details, maplink), then select them here and add
          time.
        </div>
      )}

      {boardingPoints.map((point, index) => {
        const selectedId = resolveSelectedId(point);

        return (
          <div
            key={index}
            className="relative mb-6 rounded-xl border border-orange-100 bg-orange-50/30 p-4"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-orange-800">
              <MapPin className="h-4 w-4" />
              Pickup #{index + 1}
            </div>

            {/* Select master location */}
            <div className="mb-4">
              <Label htmlFor={`pickup-select-${index}`}>
                Select saved location
              </Label>
              <select
                id={`pickup-select-${index}`}
                value={selectedId}
                onChange={(e) => handleSelectLocation(index, e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Select location by name...</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {!selectedId && point.location && (
                <p className="mt-1 text-xs text-amber-700">
                  “{point.location}” is not in the master list — select a saved
                  location or keep these values.
                </p>
              )}
            </div>

            {/* All 4 schema fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* location */}
              <div>
                <Label htmlFor={`location-${index}`}>location</Label>
                <Input
                  id={`location-${index}`}
                  placeholder="Location name"
                  value={point.location}
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-800"
                />
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Filled from selected pickup location
                </p>
              </div>

              {/* time */}
              <div>
                <Label htmlFor={`time-${index}`}>
                  time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`time-${index}`}
                  type="time"
                  value={point.time}
                  onChange={(e) =>
                    updatePoint(index, { time: e.target.value })
                  }
                  className="mt-1 bg-white"
                />
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Set pickup time for this trip
                </p>
              </div>

              {/* details */}
              <div>
                <Label htmlFor={`details-${index}`}>details</Label>
                <Input
                  id={`details-${index}`}
                  placeholder="Pickup details / description"
                  value={point.details}
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-800"
                />
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Filled from selected pickup location
                </p>
              </div>

              {/* maplink */}
              <div>
                <Label htmlFor={`maplink-${index}`}>maplink</Label>
                <Input
                  id={`maplink-${index}`}
                  placeholder="Google Map link"
                  value={point.maplink}
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-800"
                />
                {point.maplink ? (
                  <a
                    href={point.maplink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block text-[11px] font-medium text-orange-600 hover:underline"
                  >
                    Open map link →
                  </a>
                ) : (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Filled from selected pickup location
                  </p>
                )}
              </div>
            </div>

            {boardingPoints.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => removePoint(index)}
              >
                <FaTrash className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      <Button
        type="button"
        onClick={addPoint}
        variant="outline"
        className="mt-1 border-orange-200 text-orange-700 hover:bg-orange-50"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Boarding Point
      </Button>
    </div>
  );
}
