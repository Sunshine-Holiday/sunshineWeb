import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface UserFiltersProps {
  search: string;
  role: string;
  verified: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onVerifiedChange: (value: string) => void;
  resultCount?: number;
}

export function UserFilters({
  search,
  role,
  verified,
  onSearchChange,
  onRoleChange,
  onVerifiedChange,
  resultCount,
}: UserFiltersProps) {
  const hasFilters =
    search.trim() !== "" || role !== "all" || verified !== "all";

  const clearAll = () => {
    onSearchChange("");
    onRoleChange("all");
    onVerifiedChange("all");
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-0 flex-1 lg:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-10 shadow-sm focus-visible:ring-orange-200"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="h-11 w-[150px] rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Customer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verified} onValueChange={onVerifiedChange}>
          <SelectTrigger className="h-11 w-[160px] rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

        {typeof resultCount === "number" && (
          <span className="ml-auto text-sm font-medium text-slate-500 lg:ml-0">
            <span className="font-bold text-slate-800">{resultCount}</span>{" "}
            result{resultCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}
