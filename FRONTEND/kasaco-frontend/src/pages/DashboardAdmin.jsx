// src/pages/DashboardAdmin.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import api from "../services/api";

// Composants d'icônes SVG
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Marques: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Modeles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Voitures: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Reservations: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Stats: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  // Icônes supplémentaires pour les raccourcis
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export default function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    utilisateurs: 0,
    voitures: 0,
    reservations: 0,
    marques: 0,
    modeles: 0,
    revenus: 0
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Erreur chargement stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Définir le message de bienvenue selon l'heure
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bonjour");
    else if (hour < 18) setGreeting("Bon après-midi");
    else setGreeting("Bonsoir");
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", icon: Icons.Dashboard, label: "Tableau de bord" },
    { path: "/admin/utilisateurs", icon: Icons.Users, label: "Utilisateurs" },
    { path: "/admin/marques", icon: Icons.Marques, label: "Marques" },
    { path: "/admin/modeles", icon: Icons.Modeles, label: "Modèles" },
    { path: "/admin/voitures", icon: Icons.Voitures, label: "Voitures" },
    { path: "/admin/reservations", icon: Icons.Reservations, label: "Réservations" },
    { path: "/admin/statistiques", icon: Icons.Stats, label: "Statistiques" },
  ];

  const statCards = [
    { 
      title: "Utilisateurs", 
      value: stats.utilisateurs, 
      icon: Icons.Users, 
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-500"
    },
    { 
      title: "Voitures", 
      value: stats.voitures, 
      icon: Icons.Voitures, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-500"
    },
    { 
      title: "Réservations", 
      value: stats.reservations, 
      icon: Icons.Reservations, 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-500"
    },
    { 
      title: "Marques", 
      value: stats.marques, 
      icon: Icons.Marques, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-500"
    },
  ];

  const quickActions = [
    {
      title: "Ajouter une voiture",
      icon: Icons.Voitures,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      path: "/admin/voitures/ajouter",
      description: "Nouveau véhicule"
    },
    {
      title: "Nouvelle marque",
      icon: Icons.Marques,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      path: "/admin/marques/ajouter",
      description: "Ajouter une marque"
    },
    {
      title: "Créer un modèle",
      icon: Icons.Modeles,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      path: "/admin/modeles/ajouter",
      description: "Nouveau modèle"
    },
    {
      title: "Voir les réservations",
      icon: Icons.Reservations,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      path: "/admin/reservations",
      description: "Gestion des réservations"
    },
  ];

  // ==================== RACCOURCIS RAPIDES ====================
  const shortcuts = [
    {
      title: "Ajouter une voiture",
      icon: Icons.Plus,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      hoverColor: "hover:bg-red-200",
      path: "/admin/voitures/ajouter"
    },
    {
      title: "Liste des voitures",
      icon: Icons.List,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      hoverColor: "hover:bg-blue-200",
      path: "/admin/voitures"
    },
    {
      title: "Nouvelle marque",
      icon: Icons.Plus,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      hoverColor: "hover:bg-purple-200",
      path: "/admin/marques/ajouter"
    },
    {
      title: "Nouveau modèle",
      icon: Icons.Plus,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      hoverColor: "hover:bg-green-200",
      path: "/admin/modeles/ajouter"
    },
    {
      title: "Réservations",
      icon: Icons.Calendar,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      hoverColor: "hover:bg-yellow-200",
      path: "/admin/reservations"
    },
    {
      title: "Paramètres",
      icon: Icons.Settings,
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      hoverColor: "hover:bg-gray-200",
      path: "/admin/parametres"
    },
  ];

  // Calculer le nombre total pour l'affichage
  const totalItems = stats.utilisateurs + stats.voitures + stats.marques + stats.modeles;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-sans">
      {/* Éléments décoratifs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* ================= OVERLAY MOBILE ================= */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ================= SIDEBAR DESKTOP ================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-200/50">
        {/* Profil admin */}
        <div className="relative h-36 flex flex-col items-center justify-center bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
          
          <div className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl mb-2 border-4 border-white/50 group-hover:scale-110 transition-transform">
            <span className="text-3xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <span className="relative font-bold text-white text-lg">
            {user?.username || "Administrateur"}
          </span>
          <span className="relative text-xs text-white/80">Administrateur</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="group flex items-center p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-indigo-50 hover:text-red-600 transition-all duration-300 hover:translate-x-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300 mr-3">
                <item.icon />
              </span>
              <span className="font-medium">{item.label}</span>
              {item.label === "Dashboard" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </Link>
          ))}
          
          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 group"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300 mr-3">
              <Icons.Logout />
            </span>
            <span className="font-medium">Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* ================= SIDEBAR MOBILE ================= */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl transform transition-all duration-500 md:hidden z-40 shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Profil admin mobile */}
        <div className="relative h-36 flex flex-col items-center justify-center bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl mb-2 border-4 border-white/50">
            <span className="text-2xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <span className="relative font-bold text-white text-base">
            {user?.username || "Administrateur"}
          </span>
          <span className="relative text-xs text-white/80">Administrateur</span>
        </div>

        {/* Navigation mobile */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-indigo-50 hover:text-red-600 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 mr-3">
                <item.icon />
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="mt-6 w-full flex items-center p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 mr-3">
              <Icons.Logout />
            </span>
            <span className="font-medium">Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            {/* Bouton Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent md:block hidden">
              KASACO ADMIN
            </h1>

            {/* Info utilisateur */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{greeting}, {user?.username}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6 lg:p-8">
          {/* En-tête du dashboard */}
          <div className="mb-8 animate-fadeInDown">
            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tableau de bord 
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Bienvenue sur votre espace de gestion KASACO · <span className="font-semibold text-red-600">{totalItems}</span> éléments au total
            </p>
          </div>

        

          {/* Statistiques */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => (
                <div
                  key={card.title}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 ${card.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <card.icon />
                      </div>
                      <span className={`text-3xl font-bold ${card.textColor}`}>{card.value}</span>
                    </div>
                    <p className="text-gray-600 font-medium">{card.title}</p>
                    <div className="mt-4 flex items-center text-xs text-gray-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                      En ligne
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-indigo-600 rounded-full mr-3"></span>
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.path}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden animate-fadeInUp"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 ${action.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Menu de gestion */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-indigo-600 rounded-full mr-3"></span>
              Gestion complète
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {navItems.slice(1).map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                >
                  <div className="p-5 flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-red-50 to-indigo-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <item.icon />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Gérer les {item.label.toLowerCase()}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Informations admin */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100 animate-fadeInUp">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-indigo-600 rounded-full mr-3"></span>
              Informations administrateur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                <p className="font-semibold text-gray-800 text-lg">{user?.username}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-800 text-lg break-all">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Rôle</p>
                <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-600">
                  Administrateur
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Membre depuis</p>
                <p className="font-semibold text-gray-800">
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}