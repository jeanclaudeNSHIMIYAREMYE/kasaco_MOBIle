// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./auth/AuthContext";

import Home from "./pages/Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Marques from "./pages/Marques";
import Modeles from "./pages/Modeles";
import VoitureDetail from "./pages/VoitureDetail";
import Dashboard from "./pages/Dashboard";
import DashboardAdmin from "./pages/DashboardAdmin";

import PourquoiKasaco from "./pages/PourquoiKasaco";
import RechercheModele from "./pages/RechercheModele";
import AdminUsers from "./pages/admin/Users";
import AdminMarques from "./pages/admin/Marques";
import AdminModeles from "./pages/admin/Modeles";
import AdminVoitures from "./pages/admin/Voitures";
import AjouterVoiture from "./pages/admin/AjouterVoiture";
import ReserverVoiture from "./pages/admin/ReserverVoiture";
import AdminReservations from "./pages/admin/Reservations";
import AdminStatistiques from "./pages/admin/Statistiques";

// Route privée
function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

// Route pour admin seulement
function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return user?.role === "admin" ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ==================== PAGES PUBLIQUES ==================== */}
          <Route path="/" element={<Home />} />
          <Route path="/marques" element={<Marques />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/modeles/:marqueId" element={<Modeles />} />
          <Route path="/voiture/:voitureId" element={<VoitureDetail />} />
          <Route path="/pourquoi-kasaco" element={<PourquoiKasaco />} />
          <Route path="/recherche" element={<RechercheModele />} />

          {/* ==================== DASHBOARD PRINCIPAL ==================== */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* ==================== ROUTES ADMIN ==================== */}
          
          {/* Dashboard Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardAdmin />
              </AdminRoute>
            }
          />

          {/* Gestion des utilisateurs */}
          <Route
            path="/admin/utilisateurs"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          {/* Gestion des marques */}
          <Route
            path="/admin/marques"
            element={
              <AdminRoute>
                <AdminMarques />
              </AdminRoute>
            }
          />

          {/* Gestion des modèles */}
          <Route
            path="/admin/modeles"
            element={
              <AdminRoute>
                <AdminModeles />
              </AdminRoute>
            }
          />

          {/* Gestion des voitures - Liste */}
          <Route
            path="/admin/voitures"
            element={
              <AdminRoute>
                <AdminVoitures />
              </AdminRoute>
            }
          />

          {/* Gestion des voitures - Ajouter */}
          <Route
            path="/admin/voitures/ajouter"
            element={
              <AdminRoute>
                <AjouterVoiture />
              </AdminRoute>
            }
          />

          {/* Gestion des réservations */}
<Route
 path="/admin/voitures/reserver/:voitureId"
  element={
    <AdminRoute>
      <ReserverVoiture />
    </AdminRoute>
  }
/>

<Route
  path="/admin/reservations"
  element={
    <AdminRoute>
      <AdminReservations />
    </AdminRoute>
  }
/>

          {/* Statistiques */}
       <Route
  path="/admin/statistiques"
  element={
    <AdminRoute>
      <AdminStatistiques />
    </AdminRoute>
  }
/>

          {/* ==================== ROUTES UTILISATEUR ==================== */}
          
          {/* Mes réservations */}
          <Route
            path="/mes-reservations"
            element={
              <PrivateRoute>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Mes réservations</h2>
                  <p className="text-gray-600 mt-2">Page en cours de développement</p>
                </div>
              </PrivateRoute>
            }
          />

          {/* Favoris */}
          <Route
            path="/favoris"
            element={
              <PrivateRoute>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Mes favoris</h2>
                  <p className="text-gray-600 mt-2">Page en cours de développement</p>
                </div>
              </PrivateRoute>
            }
          />

          {/* Profil */}
          <Route
            path="/profil"
            element={
              <PrivateRoute>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">Mon profil</h2>
                  <p className="text-gray-600 mt-2">Page en cours de développement</p>
                </div>
              </PrivateRoute>
            }
          />

          {/* ==================== REDIRECTION ==================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;