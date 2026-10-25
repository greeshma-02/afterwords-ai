import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSignInRedirectPath, isAuthenticated } from "./authApi";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={getSignInRedirectPath(location.pathname)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
