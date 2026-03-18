// src/components/admin/AdminNavbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/useAuth";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location]);

  // Fonction pour vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Vérifier si un lien parent est actif (pour les sous-chemins)
  const isParentActive = (path) => {
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  // Classes pour les liens actifs/inactifs
  const getLinkClass = (path, activeColor = "bg-purple-600/30") => {
    const baseClass = "flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300";
    if (isActive(path) || isParentActive(path)) {
      return `${baseClass} text-white ${activeColor}`;
    }
    return `${baseClass} text-gray-300 hover:text-white hover:bg-white/10`;
  };

  // Icônes pour chaque section
  const navItems = [
    { path: "/admin", icon: "fa-chart-pie", label: "Dashboard", color: "bg-purple-600/30" },
    { path: "/admin/utilisateurs", icon: "fa-users", label: "Utilisateurs", color: "bg-purple-600/30" },
    { path: "/admin/marques", icon: "fa-tags", label: "Marques", color: "bg-purple-600/30" },
    { path: "/admin/modeles", icon: "fa-layer-group", label: "Modèles", color: "bg-green-600/30" },
    { path: "/admin/voitures", icon: "fa-car", label: "Voitures", color: "bg-purple-600/30" },
    { path: "/admin/voitures/ajouter", icon: "fa-plus-circle", label: "Ajouter", color: "bg-blue-600/30", mobile: true },
    { path: "/admin/voitures/reserver", icon: "fa-calendar-check", label: "Réserver", color: "bg-green-600/30", mobile: true },
    { path: "/admin/reservations", icon: "fa-calendar-check", label: "Réservations", color: "bg-purple-600/30" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-b border-purple-500/20 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wider bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              KASACO Admin
            </span>
          </Link>

          {/* Menu Desktop - Items principaux */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.filter(item => !item.mobile).map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={getLinkClass(item.path, item.color)}
              >
                <i className={`fa ${item.icon} group-hover:scale-110 transition-transform`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Profil */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-3 focus:outline-none group"
              aria-label="Menu utilisateur"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-purple-300">Administrateur</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Menu déroulant */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 py-2 animate-fadeInDown">
                {/* En-tête du menu */}
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>

                {/* Liens du menu */}
                <Link
                  to="/admin/profil"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <i className="fa fa-user w-5 text-gray-400"></i>
                  <span className="ml-2">Mon profil</span>
                </Link>
                
                <Link
                  to="/admin/parametres"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <i className="fa fa-cog w-5 text-gray-400"></i>
                  <span className="ml-2">Paramètres</span>
                </Link>

                {/* Actions rapides */}
                <div className="border-t border-gray-700 my-1"></div>
                
                <Link
                  to="/admin/voitures/ajouter"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <i className="fa fa-plus-circle w-5 text-green-400"></i>
                  <span className="ml-2">Ajouter une voiture</span>
                </Link>
                
                <Link
                  to="/admin/voitures"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <i className="fa fa-list w-5 text-blue-400"></i>
                  <span className="ml-2">Liste des voitures</span>
                </Link>

                <div className="border-t border-gray-700 my-1"></div>
                
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
                >
                  <i className="fa fa-sign-out-alt w-5"></i>
                  <span className="ml-2">Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile - Version simplifiée */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-gray-800/50">
          <Link to="/admin" className={`flex flex-col items-center text-xs ${isActive('/admin') ? 'text-purple-400' : 'text-gray-400'}`}>
            <i className="fa fa-chart-pie text-lg"></i>
           <span>Tableau de bord</span>
          </Link>
          <Link to="/admin/voitures" className={`flex flex-col items-center text-xs ${isActive('/admin/voitures') ? 'text-purple-400' : 'text-gray-400'}`}>
            <i className="fa fa-car text-lg"></i>
            <span>Voitures</span>
          </Link>
          <Link to="/admin/reservations" className={`flex flex-col items-center text-xs ${isActive('/admin/reservations') ? 'text-purple-400' : 'text-gray-400'}`}>
            <i className="fa fa-calendar-check text-lg"></i>
            <span>Réserv.</span>
          </Link>
          <Link to="/admin/utilisateurs" className={`flex flex-col items-center text-xs ${isActive('/admin/utilisateurs') ? 'text-purple-400' : 'text-gray-400'}`}>
            <i className="fa fa-users text-lg"></i>
            <span>Users</span>
          </Link>

        
<Link 
  to="/admin/statistiques" 
  className={getLinkClass("/admin/statistiques", "bg-pink-600/30")}
>
  <i className="fa fa-chart-line"></i>
  <span>Statistiques</span>
</Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}