import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/reducer/auth";

interface RedirectRouteProps {
  redirectPath?: string; // Path to redirect if the user is authenticated
}

const RedirectRoute: React.FC<RedirectRouteProps> = ({
  redirectPath = "/", // Default redirect to the dashboard
}) => {
  const isAuth = useSelector(selectCurrentUser);

  if (isAuth) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default RedirectRoute;
