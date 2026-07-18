import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetPickupLocationsQuery,
  useCreatePickupLocationMutation,
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

type CreateForm = {
  name: string;
  maplink: string;
  details: string;
};

const emptyCreateForm = (): CreateForm => ({
  name: "",
  maplink: "",
  details: "",
});

/**
 * Trip boarding points editor.
 * Shows all 4 schema fields: location, time, details, maplink.
 * Select a saved master location to fill location / details / maplink;
 * or create a new pickup location inline without leaving this form.
 * Set time for this trip.
 */
export default function BoardingPointsEditor({
  boardingPoints,
  onChange,
  error,
}: Props) {
  const { data, isLoading } = useGetPickupLocationsQuery();
  const [createPickup, { isLoading: isCreating }] =
    useCreatePickupLocationMutation();
  const locations: PickupLocation[] = data?.locations ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  /** Which boarding point index to auto-select after create (null = none) */
  const [createForIndex, setCreateForIndex] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm());

  const updatePoint = (index: number, patch: Partial<BoardingPoint>) => {
    const next = boardingPoints.map((p, i) =>
      i === index ? { ...p, ...patch } : p
    );
    onChange(next);
  };

  const applyLocationToPoint = (
    index: number,
    loc: PickupLocation,
    points: BoardingPoint[] = boardingPoints
  ) => {
    return points.map((p, i) =>
      i === index
        ? {
            ...p,
            pickupLocationId: loc._id,
            location: loc.name || "",
            maplink: loc.maplink || "",
            details: loc.details || "",
          }
        : p
    );
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
    onChange(applyLocationToPoint(index, loc));
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

  const openCreateDialog = (index: number | null = null) => {
    setCreateForIndex(index);
    setCreateForm(emptyCreateForm());
    setCreateOpen(true);
  };

  const handleCreatePickup = async () => {
    if (!createForm.name.trim()) {
      toast.error("Pickup location name is required");
      return;
    }
    try {
      const res = await createPickup({
        name: createForm.name.trim(),
        maplink: createForm.maplink.trim(),
        details: createForm.details.trim(),
      }).unwrap();

      const newLoc: PickupLocation | undefined =
        res?.location || res?.data?.location;

      if (newLoc?._id && createForIndex !== null) {
        onChange(applyLocationToPoint(createForIndex, newLoc));
      }

      toast.success(
        newLoc?.name
          ? `Pickup “${newLoc.name}” created and selected`
          : "Pickup location created"
      );
      setCreateOpen(false);
      setCreateForm(emptyCreateForm());
      setCreateForIndex(null);
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to create pickup location"
      );
    }
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
            trip. Create a new pickup here if it is not in the list yet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={() => openCreateDialog(null)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New pickup location
          </Button>
          <Link
            to="/admin/pickup-locations"
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            Manage locations →
          </Link>
        </div>
      </div>

      {isLoading && (
        <p className="mb-3 text-sm text-slate-500">Loading locations...</p>
      )}

      {!isLoading && locations.length === 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No saved pickup locations yet.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => openCreateDialog(0)}
          >
            Create one here
          </button>{" "}
          or{" "}
          <Link
            to="/admin/pickup-locations"
            className="font-semibold underline"
          >
            manage all locations
          </Link>
          , then set the pickup time for this trip.
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
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={`pickup-select-${index}`}>
                  Select saved location
                </Label>
                <button
                  type="button"
                  onClick={() => openCreateDialog(index)}
                  className="text-xs font-semibold text-orange-600 hover:underline"
                >
                  + Create new pickup
                </button>
              </div>
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
                  location, create a new one, or keep these values.
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

      {/* Inline create pickup location */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateForm(emptyCreateForm());
            setCreateForIndex(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create pickup location</DialogTitle>
            <DialogDescription>
              Save a new master pickup (name, map link, details). It will be
              available for all trips
              {createForIndex !== null
                ? ` and selected for Pickup #${createForIndex + 1}`
                : ""}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label htmlFor="new-pickup-name">
                Location name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-pickup-name"
                className="mt-1"
                placeholder="e.g. Swargate Bus Stand"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="new-pickup-details">Details</Label>
              <Input
                id="new-pickup-details"
                className="mt-1"
                placeholder="Landmark / meeting notes"
                value={createForm.details}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, details: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="new-pickup-maplink">Map link</Label>
              <Input
                id="new-pickup-maplink"
                className="mt-1"
                placeholder="https://maps.google.com/..."
                value={createForm.maplink}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, maplink: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreatePickup}
              disabled={isCreating}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & use"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
