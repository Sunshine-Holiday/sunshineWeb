import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Link2,
  FileText,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  useGetPickupLocationsQuery,
  useCreatePickupLocationMutation,
  useUpdatePickupLocationMutation,
  useDeletePickupLocationMutation,
  type PickupLocation,
} from "@/store/api/pickupLocations";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FormState = {
  name: string;
  maplink: string;
  details: string;
};

const emptyForm: FormState = { name: "", maplink: "", details: "" };

const PickupLocationsPage = () => {
  const { data, isLoading, error } = useGetPickupLocationsQuery();
  const [createLocation, { isLoading: isCreating }] =
    useCreatePickupLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] =
    useUpdatePickupLocationMutation();
  const [deleteLocation, { isLoading: isDeleting }] =
    useDeletePickupLocationMutation();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PickupLocation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PickupLocation | null>(null);

  const locations = data?.locations ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.details || "").toLowerCase().includes(q)
    );
  }, [locations, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (loc: PickupLocation) => {
    setEditing(loc);
    setForm({
      name: loc.name || "",
      maplink: loc.maplink || "",
      details: loc.details || "",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Location name is required");
      return;
    }
    try {
      if (editing) {
        await updateLocation({
          id: editing._id,
          name: form.name.trim(),
          maplink: form.maplink.trim(),
          details: form.details.trim(),
        }).unwrap();
        toast.success("Pickup location updated");
      } else {
        await createLocation({
          name: form.name.trim(),
          maplink: form.maplink.trim(),
          details: form.details.trim(),
        }).unwrap();
        toast.success("Pickup location created");
      }
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to save pickup location"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLocation({ id: deleteTarget._id }).unwrap();
      toast.success(`Deleted “${deleteTarget.name}”`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete location");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            <MapPin className="h-3.5 w-3.5" />
            Centralized pickups
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Pickup Locations
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Save pickup names, map links, and descriptions once. When creating
            or editing a trip, select a location and only set the pickup time.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-orange-500" />
          Loading locations...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-red-700">
          Failed to load pickup locations.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-6 py-16 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-orange-300" />
          <h3 className="text-lg font-semibold text-slate-800">
            {locations.length === 0 ? "No locations yet" : "No matches"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {locations.length === 0
              ? "Add your first pickup location to reuse it on every trip."
              : "Try a different search."}
          </p>
          {locations.length === 0 && (
            <Button
              onClick={openCreate}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((loc) => (
            <article
              key={loc._id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">
                      {loc.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Saved pickup point
                    </p>
                  </div>
                </div>
              </div>

              {loc.details ? (
                <p className="mb-3 line-clamp-3 flex-1 text-sm text-slate-600">
                  <FileText className="mr-1 inline h-3.5 w-3.5 text-orange-400" />
                  {loc.details}
                </p>
              ) : (
                <p className="mb-3 flex-1 text-sm italic text-slate-400">
                  No description
                </p>
              )}

              {loc.maplink ? (
                <a
                  href={loc.maplink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 inline-flex items-center gap-1.5 truncate text-xs font-medium text-orange-600 hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{loc.maplink}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <p className="mb-4 text-xs text-slate-400">No map link</p>
              )}

              <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={() => openEdit(loc)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(loc)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Pickup Location" : "Add Pickup Location"}
            </DialogTitle>
            <DialogDescription>
              Saved once and reused on trips. On each trip you only set{" "}
              <strong>time</strong>; the other three fields come from here.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="loc-name">
                location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="loc-name"
                placeholder="e.g. Pune Station Gate 2"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="loc-map">maplink</Label>
              <Input
                id="loc-map"
                placeholder="https://maps.google.com/..."
                value={form.maplink}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maplink: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="loc-details">details</Label>
              <textarea
                id="loc-details"
                rows={3}
                placeholder="Landmark, gate number, notes for travelers..."
                value={form.details}
                onChange={(e) =>
                  setForm((p) => ({ ...p, details: e.target.value }))
                }
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              />
            </div>
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">time</span> is not
              saved here — you set it per trip when adding a boarding point.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isCreating || isUpdating}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editing ? "Save changes" : "Create location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pickup location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget?.name}
              </span>{" "}
              from the master list. Existing trips keep their saved boarding
              point text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PickupLocationsPage;
