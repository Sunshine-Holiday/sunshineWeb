import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetDestinationPagesQuery,
  useUpdateDestinationPageMutation,
} from "@/store/api/destinations";
import { IMAGE_URL } from "@/store/store";
import {
  getDestinationDescription,
  PRESET_STATES,
  slugify,
} from "@/utils/tripDestinations";

const imageUrl = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_URL.replace(/\/?$/, "/")}${path.replace(/^\//, "")}`;
};

const DestinationBanners = () => {
  const { data, isLoading } = useGetDestinationPagesQuery();
  const [updateDestination, { isLoading: isSaving }] =
    useUpdateDestinationPageMutation();
  const [selectedSlug, setSelectedSlug] = useState("kerala");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const destinations = useMemo(() => {
    const saved = new Map(
      (data?.destinations || []).map((item) => [item.slug, item])
    );
    return PRESET_STATES.map((name) => {
      const slug = slugify(name);
      return (
        saved.get(slug) || {
          slug,
          name,
          description: getDestinationDescription(name),
          banner: "",
        }
      );
    });
  }, [data]);

  const selected = destinations.find((item) => item.slug === selectedSlug);

  useEffect(() => {
    if (!selected) return;
    setDescription(
      selected.description || getDestinationDescription(selected.name)
    );
    setFile(null);
    setPreview(imageUrl(selected.banner));
  }, [selected]);

  const chooseFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  };

  const save = async () => {
    if (!selected) return;
    const formData = new FormData();
    formData.append("name", selected.name);
    formData.append("description", description.trim());
    if (file) formData.append("file", file);

    try {
      await updateDestination({ slug: selected.slug, formData }).unwrap();
      toast.success(`${selected.name} banner saved`);
      setFile(null);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Could not save destination banner";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Destination pages
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Destination Banners</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose a state to edit the large banner shown above its tour list.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="max-h-[65vh] space-y-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2">
          {destinations.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setSelectedSlug(item.slug)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                item.slug === selectedSlug
                  ? "bg-orange-500 text-white"
                  : "text-slate-700 hover:bg-orange-50"
              }`}
            >
              <span>{item.name}</span>
              {item._id && <span className="text-xs opacity-75">Edited</span>}
            </button>
          ))}
        </div>

        {selected && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>

            <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-100">
              {preview ? (
                <img
                  src={preview}
                  alt={`${selected.name} banner preview`}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-slate-400">
                  <ImagePlus className="h-10 w-10" />
                  <p className="mt-2 text-sm">No custom banner yet</p>
                </div>
              )}
            </div>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Banner image
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={chooseFile}
                className="mt-2 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-orange-700"
              />
            </label>

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Banner description
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="Describe this destination"
              />
            </label>

            <p className="mt-3 text-xs text-slate-500">
              The destination name and available tour count are generated automatically.
            </p>

            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save banner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationBanners;
