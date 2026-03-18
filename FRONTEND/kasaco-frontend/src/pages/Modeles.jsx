// src/pages/Modeles.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import api, { getImageUrl } from "../services/api";

// Image par défaut
import defaultCarImage from "../assets/images/default-car.jpg";

// Icônes SVG personnalisées
const Icons = {
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

export default function Modeles() {
  const { marqueId } = useParams();
  const navigate = useNavigate();
  const [marque, setMarque] = useState(null);
  const [modeles, setModeles] = useState([]);
  const [groupedModeles, setGroupedModeles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null); // Pour déboguer
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [animateItems, setAnimateItems] = useState(false);
  const [selectedLettre, setSelectedLettre] = useState(null);
  
  const observerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Chargement des données pour marque ID:", marqueId);
        
        // 1. Récupérer les modèles de la marque
        const modelesResponse = await api.getModelesByMarque(marqueId);
        console.log("✅ Modèles reçus:", modelesResponse.data);
        
        // Sauvegarder la réponse pour déboguer
        setApiResponse(modelesResponse.data);
        
        // Gérer différents formats de données
        let modelesData = [];
        if (Array.isArray(modelesResponse.data)) {
          modelesData = modelesResponse.data;
        } else if (modelesResponse.data && modelesResponse.data.results) {
          modelesData = modelesResponse.data.results;
        } else if (modelesResponse.data && typeof modelesResponse.data === 'object') {
          // Chercher un tableau dans l'objet
          const possibleArrays = Object.values(modelesResponse.data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            modelesData = possibleArrays[0];
          }
        }
        
        setModeles(modelesData);
        
        // 2. Récupérer les infos de la marque
        const marqueResponse = await api.getMarques();
        console.log("✅ Marques reçues:", marqueResponse.data);
        
        let marquesData = [];
        if (Array.isArray(marqueResponse.data)) {
          marquesData = marqueResponse.data;
        } else if (marqueResponse.data && marqueResponse.data.results) {
          marquesData = marqueResponse.data.results;
        }
        
        const marqueData = marquesData.find(m => m.id === parseInt(marqueId));
        console.log("✅ Marque trouvée:", marqueData);
        setMarque(marqueData);
        
        // 3. Grouper les modèles par première lettre
        const grouped = {};
        modelesData.forEach((modele) => {
          if (modele.nom) {
            const firstLetter = modele.nom.charAt(0).toUpperCase();
            if (!grouped[firstLetter]) {
              grouped[firstLetter] = [];
            }
            grouped[firstLetter].push(modele);
          }
        });
        
        // Trier les lettres et les modèles
        const sortedGrouped = {};
        Object.keys(grouped)
          .sort()
          .forEach((letter) => {
            sortedGrouped[letter] = grouped[letter].sort((a, b) => 
              a.nom.localeCompare(b.nom)
            );
          });
        
        setGroupedModeles(sortedGrouped);
        setError(null);
        
        // Activer les animations après chargement
        setTimeout(() => setAnimateItems(true), 100);
        
      } catch (err) {
        console.error("❌ Erreur détaillée:", err);
        console.error("Message:", err.message);
        console.error("Response:", err.response);
        
        // Message d'erreur plus précis
        let errorMessage = "Impossible de charger les modèles";
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = "Marque non trouvée";
          } else if (err.response.status === 500) {
            errorMessage = "Erreur serveur";
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (marqueId) {
      fetchData();
    } else {
      setError("ID de marque manquant");
      setLoading(false);
    }
  }, [marqueId]);

  // Filtrer les modèles par recherche
  const getFilteredGroupedModeles = () => {
    if (!searchTerm) return groupedModeles;
    
    const filtered = {};
    Object.entries(groupedModeles).forEach(([lettre, modelesList]) => {
      const filteredModeles = modelesList.filter(modele =>
        modele.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredModeles.length > 0) {
        filtered[lettre] = filteredModeles;
      }
    });
    return filtered;
  };

  const filteredGrouped = getFilteredGroupedModeles();
  const hasModeles = Object.keys(filteredGrouped).length > 0;

  // Observer pour les animations au scroll
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      document.querySelectorAll(".fade-up").forEach((el) => {
        observerRef.current.observe(el);
      });
    }
  }, [filteredGrouped, viewMode]);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/marques');
    }
  };

  if (loading) {
    return (
      <Navigation>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
            </div>
            <p className="text-white mt-4 text-sm animate-pulse">Chargement des modèles...</p>
          </div>
        </div>
      </Navigation>
    );
  }

  if (error) {
    return (
      <Navigation>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oups !</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            
            {/* Afficher les infos de débogage si disponibles */}
            {apiResponse && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg text-left">
                <p className="text-xs text-gray-400 mb-1">Réponse API:</p>
                <pre className="text-xs text-gray-300 overflow-auto max-h-32">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
            
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
            >
              <Icons.ArrowLeft />
              Retour aux marques
            </button>
          </div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        
        {/* Bannière de la marque */}
        <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>
          
          <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
            {marque?.logo_url && (
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4 border-2 border-white/30 animate-float">
                <img
                  src={getImageUrl(marque.logo_url)}
                  alt={marque.nom}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-center">
              {marque?.nom || "Modèles disponibles"}
            </h1>
          
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Barre d'outils */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 fade-up">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-x-1 group"
            >
              <Icons.ArrowLeft />
              <span>Retour</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Recherche */}
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher un modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Icons.Search />
                </div>
              </div>

              {/* Changement de vue */}
              <div className="flex bg-white rounded-xl shadow-md p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icons.Grid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icons.List />
                </button>
              </div>
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchTerm && (
            <div className="mb-6 text-gray-600">
              {hasModeles ? (
                <p>{Object.values(filteredGrouped).flat().length} résultat(s) pour "{searchTerm}"</p>
              ) : (
                <p>Aucun résultat pour "{searchTerm}"</p>
              )}
            </div>
          )}

          {/* MODÈLES GROUPÉS */}
          {hasModeles ? (
            Object.entries(filteredGrouped).map(([lettre, modelesList], index) => (
              <div
                key={lettre}
                id={`section-${lettre}`}
                className={`mb-12 transform transition-all duration-700 ${
                  animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {lettre}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Modèles commençant par {lettre}</h2>
                </div>

                {/* Vue Grille */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {modelesList.map((modele, idx) => (
                      <Link
                        key={modele.id}
                        to={`/recherche?modele=${modele.id}`}
                        className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                      >
                        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                          {modele.photo_url ? (
                            <img
                              src={getImageUrl(modele.photo_url)}
                              alt={modele.nom}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : modele.image_url ? (
                            <img
                              src={getImageUrl(modele.image_url)}
                              alt={modele.nom}
                              className="w-full h-full object-contain p-4"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <Icons.Car />
                            </div>
                          )}
                          
                          {modele.nb_voitures > 0 && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                              {modele.nb_voitures}
                            </div>
                          )}
                        </div>

                        <div className="p-3 text-center">
                          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-red-600 transition-colors">
                            {modele.nom}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {modele.nb_voitures || 0} voiture{modele.nb_voitures > 1 ? 's' : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Vue Liste */}
                {viewMode === "list" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {modelesList.map((modele, idx) => (
                      <Link
                        key={modele.id}
                        to={`/recherche?modele=${modele.id}`}
                        className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-indigo-50 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                            {modele.photo_url || modele.image_url ? (
                              <img
                                src={getImageUrl(modele.photo_url || modele.image_url)}
                                alt={modele.nom}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Icons.Car />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                              {modele.nom}
                            </h3>
                           
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-semibold ${
                            modele.nb_voitures > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {modele.nb_voitures || 0} véhicule{modele.nb_voitures > 1 ? 's' : ''}
                          </span>
                          <Icons.ArrowRight />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md mx-auto border border-gray-200">
                <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <Icons.Car />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {searchTerm ? "Aucun résultat" : "Aucun modèle disponible"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `Aucun modèle ne correspond à "${searchTerm}"`
                    : "Cette marque ne propose pas encore de modèles"}
                </p>
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                  >
                    Effacer la recherche
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/marques')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                  >
                    <Icons.ArrowLeft />
                    Retour aux marques
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-up.show {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </Navigation>
  );
}