import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentLoading, selectCurrentUser } from "@/store/reducer/auth";
import { LoadingSkeleton } from "@/loader/loader";

interface ProtectedRouteProps {
  role?: "admin" | "user";
  children?: React.ReactNode;
  spinnerClassName?: string; // For customizing the spinner
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, children }) => {
  const isAuth = useSelector(selectCurrentUser);
  const isAuthLoading = useSelector(selectCurrentLoading);

  const location = useLocation();

  if (isAuthLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuth) {
    return <Navigate to="/signin" state={{ from: location.pathname }} />;
  }

  if (role === "admin" && isAuth.role !== "admin") {
    return <Navigate to="/not-authorized" />;
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
