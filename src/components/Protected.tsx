import { Navigate } from "react-router-dom";
import type React from "react";
import { useAuth } from "../context/AuthContext";

export function Protected({ role, children }: { role: "hospital" | "admin"; children: React.ReactNode }) {
  const { user, token } = useAuth();
  if (!token || user?.role !== role) {
    return <Navigate to={role === "hospital" ? "/hospital" : "/admin"} replace />;
  }
  return <>{children}</>;
}
