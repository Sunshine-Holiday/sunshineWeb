import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2 } from "lucide-react";

export type InterconnectRole = "none" | "outbound" | "return" | "stay";

export interface InterconnectionConfig {
  enabled: boolean;
  role: InterconnectRole;
  outboundTrip: string;
  returnTrip: string;
  stayTrip: string;
  dayOffset: number;
}

export const defaultInterconnection = (): InterconnectionConfig => ({
  enabled: false,
  role: "none",
  outboundTrip: "",
  returnTrip: "",
  stayTrip: "",
  dayOffset: 1,
});

interface TripOption {
  _id: string;
  title?: string;
  category?: string;
  state?: string;
}

interface Props {
  value: InterconnectionConfig;
  onChange: (next: InterconnectionConfig) => void;
  trips: TripOption[];
  /** Current trip id when editing (excluded from dropdowns) */
  currentTripId?: string;
}

/**
 * Configure Sat / Sun / 2D1N style seat sharing between trips.
 */
export default function InterconnectionEditor({
  value,
  onChange,
  trips,
  currentTripId,
}: Props) {
  const options = trips.filter((t) => t._id && t._id !== currentTripId);

  const set = (patch: Partial<InterconnectionConfig>) => {
    const next = { ...value, ...patch };
    if (patch.role === "none") {
      next.enabled = false;
    } else if (patch.role && patch.role !== "none") {
      next.enabled = true;
    }
    if (patch.enabled === false) {
      next.role = "none";
    }
    onChange(next);
  };

  const labelFor = (t: TripOption) =>
    `${t.title || "Untitled"}${t.category ? ` · ${t.category}` : ""}${
      t.state ? ` · ${t.state}` : ""
    }`;

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Link2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Trip Interconnection
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Link day trips and stay packages that share the same bus (e.g.
            Mahabaleshwar Sat + Sun + 2 Days 1 Night). Seats booked on one trip
            are blocked on the linked trips automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Enable interconnection</Label>
          <Select
            value={value.enabled ? "yes" : "no"}
            onValueChange={(v) =>
              set({
                enabled: v === "yes",
                role: v === "yes" ? value.role || "outbound" : "none",
              })
            }
          >
            <SelectTrigger className="mt-1 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No — standalone trip</SelectItem>
              <SelectItem value="yes">Yes — share seats with linked trips</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {value.enabled && (
          <div>
            <Label>Role in the group *</Label>
            <Select
              value={value.role === "none" ? "outbound" : value.role}
              onValueChange={(v) => set({ role: v as InterconnectRole })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outbound">
                  Outbound / Going (e.g. Every Saturday)
                </SelectItem>
                <SelectItem value="return">
                  Return / Coming (e.g. Every Sunday)
                </SelectItem>
                <SelectItem value="stay">
                  Stay package (e.g. 2 Days 1 Night)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {value.enabled && value.role === "stay" && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Going trip (Saturday day-tour) *</Label>
            <Select
              value={value.outboundTrip || undefined}
              onValueChange={(v) => set({ outboundTrip: v })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select outbound trip" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {options.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {labelFor(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-slate-500">
              Seat map “Going” shows this trip’s seats for the start date.
            </p>
          </div>
          <div>
            <Label>Coming trip (Sunday day-tour) *</Label>
            <Select
              value={value.returnTrip || undefined}
              onValueChange={(v) => set({ returnTrip: v })}
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select return trip" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {options.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {labelFor(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-slate-500">
              Seat map “Coming” shows this trip’s seats for start date + offset.
            </p>
          </div>
          <div>
            <Label>Days between going and return</Label>
            <Input
              type="number"
              min={1}
              className="mt-1 bg-white"
              value={value.dayOffset}
              onChange={(e) =>
                set({ dayOffset: Math.max(1, parseInt(e.target.value) || 1) })
              }
            />
            <p className="mt-1 text-xs text-slate-500">
              Use 1 for 2 Days 1 Night (return next day).
            </p>
          </div>
        </div>
      )}

      {value.enabled &&
        (value.role === "outbound" || value.role === "return") && (
          <div className="mt-4">
            <Label>Linked stay package (optional)</Label>
            <Select
              value={value.stayTrip || "__none__"}
              onValueChange={(v) =>
                set({ stayTrip: v === "__none__" ? "" : v })
              }
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="Select stay package" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="__none__">None (auto-linked when stay is saved)</SelectItem>
                {options.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {labelFor(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-slate-500">
              Usually set automatically when you save the stay package with this
              trip as Going or Coming.
            </p>
          </div>
        )}

      {value.enabled && (
        <div className="mt-4 rounded-xl border border-violet-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-violet-800">How seat blocking works</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>
              Book on <strong>Saturday</strong> → blocks that seat on Sat and on
              Stay (Going).
            </li>
            <li>
              Book on <strong>Sunday</strong> → blocks that seat on Sun and on
              Stay (Coming).
            </li>
            <li>
              Book on <strong>2D1N</strong> → pick Going + Coming seats; both
              day-trips are blocked.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
