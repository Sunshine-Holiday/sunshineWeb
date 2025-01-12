export type UserRole = "admin" | "user";

export interface User {
  createdAt?: string;
  _id?: string; // User ID
  username: string; // User's full name
  email: string; // User's email
  token?: string; // Authentication token (JWT or similar)
  role?: "admin" | "user"; // User role
  phone?: string;
  address?: string;
}
export interface contact{
  name: string;
  email: string;
  message: string;
}
export interface UserTableColumn {
  id: keyof User | "actions";
  label: string;
  sortable?: boolean;
}
export interface UserDetail {
  user?: User;
}
export const columns: UserTableColumn[] = [
  { id: "username", label: "Username", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "role", label: "Role", sortable: true },
  { id: "createdAt", label: "Created At", sortable: true }, // Changed from 'lastActive' to 'createdAt'
];