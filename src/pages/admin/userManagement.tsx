import { useEffect, useState } from "react";

import { UserTable } from "@/components/user-table";
import { UserFilters } from "@/components/user-filters";

import { columns, User } from "@/types/user";
import {
  useAdminUpdateUserMutation,
  useAllUserDetailQuery,
} from "@/store/api/auth";
import { toast } from "react-toastify";

export default function Users() {
  const { isLoading, data } = useAllUserDetailQuery();
  console.log(data);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  useEffect(() => {
    if (data?.user) {
      setUsers(data?.user!);
    }
  }, [data]);
  const [adminUpdateUser] = useAdminUpdateUserMutation();
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUpdateRole = async (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user._id === userId
          ? { ...user, role: user.role === "admin" ? "user" : "admin" }
          : user
      )
    );
    try {
      await adminUpdateUser({ id: userId }).unwrap();
      // console.log(userId);
      toast.success("User role updated successfully");
    } catch (error) {
      toast.error("User role unable to updated ");
      console.log(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions.
        </p>
      </div>

      <UserFilters
        search={search}
        role={roleFilter}
        onSearchChange={setSearch}
        onRoleChange={setRoleFilter}
      />

      {/* Skeleton loader for the table when loading */}
      {isLoading ? (
        <div className="space-y-4">
          {/* Skeleton for table header */}
          <div className="h-8 bg-gray-300 animate-pulse rounded"></div>
          {/* Skeleton for table rows */}
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-4 w-32 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-48 bg-gray-300 animate-pulse rounded"></div>
                <div className="h-4 w-24 bg-gray-300 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          columns={columns}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
}
