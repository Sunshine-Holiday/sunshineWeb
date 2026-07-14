import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BadgeCheck,
  Eye,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldOff,
  UserRound,
  Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { IMAGE_URL } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserTableColumn } from "@/types/user";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */

interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  profile?: string;
  phone?: string;
  address?: string;
  emailVerified: boolean;
}

interface UserTableProps {
  users: User[];
  columns: UserTableColumn[];
  onUpdateRole: (userId: string) => void;
  isUpdating?: boolean;
}

/* ================= COMPONENT ================= */

export function UserTable({
  users,
  columns,
  onUpdateRole,
  isUpdating,
}: UserTableProps) {
  const authUser = useSelector(selectCurrentUser);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>({ key: "createdAt", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const itemsPerPage = 10;

  /* ================= SORTING ================= */

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return users;

    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const requestSort = (key: keyof User) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(currentPage - 2, 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortConfig?.key !== columnId) {
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-300" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-orange-500" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-orange-500" />
    );
  };

  const initials = (name: string) =>
    (name || "?")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  /* ================= RENDER ================= */

  if (sortedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <Users className="h-7 w-7" />
        </div>
        <p className="text-base font-semibold text-slate-800">No users found</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Try a different search term or clear the role / verification filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-14 text-xs font-semibold uppercase tracking-wide text-slate-500">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </TableHead>
              {columns
                .filter((c) => c.id !== "username")
                .map((column) => (
                  <TableHead
                    key={column.id}
                    onClick={() =>
                      column.sortable &&
                      requestSort(column.id as keyof User)
                    }
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide text-slate-500",
                      column.sortable && "cursor-pointer select-none",
                    )}
                  >
                    {column.label}
                    {column.sortable && <SortIcon columnId={column.id} />}
                  </TableHead>
                ))}
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedUsers.map((user, index) => {
              const profileUrl = user.profile
                ? IMAGE_URL + user.profile
                : undefined;
              const isSelf = user._id === authUser?._id;
              const makingAdmin = user.role !== "admin";

              return (
                <TableRow
                  key={user._id}
                  className="group border-slate-100 transition hover:bg-orange-50/40"
                >
                  <TableCell className="tabular-nums text-slate-400">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-orange-100 shadow-sm">
                        {profileUrl && <AvatarImage src={profileUrl} />}
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-sm font-bold text-white">
                          {initials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {user.username}
                          </p>
                          {isSelf && (
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                              You
                            </span>
                          )}
                        </div>
                        {user.phone && (
                          <p className="truncate text-xs text-slate-500">
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-slate-700">{user.email}</span>
                  </TableCell>

                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>

                  <TableCell className="text-sm text-slate-600">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <VerifiedBadge verified={user.emailVerified} />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 rounded-lg text-slate-600 hover:bg-white hover:text-orange-600"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSelf || isUpdating}
                        onClick={() => setConfirmUser(user)}
                        className={cn(
                          "h-9 rounded-lg border-slate-200 font-semibold shadow-sm",
                          makingAdmin
                            ? "text-violet-700 hover:border-violet-200 hover:bg-violet-50"
                            : "text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                        )}
                      >
                        {makingAdmin ? (
                          <>
                            <Shield className="mr-1.5 h-3.5 w-3.5" />
                            Make Admin
                          </>
                        ) : (
                          <>
                            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                            Make User
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paginatedUsers.map((user) => {
          const profileUrl = user.profile
            ? IMAGE_URL + user.profile
            : undefined;
          const isSelf = user._id === authUser?._id;
          const makingAdmin = user.role !== "admin";

          return (
            <div
              key={user._id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-orange-100">
                  {profileUrl && <AvatarImage src={profileUrl} />}
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 font-bold text-white">
                    {initials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      {user.username}
                    </p>
                    {isSelf && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                        You
                      </span>
                    )}
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {user.email}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <VerifiedBadge verified={user.emailVerified} />
                    <span className="text-xs text-slate-400">
                      Joined{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-GB")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setSelectedUser(user)}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isSelf || isUpdating}
                  className="flex-1 rounded-xl font-semibold"
                  onClick={() => setConfirmUser(user)}
                >
                  {makingAdmin ? "Make Admin" : "Make User"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {sortedUsers.length > itemsPerPage && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            –
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * itemsPerPage, sortedUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {sortedUsers.length}
            </span>
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer rounded-lg"
                  }
                />
              </PaginationItem>

              {getVisiblePages().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "cursor-pointer rounded-lg",
                      currentPage === page &&
                        "bg-orange-500 text-white hover:bg-orange-600 hover:text-white",
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer rounded-lg"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Details dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      >
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-2xl">
          {selectedUser && (
            <>
              <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 px-6 pb-10 pt-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-left text-white">
                    User profile
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/40 shadow-lg">
                    {selectedUser.profile && (
                      <AvatarImage
                        src={IMAGE_URL + selectedUser.profile}
                      />
                    )}
                    <AvatarFallback className="bg-white/20 text-lg font-bold text-white">
                      {initials(selectedUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-bold">{selectedUser.username}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <RoleBadge role={selectedUser.role} light />
                      <VerifiedBadge
                        verified={selectedUser.emailVerified}
                        light
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="-mt-6 space-y-3 px-6 pb-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <DetailRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={selectedUser.email}
                  />
                  <DetailRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                    value={selectedUser.phone || "Not provided"}
                  />
                  <DetailRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                    value={selectedUser.address || "Not provided"}
                  />
                  <DetailRow
                    icon={<UserRound className="h-4 w-4" />}
                    label="Joined"
                    value={
                      selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "—"
                    }
                    last
                  />
                </div>

                {selectedUser._id !== authUser?._id && (
                  <Button
                    className="w-full rounded-xl bg-orange-500 font-semibold hover:bg-orange-600"
                    disabled={isUpdating}
                    onClick={() => {
                      setConfirmUser(selectedUser);
                    }}
                  >
                    {selectedUser.role === "admin"
                      ? "Demote to User"
                      : "Promote to Admin"}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Role change confirm */}
      <Dialog
        open={!!confirmUser}
        onOpenChange={(open) => !open && setConfirmUser(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          {confirmUser && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {confirmUser.role === "admin"
                    ? "Demote to customer?"
                    : "Promote to admin?"}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm leading-relaxed text-slate-600">
                {confirmUser.role === "admin" ? (
                  <>
                    <span className="font-semibold text-slate-900">
                      {confirmUser.username}
                    </span>{" "}
                    will lose admin access and become a regular customer.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-slate-900">
                      {confirmUser.username}
                    </span>{" "}
                    will gain full admin permissions for this panel.
                  </>
                )}
              </p>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setConfirmUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-xl bg-orange-500 hover:bg-orange-600"
                  disabled={isUpdating}
                  onClick={() => {
                    onUpdateRole(confirmUser._id);
                    setConfirmUser(null);
                    setSelectedUser(null);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RoleBadge({
  role,
  light,
}: {
  role: "admin" | "user";
  light?: boolean;
}) {
  const isAdmin = role === "admin";
  if (light) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
        {isAdmin ? <Shield className="h-3 w-3" /> : <UserRound className="h-3 w-3" />}
        {isAdmin ? "Admin" : "Customer"}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        isAdmin
          ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
          : "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      )}
    >
      {isAdmin ? (
        <Shield className="h-3 w-3" />
      ) : (
        <UserRound className="h-3 w-3" />
      )}
      {isAdmin ? "Admin" : "Customer"}
    </span>
  );
}

function VerifiedBadge({
  verified,
  light,
}: {
  verified: boolean;
  light?: boolean;
}) {
  if (light) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
        <BadgeCheck className="h-3 w-3" />
        {verified ? "Verified" : "Unverified"}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        verified
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      )}
    >
      <BadgeCheck className="h-3 w-3" />
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3",
        !last && "border-b border-slate-100",
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}
