import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FileImage,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import {
  useGetBrochuresQuery,
  useCreateBrochureMutation,
  useUpdateBrochureMutation,
  useDeleteBrochureMutation,
  type Brochure,
} from "@/store/api/brochures";
import { IMAGE_URL } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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

const mediaUrl = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = IMAGE_URL.endsWith("/") ? IMAGE_URL : `${IMAGE_URL}/`;
  return `${base}${String(path).replace(/^\//, "")}`;
};

const BrochuresPage = () => {
  const { data, isLoading, error } = useGetBrochuresQuery();
  const [createBrochure, { isLoading: isCreating }] =
    useCreateBrochureMutation();
  const [updateBrochure, { isLoading: isUpdating }] =
    useUpdateBrochureMutation();
  const [deleteBrochure, { isLoading: isDeleting }] =
    useDeleteBrochureMutation();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brochure | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brochure | null>(null);

  const brochures = data?.brochures ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brochures;
    return brochures.filter((b) => b.title.toLowerCase().includes(q));
  }, [brochures, search]);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setFile(null);
    setPreview(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (b: Brochure) => {
    setEditing(b);
    setTitle(b.title || "");
    setFile(null);
    setPreview(mediaUrl(b.image) || null);
    setFormOpen(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Brochure title is required");
      return;
    }
    if (!editing && !file) {
      toast.error("Please upload a brochure image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (file) formData.append("file", file);

      if (editing) {
        await updateBrochure({ id: editing._id, formData }).unwrap();
        toast.success("Brochure updated");
      } else {
        await createBrochure(formData).unwrap();
        toast.success("Brochure created");
      }
      setFormOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save brochure");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBrochure({ id: deleteTarget._id }).unwrap();
      toast.success(`Deleted “${deleteTarget.title}”`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete brochure");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
            <FileImage className="h-3.5 w-3.5" />
            Brochure library
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Brochures
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Upload brochure images with a title. Select them when creating or
            editing a trip.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Brochure
        </Button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search brochures..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading brochures...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load brochures. Make sure the backend is running.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileImage className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-700">No brochures yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add a title and image to build your brochure library.
          </p>
          <Button
            onClick={openCreate}
            className="mt-4 bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add first brochure
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((b) => (
          <div
            key={b._id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="aspect-[3/4] bg-slate-100">
              <img
                src={mediaUrl(b.image)}
                alt={b.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="truncate font-semibold text-slate-900">
                {b.title}
              </h3>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEdit(b)}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteTarget(b)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Brochure" : "Add Brochure"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="brochure-title">Title *</Label>
              <Input
                id="brochure-title"
                placeholder="e.g. Mahabaleshwar Weekend Guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="brochure-image">
                Image {editing ? "(optional replace)" : "*"}
              </Label>
              <label
                htmlFor="brochure-image"
                className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center hover:border-orange-300 hover:bg-orange-50/40"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mb-3 max-h-48 rounded-lg object-contain"
                  />
                ) : (
                  <Upload className="mb-2 h-8 w-8 text-slate-400" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {file ? file.name : "Click to upload image"}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  PNG, JPG up to 10MB
                </span>
                <input
                  id="brochure-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
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
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete brochure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete “{deleteTarget?.title}”. Trips that
              already use this brochure keep their saved image path.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrochuresPage;
