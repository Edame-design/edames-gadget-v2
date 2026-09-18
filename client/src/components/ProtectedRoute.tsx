import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  adminOnly?: boolean;
};

export function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}