// src/pages/RechercheModele.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import api, { getImageUrl } from "../services/api";

// Icônes SVG personnalisées
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Reset: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Car: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Year: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Price: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Transmission: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
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
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function RechercheModele() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [modele, setModele] = useState(null);
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // Pour déboguer
  
  // État du formulaire
  const [filters, setFilters] = useState({
    annee_min: searchParams.get("annee_min") || "",
    annee_max: searchParams.get("annee_max") || "",
    prix_min: searchParams.get("prix_min") || "",
    prix_max: searchParams.get("prix_max") || "",
    transmission: searchParams.get("transmission") || "",
  });

  const modeleId = searchParams.get("modele");
  const resultsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!modeleId) {
        setError("Aucun modèle spécifié");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setAnimateResults(false);
        console.log("🔄 Chargement pour modèle ID:", modeleId);

        // Récupérer les infos du modèle
        const marquesResponse = await api.getMarques();
        console.log("📦 Marques reçues:", marquesResponse.data);
        
        let marquesData = [];
        if (Array.isArray(marquesResponse.data)) {
          marquesData = marquesResponse.data;
        } else if (marquesResponse.data && marquesResponse.data.results) {
          marquesData = marquesResponse.data.results;
        }
        
        let modeleData = null;
        let marqueTrouvee = null;
        
        for (const marque of marquesData) {
          try {
            const modelesResponse = await api.getModelesByMarque(marque.id);
            console.log(`📦 Modèles pour ${marque.nom}:`, modelesResponse.data);
            
            let modelesData = [];
            if (Array.isArray(modelesResponse.data)) {
              modelesData = modelesResponse.data;
            } else if (modelesResponse.data && modelesResponse.data.results) {
              modelesData = modelesResponse.data.results;
            }
            
            const found = modelesData.find(m => m.id === parseInt(modeleId));
            if (found) {
              modeleData = {
                ...found,
                marque_nom: marque.nom,
                marque_id: marque.id,
                marque_logo: marque.logo_url
              };
              marqueTrouvee = marque;
              break;
            }
          } catch (err) {
            console.error(`❌ Erreur pour marque ${marque.id}:`, err);
          }
        }

        if (!modeleData) {
          throw new Error("Modèle non trouvé");
        }

        console.log("✅ Modèle trouvé:", modeleData);
        setModele(modeleData);

        // Récupérer les voitures avec filtres
        const voituresResponse = await api.getVoituresByModele(modeleId, filters);
        console.log("✅ Voitures reçues:", voituresResponse.data);
        
        let voituresData = [];
        if (Array.isArray(voituresResponse.data)) {
          voituresData = voituresResponse.data;
        } else if (voituresResponse.data && voituresResponse.data.results) {
          voituresData = voituresResponse.data.results;
        }
        
        setVoitures(voituresData);
        
        // Animer les résultats après chargement
        setTimeout(() => setAnimateResults(true), 100);

      } catch (err) {
        console.error("❌ Erreur complète:", err);
        console.error("Message:", err.message);
        console.error("Response:", err.response);
        setApiResponse(err.response?.data || err.message);
        setError(err.message || "Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [modeleId, JSON.stringify(filters)]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("modele", modeleId);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
    
    // Scroll vers les résultats
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    setFilters({
      annee_min: "",
      annee_max: "",
      prix_min: "",
      prix_max: "",
      transmission: "",
    });
    const params = new URLSearchParams();
    params.set("modele", modeleId);
    setSearchParams(params);
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: "" }));
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    setSearchParams(params);
  };

  const formatPrix = (prix) => {
    if (!prix) return '0 BIF';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    return prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' BIF';
  };

  const handleGoBack = () => {
    if (modele?.marque_id) {
      navigate(`/modeles/${modele.marque_id}`);
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
            <p className="text-white mt-4 text-sm animate-pulse">Recherche en cours...</p>
          </div>
        </div>
      </Navigation>
    );
  }

  if (error || !modele) {
    return (
      <Navigation>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Icons.Close />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oups !</h2>
            <p className="text-gray-300 mb-4">{error || "Modèle non trouvé"}</p>
            
            {/* Afficher les infos de débogage */}
            {apiResponse && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg text-left">
                <p className="text-xs text-gray-400 mb-1">Détails:</p>
                <pre className="text-xs text-gray-300 overflow-auto max-h-32">
                  {typeof apiResponse === 'string' ? apiResponse : JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
            
            <button
              onClick={() => navigate('/marques')}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        
        {/* Éléments décoratifs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        {/* En-tête du modèle */}
        <div className="relative pt-24 pb-12 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
              <Icons.ArrowLeft />
              <span>Retour aux modèles</span>
            </button>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {modele.marque_logo && (
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <img
                    src={getImageUrl(modele.marque_logo)}
                    alt={modele.marque_nom}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">
                  {modele.marque_nom} {modele.nom}
                </h1>
                <p className="text-gray-400">
                  {voitures.length} véhicule{voitures.length > 1 ? 's' : ''} disponible{voitures.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Barre de filtres */}
          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 mb-4"
            >
              <Icons.Filter />
              <span>Filtres avancés</span>
              <span className={`ml-2 transform transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* Filtres actifs */}
            {Object.entries(filters).some(([_, v]) => v) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(filters)
                  .filter(([_, v]) => v)
                  .map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white"
                    >
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-semibold">{value}</span>
                      <button
                        onClick={() => removeFilter(key)}
                        className="ml-1 text-white/60 hover:text-white transition-colors"
                      >
                        <Icons.Close />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 animate-fadeInDown">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* Année min */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Année min</label>
                      <input
                        type="number"
                        name="annee_min"
                        value={filters.annee_min}
                        onChange={handleFilterChange}
                        placeholder="Ex: 2015"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Année max */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Année max</label>
                      <input
                        type="number"
                        name="annee_max"
                        value={filters.annee_max}
                        onChange={handleFilterChange}
                        placeholder="Ex: 2024"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Prix min */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Prix min (BIF)</label>
                      <input
                        type="number"
                        name="prix_min"
                        value={filters.prix_min}
                        onChange={handleFilterChange}
                        placeholder="Ex: 1000000"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Prix max */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Prix max (BIF)</label>
                      <input
                        type="number"
                        name="prix_max"
                        value={filters.prix_max}
                        onChange={handleFilterChange}
                        placeholder="Ex: 50000000"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Transmission */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Transmission</label>
                      <select
                        name="transmission"
                        value={filters.transmission}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                      >
                        <option value="">Toutes</option>
                        <option value="Manuelle">Manuelle</option>
                        <option value="Automatique">Automatique</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                    >
                      <Icons.Reset />
                      Réinitialiser
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <Icons.Search />
                      Appliquer les filtres
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div ref={resultsRef}>
            {voitures.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {voitures.map((voiture, index) => (
                    <Link
                      key={voiture.id}
                      to={`/voiture/${voiture.id}`}
                      className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 ${
                        animateResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {voiture.photo_url ? (
                          <img
                            src={getImageUrl(voiture.photo_url)}
                            alt={`${voiture.marque_nom} ${voiture.modele_nom}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Icons.Car />
                          </div>
                        )}
                        
                        {/* Badge disponibilité */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-green-600/90 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                          Disponible
                        </div>
                      </div>

                      {/* Infos */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                          {voiture.marque_nom} {voiture.modele_nom}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                          <span>{voiture.annee}</span>
                          <span>{voiture.transmission}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-400">
                            {formatPrix(voiture.prix)}
                          </span>
                          <span className="text-gray-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all">
                            <Icons.ArrowRight />
                          </span>
                        </div>

                        {voiture.kilometrage && (
                          <p className="text-xs text-gray-500 mt-2">
                            {voiture.kilometrage.toLocaleString()} km
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Nombre de résultats */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                  {voitures.length} résultat{voitures.length > 1 ? 's' : ''} trouvé{voitures.length > 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto border border-white/10">
                  <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <Icons.Search />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Aucun résultat</h2>
                  <p className="text-gray-400 mb-6">
                    Aucune voiture ne correspond à vos critères de recherche
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
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
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </Navigation>
  );
}