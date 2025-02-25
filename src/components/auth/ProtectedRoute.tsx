
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "user" | "seller" | "admin";
}

const ProtectedRoute = ({ children, role = "user" }: ProtectedRouteProps) => {
  const { isLoaded, userId, getToken } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // For demo purposes, we're using a simple role check
  // In a real app, you'd want to verify roles against your backend
  if (role === "seller" && !localStorage.getItem("isSeller")) {
    return <Navigate to="/seller/login" replace />;
  }

  if (role === "admin" && !localStorage.getItem("isAdmin")) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
