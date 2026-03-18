// src/components/Navigation.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

// Import du logo
import logo from "../assets/images/logo (2).png";

// Icônes SVG personnalisées
const Icons = {
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Admin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Login: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  Signup: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.682-3.618 13.93 13.93 0 002.313-7.501c0-.213-.005-.425-.014-.636A9.935 9.935 0 0024 4.59z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  ),
};

export default function Navigation({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Détecter le scroll pour changer le style de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile quand la route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Fade-up on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const faders = document.querySelectorAll(".fade-up");
    faders.forEach((fader) => observer.observe(fader));

    return () => {
      faders.forEach((fader) => observer.unobserve(fader));
    };
  }, [children]);

  const handleLogout = async () => {
    await logout();
  };

  // Liens de navigation en français
  const navLinks = [
    { to: "/", icon: Icons.Home, label: "Accueil" },
    { to: "/pourquoi-kasaco", icon: Icons.Info, label: "Pourquoi KASACO" },
    ...(isAuthenticated ? [
      { to: "/dashboard", icon: Icons.Dashboard, label: "Tableau de bord" },
      ...(user?.role === "admin" ? [{ to: "/admin", icon: Icons.Admin, label: "Administration" }] : [])
    ] : [])
  ];

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">
      {/* ================= NAVBAR PREMIUM ================= */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gradient-to-r from-gray-900 via-red-900 to-gray-900 shadow-2xl py-2' 
          : 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-lg py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo avec animation */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <img
                src={logo}
                className="rounded-full w-10 h-10 md:w-12 md:h-12 object-cover border-2 border-white/30 group-hover:border-white transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6"
                alt="KASACO"
              />
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className={`font-bold text-xl md:text-2xl tracking-wider transition-colors ${
              scrolled ? 'text-white' : 'text-white'
            }`}>
              KASACO
            </span>
          </Link>

          {/* Menu Desktop Premium - avec labels en français */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg text-white font-medium overflow-hidden group transition-all duration-300 ${
                  location.pathname === link.to 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <link.icon />
                  <span>{link.label}</span>
                </span>
                <span className={`absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ${
                  location.pathname === link.to ? 'scale-x-100' : ''
                }`}></span>
              </Link>
            ))}

            {/* Boutons d'authentification en français */}
            <div className="ml-4 flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300 group"
                >
                  <Icons.Logout />
                  <span>Déconnexion</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg group"
                  >
                    <Icons.Login />
                    <span>Connexion</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-red-600 hover:scale-105 transition-all duration-300 group"
                  >
                    <Icons.Signup />
                    <span>Inscription</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button Premium */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </div>
          </button>
        </div>

        {/* Menu Mobile Premium - avec labels en français */}
        <div
          className={`absolute top-full left-0 right-0 mt-2 mx-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden transition-all duration-500 transform ${
            isMobileMenuOpen 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
          } lg:hidden`}
        >
          <div className="p-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'bg-gradient-to-r from-red-600 to-red-700'
                    : 'hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}

            {/* Séparateur */}
            <div className="h-px bg-gray-800 my-2"></div>

            {/* Boutons d'authentification mobile en français */}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
              >
                <Icons.Logout />
                <span className="font-medium">Déconnexion</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icons.Login />
                  <span className="font-medium">Connexion</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icons.Signup />
                  <span className="font-medium">Inscription</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <main className={`flex-grow transition-all duration-500 ${
        scrolled ? 'pt-24' : 'pt-28'
      } px-4 max-w-7xl mx-auto w-full`}>
        {children}
      </main>

      {/* ================= FOOTER PREMIUM ================= */}
      <footer className="relative bg-gradient-to-b from-gray-900 to-black text-gray-300 mt-20 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Bloc 1 - À propos */}
            <div className="fade-up space-y-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="KASACO" className="w-10 h-10 rounded-full border-2 border-red-500" />
                <span className="text-2xl font-bold text-white">KASACO</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Votre partenaire de confiance pour l'achat et la vente de véhicules au Burundi. 
                Expertise, qualité et service client exceptionnel.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300">
                  <Icons.Facebook />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300">
                  <Icons.Twitter />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300">
                  <Icons.Instagram />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300">
                  <Icons.WhatsApp />
                </a>
              </div>
            </div>

            {/* Bloc 2 - Services */}
            <div className="fade-up space-y-4">
              <h5 className="font-bold text-lg text-white mb-4">Nos Services</h5>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    Vente de véhicules
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    Importation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    Garage & entretien
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    Financement
                  </a>
                </li>
              </ul>
            </div>

            {/* Bloc 3 - Contact */}
            <div className="fade-up space-y-4">
              <h5 className="font-bold text-lg text-white mb-4">Contact</h5>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-400">
                  <i className="bi bi-geo-alt-fill text-red-500 mt-1"></i>
                  <span>Bujumbura - Burundi, bldg Saint Pierre Avenue de l’OUA</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <i className="bi bi-envelope-fill text-red-500"></i>
                  <a href="mailto:karinzi.bi.sab@gmail.com" className="hover:text-red-400 transition-colors">
                    karinzi.bi.sab@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <i className="bi bi-telephone-fill text-red-500"></i>
                  <span>+257 69 080 278 / +257 69 073 740</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <i className="bi bi-whatsapp text-green-500"></i>
                  <a href="https://wa.me/25769080278" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                    +257 69 080 278
                  </a>
                </li>
              </ul>
            </div>

            {/* Bloc 4 - Newsletter */}
            <div className="fade-up space-y-4">
              <h5 className="font-bold text-lg text-white mb-4">Newsletter</h5>
              <p className="text-sm text-gray-400">
                Inscrivez-vous pour recevoir nos dernières offres et actualités.
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <button className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 hover:scale-105 transition-all duration-300">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-8"></div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © {new Date().getFullYear()} <span className="font-semibold text-white">KASACO</span>
            </div>
          <div className="flex justify-center">
  <p className="text-gray-300 hover:text-white transition-colors text-sm">
    Développé par <span className="font-semibold text-white">Programmeur passionné</span>
  </p>
</div>
          </div>
        </div>
      </footer>

      {/* ================= STYLES CSS ================= */}
      <style>{`
        /* Fade-up animation */
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-up.show {
          opacity: 1;
          transform: translateY(0);
        }

        /* Blob animation */
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

        /* Hover glow effect */
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(255, 69, 0, 0.5);
          transform: scale(1.05);
        }

        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #ef4444;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
        }
      `}</style>

      {/* Bootstrap Icons CDN (gardé pour certaines icônes) */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
      />
    </div>
  );
}