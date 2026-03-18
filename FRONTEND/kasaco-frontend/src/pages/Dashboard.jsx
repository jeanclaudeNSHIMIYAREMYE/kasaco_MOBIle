// src/pages/Dashboard.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import DashboardAdmin from "./DashboardAdmin";
import DashboardUser from "./DashboardUser";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger vers le dashboard approprié selon le rôle
  if (user?.role === "admin") {
    return <DashboardAdmin />;
  }

  // Dashboard utilisateur
  return <DashboardUser />;
}