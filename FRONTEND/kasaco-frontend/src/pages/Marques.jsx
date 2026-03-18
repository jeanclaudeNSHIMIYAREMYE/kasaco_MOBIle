// src/pages/Marques.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

// Icônes SVG personnalisées
const Icons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function Marques() {
  const [marques, setMarques] = useState([]);
  const [filteredMarques, setFilteredMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [animateItems, setAnimateItems] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);
  
  const observerRef = useRef(null);
  const searchInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    const fetchMarques = async () => {
      try {
        setLoading(true);
        console.log("🔄 Chargement des marques...");
        
        const response = await fetch(`${API_BASE_URL}/marquesuser/`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📦 Données reçues:", data);
        
        let marquesData = [];
        if (Array.isArray(data)) {
          marquesData = data;
        } else if (data && data.results && Array.isArray(data.results)) {
          marquesData = data.results;
        }
        
        // Trier les marques par nom
        marquesData.sort((a, b) => a.nom.localeCompare(b.nom));
        
        setMarques(marquesData);
        setFilteredMarques(marquesData);
        setTimeout(() => setAnimateItems(true), 100);
        
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarques();
  }, []);

  // Fonction pour obtenir l'URL complète de l'image
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/media')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/media/${imagePath}`;
  };

  // Filtrer les marques par recherche
  useEffect(() => {
    const filtered = marques.filter(marque =>
      marque.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMarques(filtered);
    setVisibleCount(30);
  }, [searchTerm, marques]);

  // Charger plus de marques au scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 15, filteredMarques.length));
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerRef.current) {
      const loader = document.getElementById('loader');
      if (loader) observerRef.current.observe(loader);
    }

    return () => observerRef.current?.disconnect();
  }, [filteredMarques.length]);

  const visibleMarques = filteredMarques.slice(0, visibleCount);

  if (loading) {
    return (
      <Navigation>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="text-white mt-4 text-sm animate-pulse">Chargement des marques...</p>
          </div>
        </div>
      </Navigation>
    );
  }

  if (error) {
    return (
      <Navigation>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md text-center border border-white/20">
            <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-3">
              <Icons.Close />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-lg text-sm hover:scale-105 transition-all duration-300"
            >
              Réessayer
            </button>
          </div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="min-h-screen bg-gray-50">
        
        {/* Header simple */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Nos Marques</h1>
            
            {/* Barre de recherche compacte */}
            <div className="relative max-w-md">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher une marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.Search />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icons.Close />
                </button>
              )}
            </div>
            
            {/* Résultats */}
            {searchTerm && (
              <p className="text-xs text-gray-500 mt-2">
                {filteredMarques.length} résultat(s) pour "{searchTerm}"
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Grille de petites cartes */}
          {filteredMarques.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {visibleMarques.map((marque, index) => (
                <Link
                  key={marque.id}
                  to={`/modeles/${marque.id}`}
                  className={`group flex flex-col items-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
                    animateItems ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 20}ms` }}
                >
                  {/* Logo très petit */}
                  <div className="w-10 h-10 mb-1 flex items-center justify-center">
                    {marque.logo_url ? (
                      <img
                        src={getFullImageUrl(marque.logo_url)}
                        alt={marque.nom}
                        className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const fallback = document.createElement('div');
                          fallback.className = "w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold";
                          fallback.textContent = marque.nom?.charAt(0) || "?";
                          parent.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                        {marque.nom?.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Nom de la marque en très petit */}
                  <span className="text-[10px] text-center text-gray-700 group-hover:text-red-600 transition-colors leading-tight line-clamp-1">
                    {marque.nom}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Aucune marque trouvée</p>
            </div>
          )}

          {/* Loader pour la pagination infinie */}
          {visibleCount < filteredMarques.length && (
            <div id="loader" className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* Statistiques minimales */}
          {filteredMarques.length > 0 && (
            <div className="mt-4 text-center text-xs text-gray-400">
              {visibleMarques.length} / {filteredMarques.length} marques
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Navigation>
  );
}