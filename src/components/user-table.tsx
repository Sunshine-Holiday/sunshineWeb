import { useState } from "react";
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
import { User, UserTableColumn } from "@/types/user";
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

// Update the User type to match the schema
interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  profile?: string; // URL for avatar image
  phone?: string;
  address?: string;
  emailVerified: boolean;
}

interface UserTableProps {
  users: User[];
  columns: UserTableColumn[];
  onUpdateRole: (userId: string) => void;
}

export function UserTable({ users, columns, onUpdateRole }: UserTableProps) {
  const isAuth = useSelector(selectCurrentUser);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  // Sorting logic
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key: keyof User) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                  className={column.sortable ? "cursor-pointer" : ""}
                  onClick={() => column.sortable && requestSort(column.id)}
                >
                  {column.label}
                  {sortConfig?.key === column.id && (
                    <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                  )}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user, index) => {
              const profileUrl = (IMAGE_URL + user.profile) || "https://via.placeholder.com/40";
              return (
                <TableRow key={user._id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage
                        src={profileUrl}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={user._id === isAuth?._id}
                      onClick={() => onUpdateRole(user._id)}
                    >
                      Make {user.role === "admin" ? "User" : "Admin"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <ChevronDown className="h-4 w-4" />
                          <span className="ml-2">View Details</span>
                        </Button>
                      </DialogTrigger>
                      {selectedUser?._id === user._id && (
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage
                                  src={profileUrl}
                                  alt={user.username}
                                />
                                <AvatarFallback>
                                  {user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{user.username}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Role:</span>
                                <Badge
                                  variant={user.role === "admin" ? "default" : "secondary"}
                                >
                                  {user.role}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Created:</span>
                                <span>
                                  {new Date(user.createdAt).toLocaleDateString("en-GB")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Phone:</span>
                                <span>{user.phone || "Not provided"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Address:</span>
                                <span>{user.address || "Not provided"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Email Verified:</span>
                                <span>{user.emailVerified ? "Yes" : "No"}</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of{" "}
          {sortedUsers.length} users
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                  className="cursor-pointer"
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}