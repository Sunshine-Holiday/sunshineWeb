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

/** Matches trip dropPoint schema (location, details, maplink — NO date, NO time) */
export type DropPoint = {
  location: string;
  details: string;
  maplink: string;
  pickupLocationId?: string;
};

type Props = {
  dropPoints: DropPoint[];
  onChange: (points: DropPoint[]) => void;
  error?: string;
};

export const emptyDropPoint = (): DropPoint => ({
  location: "",
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
 * Trip drop points editor.
 * Shows schema fields: location, details, maplink (without time or date).
 * Select a saved master location to fill location / details / maplink;
 * or create a new location inline without leaving this form.
 */
export default function DropPointsEditor({
  dropPoints,
  onChange,
  error,
}: Props) {
  const { data, isLoading } = useGetPickupLocationsQuery();
  const [createPickup, { isLoading: isCreating }] =
    useCreatePickupLocationMutation();
  const locations: PickupLocation[] = data?.locations ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  /** Which drop point index to auto-select after create (null = none) */
  const [createForIndex, setCreateForIndex] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm());

  const updatePoint = (index: number, patch: Partial<DropPoint>) => {
    const next = dropPoints.map((p, i) =>
      i === index ? { ...p, ...patch } : p
    );
    onChange(next);
  };

  const applyLocationToPoint = (
    index: number,
    loc: PickupLocation,
    points: DropPoint[] = dropPoints
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

  const resolveSelectedId = (point: DropPoint): string => {
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

  const addPoint = () => onChange([...dropPoints, emptyDropPoint()]);

  const removePoint = (index: number) => {
    onChange(dropPoints.filter((_, i) => i !== index));
  };

  const openCreateDialog = (index: number | null = null) => {
    setCreateForIndex(index);
    setCreateForm(emptyCreateForm());
    setCreateOpen(true);
  };

  const handleCreatePickup = async () => {
    if (!createForm.name.trim()) {
      toast.error("Location name is required");
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
          ? `Location “${newLoc.name}” created and selected`
          : "Location created"
      );
      setCreateOpen(false);
      setCreateForm(emptyCreateForm());
      setCreateForIndex(null);
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to create location"
      );
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Drop Locations
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Add dropping points for this trip with{" "}
            <span className="font-medium text-slate-700">location</span>,{" "}
            <span className="font-medium text-slate-700">details</span> &{" "}
            <span className="font-medium text-slate-700">maplink</span> (no date
            or time needed).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-sky-200 text-sky-700 hover:bg-sky-50"
            onClick={() => openCreateDialog(null)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New drop location
          </Button>
          <Link
            to="/admin/pickup-locations"
            className="text-sm font-medium text-sky-600 hover:underline"
          >
            Manage locations →
          </Link>
        </div>
      </div>

      {isLoading && (
        <p className="mb-3 text-sm text-slate-500">Loading locations...</p>
      )}

      {dropPoints.length === 0 && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
          <p className="text-sm text-slate-600">No drop locations added yet.</p>
          <Button
            type="button"
            onClick={addPoint}
            variant="outline"
            size="sm"
            className="mt-3 border-sky-200 text-sky-700 hover:bg-sky-50"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Drop Location
          </Button>
        </div>
      )}

      {dropPoints.map((point, index) => {
        const selectedId = resolveSelectedId(point);

        return (
          <div
            key={index}
            className="relative mb-6 rounded-xl border border-sky-100 bg-sky-50/30 p-4"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-800">
              <MapPin className="h-4 w-4 text-sky-600" />
              Drop Location #{index + 1}
            </div>

            {/* Select master location */}
            <div className="mb-4">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={`drop-select-${index}`}>
                  Select saved location
                </Label>
                <button
                  type="button"
                  onClick={() => openCreateDialog(index)}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  + Create new location
                </button>
              </div>
              <select
                id={`drop-select-${index}`}
                value={selectedId}
                onChange={(e) => handleSelectLocation(index, e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
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

            {/* Fields: location, details, maplink (NO time, NO date) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* location */}
              <div>
                <Label htmlFor={`drop-location-${index}`}>Location</Label>
                <Input
                  id={`drop-location-${index}`}
                  placeholder="Drop location name"
                  value={point.location}
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-800"
                />
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Filled from selected location
                </p>
              </div>

              {/* details */}
              <div>
                <Label htmlFor={`drop-details-${index}`}>Details</Label>
                <Input
                  id={`drop-details-${index}`}
                  placeholder="Drop details / landmark"
                  value={point.details}
                  readOnly
                  className="mt-1 bg-slate-50 text-slate-800"
                />
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Filled from selected location
                </p>
              </div>

              {/* maplink */}
              <div className="sm:col-span-2">
                <Label htmlFor={`drop-maplink-${index}`}>Map Link</Label>
                <Input
                  id={`drop-maplink-${index}`}
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
                    className="mt-0.5 inline-block text-[11px] font-medium text-sky-600 hover:underline"
                  >
                    Open map link →
                  </a>
                ) : (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Filled from selected location
                  </p>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => removePoint(index)}
            >
              <FaTrash className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {dropPoints.length > 0 && (
        <Button
          type="button"
          onClick={addPoint}
          variant="outline"
          className="mt-1 border-sky-200 text-sky-700 hover:bg-sky-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Drop Location
        </Button>
      )}

      {/* Inline create location */}
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
            <DialogTitle>Create drop location</DialogTitle>
            <DialogDescription>
              Save a new master location (name, map link, details). It will be
              available for all trips
              {createForIndex !== null
                ? ` and selected for Drop Location #${createForIndex + 1}`
                : ""}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label htmlFor="new-drop-name">
                Location name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-drop-name"
                className="mt-1"
                placeholder="e.g. Katraj Bus Stand / Deccan Gymkhana"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="new-drop-details">Details</Label>
              <Input
                id="new-drop-details"
                className="mt-1"
                placeholder="Landmark / arrival notes"
                value={createForm.details}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, details: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="new-drop-maplink">Map link</Label>
              <Input
                id="new-drop-maplink"
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
              className="bg-sky-600 hover:bg-sky-700 text-white"
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
