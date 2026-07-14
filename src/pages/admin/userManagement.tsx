import { useEffect, useMemo, useState } from "react";
import { UserTable } from "@/components/user-table";
import { UserFilters } from "@/components/user-filters";
import { columns, User } from "@/types/user";
import {
  useAdminUpdateUserMutation,
  useAllUserDetailQuery,
} from "@/store/api/auth";
import { toast } from "react-toastify";
import {
  Users as UsersIcon,
  Shield,
  UserRound,
  BadgeCheck,
  Loader2,
} from "lucide-react";

export default function Users() {
  const { isLoading, isError, data, refetch } = useAllUserDetailQuery();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [adminUpdateUser, { isLoading: isUpdating }] =
    useAdminUpdateUserMutation();

  useEffect(() => {
    if (data?.user) {
      setUsers(data.user as User[]);
    }
  }, [data]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const verified = Boolean((user as any).emailVerified);
      const matchesVerified =
        verifiedFilter === "all" ||
        (verifiedFilter === "verified" && verified) ||
        (verifiedFilter === "unverified" && !verified);
      return matchesSearch && matchesRole && matchesVerified;
    });
  }, [users, search, roleFilter, verifiedFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const regular = total - admins;
    const verified = users.filter((u) => (u as any).emailVerified).length;
    return { total, admins, regular, verified };
  }, [users]);

  const handleUpdateRole = async (userId: string) => {
    const previous = users;
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user._id === userId
          ? { ...user, role: user.role === "admin" ? "user" : "admin" }
          : user,
      ),
    );
    try {
      await adminUpdateUser({ id: userId }).unwrap();
      toast.success("User role updated successfully");
    } catch {
      setUsers(previous);
      toast.error("Unable to update user role");
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header — compact so content sits under the dual navbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-0.5 inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-700">
            <UsersIcon className="h-3 w-3" />
            Admin
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            User Management
          </h1>
          <p className="mt-0.5 max-w-xl text-sm text-slate-500">
            Search accounts, filter by role, and promote or demote admins.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.total}
          icon={<UsersIcon className="h-5 w-5" />}
          tone="orange"
          loading={isLoading}
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          icon={<Shield className="h-5 w-5" />}
          tone="violet"
          loading={isLoading}
        />
        <StatCard
          label="Customers"
          value={stats.regular}
          icon={<UserRound className="h-5 w-5" />}
          tone="sky"
          loading={isLoading}
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={<BadgeCheck className="h-5 w-5" />}
          tone="emerald"
          loading={isLoading}
        />
      </div>

      {/* Filters + table card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50/80 via-white to-white px-4 py-4 sm:px-6">
          <UserFilters
            search={search}
            role={roleFilter}
            verified={verifiedFilter}
            onSearchChange={setSearch}
            onRoleChange={setRoleFilter}
            onVerifiedChange={setVerifiedFilter}
            resultCount={filteredUsers.length}
          />
        </div>

        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
              <p className="font-semibold text-red-700">
                Could not load users
              </p>
              <p className="mt-1 text-sm text-red-600/80">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <UserTable
              users={filteredUsers as any}
              columns={columns}
              onUpdateRole={handleUpdateRole}
              isUpdating={isUpdating}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "orange" | "violet" | "sky" | "emerald";
  loading?: boolean;
}) {
  const tones = {
    orange: "from-orange-500 to-amber-500 text-orange-600 bg-orange-50",
    violet: "from-violet-500 to-purple-500 text-violet-600 bg-violet-50",
    sky: "from-sky-500 to-blue-500 text-sky-600 bg-sky-50",
    emerald: "from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50",
  };
  const [iconWrap] = tones[tone].split(" ").slice(2);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          {loading ? (
            <Loader2 className="mt-1 h-5 w-5 animate-spin text-slate-300" />
          ) : (
            <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
              {value}
            </p>
          )}
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconWrap}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
