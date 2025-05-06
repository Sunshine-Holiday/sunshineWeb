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
import { User, UserTableColumn } from "@/types/user";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";

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
  } | any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of users per page

  // Sorting logic
  const sortedUsers = [...users].sort((a:any, b:any) => {
    if (!sortConfig) return 0;

    const aValue:any = a[sortConfig.key];
    const bValue:any = b[sortConfig.key];

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
    setSortConfig((current:any) => ({
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
              {columns.map((column:any) => (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user:any, index:any):any => (
              <TableRow key={user._id}>
                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
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
                    onClick={() => onUpdateRole(user._id!)}
                  >
                    Make {user.role === "admin" ? "User" : "Admin"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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