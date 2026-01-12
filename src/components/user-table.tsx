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
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";
import { IMAGE_URL } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserTableColumn } from "@/types/user";

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
}

/* ================= COMPONENT ================= */

export function UserTable({
  users,
  columns,
  onUpdateRole,
}: UserTableProps) {
  const authUser = useSelector(selectCurrentUser);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const itemsPerPage = 10;

  /* ================= SORTING ================= */

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return users;

    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

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
    setCurrentPage(1); // 🔥 reset page on sort
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

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
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  /* ================= RENDER ================= */

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr No</TableHead>
              <TableHead>Avatar</TableHead>

              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  onClick={() =>
                    column.sortable && requestSort(column.id as keyof User)
                  }
                  className={column.sortable ? "cursor-pointer select-none" : ""}
                >
                  {column.label}
                  {sortConfig?.key === column.id && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </TableHead>
              ))}

              <TableHead>Actions</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 4} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user, index) => {
                const profileUrl = user.profile
                  ? IMAGE_URL + user.profile
                  : "https://via.placeholder.com/40";

                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    <TableCell>
                      <Avatar>
                        <AvatarImage src={profileUrl} />
                        <AvatarFallback>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={user._id === authUser?._id}
                        onClick={() => onUpdateRole(user._id)}
                      >
                        Make {user.role === "admin" ? "User" : "Admin"}
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                          >
                            <ChevronDown className="h-4 w-4" />
                            <span className="ml-1">View</span>
                          </Button>
                        </DialogTrigger>

                        {selectedUser?._id === user._id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2">
                              <p><b>Username:</b> {user.username}</p>
                              <p><b>Email:</b> {user.email}</p>
                              <p><b>Phone:</b> {user.phone || "N/A"}</p>
                              <p><b>Address:</b> {user.address || "N/A"}</p>
                              <p>
                                <b>Email Verified:</b>{" "}
                                {user.emailVerified ? "Yes" : "No"}
                              </p>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ================= PAGINATION UI ================= */}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} –{" "}
            {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of{" "}
            {sortedUsers.length}
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getVisiblePages().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
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
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
