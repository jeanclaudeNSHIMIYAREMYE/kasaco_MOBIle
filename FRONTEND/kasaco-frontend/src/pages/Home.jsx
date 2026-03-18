// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import api, { getImageUrl } from "../services/api";

// Import des images
import home1 from "../assets/images/home1.jpg";
import home2 from "../assets/images/home2.jpeg";
import home3 from "../assets/images/home3.jpeg";

// Icônes SVG personnalisées
const Icons = {
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Star: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Car: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [marques, setMarques] = useState([]);
  const [voituresPopulaires, setVoituresPopulaires] = useState([]);
  const [loading, setLoading] = useState({
    marques: true,
    voitures: true
  });
  const [error, setError] = useState({
    marques: null,
    voitures: null
  });
  const [showItems, setShowItems] = useState({});
  const [stats, setStats] = useState({
    clients: 1500,
    voitures: 320,
    annees: 10
  });
  
  const observerRef = useRef(null);
  const heroRef = useRef(null);

  const slides = [
    { id: 1, image: home1, alt: "Voiture de luxe 1", title: "L'élégance sur route", subtitle: "Découvrez notre sélection de véhicules d'exception" },
    { id: 2, image: home2, alt: "Voiture de luxe 2", title: "Performance et style", subtitle: "Des voitures qui allient puissance et design" },
    { id: 3, image: home3, alt: "Voiture de luxe 3", title: "L'avenir de l'automobile", subtitle: "Innovation et technologie au service de votre confort" },
  ];

  const durations = [9000, 4000, 4000];

  // ========== FONCTION DE FORMATAGE DES PRIX ==========
  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'Prix non disponible';
    
    // Convertir en nombre
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    
    // Vérifier si c'est un nombre valide
    if (isNaN(prixNumber)) return 'Prix non disponible';
    
    // Formater le nombre avec séparateurs de milliers et 2 décimales
    const formatted = prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Déterminer le format selon la devise
    switch(devise?.toUpperCase()) {
      case 'USD':
        return `$ ${formatted}`;
      case 'EUR':
        return `€ ${formatted}`;
      case 'BIF':
      default:
        return `${formatted} BIF`;  // ← Format avec espace avant BIF
    }
  };

  // ========== SLIDER AUTOMATIQUE ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, durations[currentSlide]);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  // ========== CHARGEMENT DES DONNÉES API ==========
  useEffect(() => {
    const fetchMarques = async () => {
      try {
        setLoading(prev => ({ ...prev, marques: true }));
        console.log("🔄 Chargement des marques...");
        const response = await api.getMarques();
        
        if (response.data && response.data.results) {
          setMarques(response.data.results);
        } else if (Array.isArray(response.data)) {
          setMarques(response.data);
        } else {
          setMarques(response.data || []);
        }
        
        setError(prev => ({ ...prev, marques: null }));
      } catch (err) {
        console.error("❌ Erreur chargement marques:", err);
        setError(prev => ({ ...prev, marques: "Impossible de charger les marques" }));
      } finally {
        setLoading(prev => ({ ...prev, marques: false }));
      }
    };

    const fetchVoituresPopulaires = async () => {
      try {
        setLoading(prev => ({ ...prev, voitures: true }));
        console.log("🔄 Chargement des voitures populaires...");
        const response = await api.getVoituresPopulaires(8);
        
        if (response.data && response.data.results) {
          setVoituresPopulaires(response.data.results);
        } else if (Array.isArray(response.data)) {
          setVoituresPopulaires(response.data);
        } else {
          setVoituresPopulaires(response.data || []);
        }
        
        setError(prev => ({ ...prev, voitures: null }));
      } catch (err) {
        console.error("❌ Erreur chargement voitures:", err);
        setError(prev => ({ ...prev, voitures: "Impossible de charger les voitures" }));
      } finally {
        setLoading(prev => ({ ...prev, voitures: false }));
      }
    };

    fetchMarques();
    fetchVoituresPopulaires();

    setTimeout(() => {
      setStats({
        clients: 1524,
        voitures: 328,
        annees: 12
      });
    }, 1500);
  }, []);

  // ========== ACTIVER TOUS LES ITEMS APRÈS CHARGEMENT ==========
  useEffect(() => {
    if (!loading.marques && !loading.voitures) {
      setShowItems(prev => ({ ...prev, marques: true, populaires: true }));
      
      marques.forEach(marque => {
        setShowItems(prev => ({ ...prev, [`marque-${marque.id}`]: true }));
      });
      
      voituresPopulaires.forEach(voiture => {
        setShowItems(prev => ({ ...prev, [`voiture-${voiture.id}`]: true }));
      });
    }
  }, [loading.marques, loading.voitures, marques, voituresPopulaires]);

  // ========== INTERSECTION OBSERVER ==========
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowItems((prev) => ({ ...prev, [entry.target.dataset.id]: true }));
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      setTimeout(() => {
        document.querySelectorAll("[data-animate]").forEach((el) => {
          observerRef.current.observe(el);
        });
      }, 100);
    }
  }, [marques, voituresPopulaires]);

  // ========== COMPOSANTS UTILITAIRES ==========
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    </div>
  );

  const ErrorMessage = ({ message }) => (
    <div className="text-center py-4">
      <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );

  return (
    <Navigation>
      <main className="overflow-hidden">
        {/* ================= HERO SECTION ================= */}
        <section ref={heroRef} className="relative h-screen max-h-[900px] min-h-[600px] overflow-hidden">
          {/* SLIDER BACKGROUND */}
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center scale-105 animate-ken-burns"
                />
              </div>
            ))}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] opacity-40"></div>
          </div>

          {/* HERO CONTENT */}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-4 border border-white/20 animate-fadeInUp">
                <Icons.Shield />
                <span className="text-xs font-medium">Concessionnaire agréé depuis 2014</span>
              </div>

              {/* Titre */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 leading-tight">
                <span className="block animate-fadeInUp animation-delay-200">Roulez vers</span>
                <span className="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-fadeInUp animation-delay-400">
                  l'avenir avec KASACO
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 max-w-2xl animate-fadeInUp animation-delay-600">
                Découvrez notre sélection exceptionnelle de véhicules neufs et d'occasion.
              </p>

              {/* Bouton */}
              <Link
                to="/marques"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fadeInUp animation-delay-800"
              >
                <span>Découvrir nos marques</span>
                <Icons.ArrowRight />
              </Link>

              {/* Statistiques */}
              <div className="flex flex-wrap gap-6 mt-8 animate-fadeInUp animation-delay-1000">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.clients}+</div>
                  <div className="text-xs text-gray-300">Clients satisfaits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.voitures}</div>
                  <div className="text-xs text-gray-300">Véhicules disponibles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.annees}+</div>
                  <div className="text-xs text-gray-300">Années d'expérience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-5 h-9 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll"></div>
            </div>
          </div>
        </section>

        {/* ================= SECTION MARQUES ================= */}
        <section
          data-animate="section"
          data-id="marques"
          className={`py-10 bg-gradient-to-b from-white via-gray-50 to-white transition-all duration-800
                     ${showItems.marques ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Nos marques partenaires
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Découvrez les plus grandes marques automobiles
              </p>
            </div>

            {loading.marques ? (
              <LoadingSpinner />
            ) : error.marques ? (
              <ErrorMessage message={error.marques} />
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 px-2">
                {marques && marques.length > 0 ? (
                  marques.map((marque, index) => (
                    <Link
                      key={marque.id}
                      to={`/modeles/${marque.id}`}
                      data-animate="item"
                      data-id={`marque-${marque.id}`}
                      className={`group flex flex-col items-center justify-center
                                 bg-white rounded-lg p-2 shadow-sm hover:shadow-md
                                 transition-all duration-300 hover:-translate-y-1
                                 ${showItems[`marque-${marque.id}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                      style={{ transitionDelay: `${index * 30}ms` }}
                    >
                      {marque.logo_url ? (
                        <img
                          src={getImageUrl(marque.logo_url)}
                          alt={marque.nom}
                          className="h-8 w-8 object-contain mb-1 transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const parent = e.target.parentElement;
                            if (parent) {
                              const fallback = document.createElement("div");
                              fallback.className = "h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mb-1";
                              fallback.textContent = marque.nom?.charAt(0) || "?";
                              parent.insertBefore(fallback, e.target);
                              e.target.remove();
                            }
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold mb-1">
                          {marque.nom?.charAt(0) || "?"}
                        </div>
                      )}

                      <span className="text-[10px] text-center text-gray-700 group-hover:text-red-600 transition-colors leading-tight">
                        {marque.nom}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-4">
                    Aucune marque disponible
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================= VOITURES POPULAIRES ================= */}
        <section
          data-animate="section"
          data-id="populaires"
          className={`relative py-16 overflow-hidden
                     bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                     ${showItems.populaires ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Éléments décoratifs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Voitures les plus populaires
              </h2>
              <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                Découvrez les véhicules les plus appréciés de notre catalogue
              </p>
            </div>

            {loading.voitures ? (
              <LoadingSpinner />
            ) : error.voitures ? (
              <ErrorMessage message={error.voitures} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {voituresPopulaires.length > 0 ? (
                  voituresPopulaires.map((voiture, index) => (
                    <Link
                      key={voiture.id}
                      to={`/voiture/${voiture.id}`}
                      data-animate="item"
                      data-id={`voiture-${voiture.id}`}
                      className={`group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1
                                ${showItems[`voiture-${voiture.id}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {/* Badge populaire */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                          <Icons.Star />
                          <span>Populaire</span>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative h-36 overflow-hidden bg-gray-200">
                        <img
                          src={getImageUrl(voiture.photo_url) || "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop"}
                          alt={voiture.modele_nom || "Voiture"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Infos */}
                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors">
                          {voiture.marque_nom} {voiture.modele_nom}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">{voiture.annee}</span>
                          <span className="text-xs text-gray-500">{voiture.transmission}</span>
                        </div>

                        {/* Pays où se trouve la voiture */}
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs text-gray-400">📍</span>
                          <span className="text-xs font-medium text-gray-600">
                            {voiture.pays_display || voiture.pays || 'Burundi'}
                          </span>
                        </div>

                        {/* ID de la voiture formaté */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">ID:</span>
                          <span className="text-xs font-mono font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                            A2E{voiture.id}
                          </span>
                        </div>

                        {/* Prix formaté avec fonction formatPrix */}
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-green-600">
                            {formatPrix(voiture.prix, voiture.devise)}
                          </span>
                          
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 group-hover:gap-2 transition-all">
                            Détails
                            <Icons.ArrowRight />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-400 text-sm">Aucune voiture disponible</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================= SECTION AVANTAGES ================= */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icons.Shield />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Garantie prolongée</h3>
                <p className="text-xs text-gray-600">Tous nos véhicules bénéficient d'une garantie</p>
              </div>

              <div className="text-center p-4 rounded-xl hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icons.Clock />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Service rapide</h3>
                <p className="text-xs text-gray-600">Traitement en 24h et livraison express</p>
              </div>

              <div className="text-center p-4 rounded-xl hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icons.Check />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Véhicules certifiés</h3>
                <p className="text-xs text-gray-600">Inspection par nos experts avant vente</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= STYLES CSS ================= */}
        <style>{`
          @keyframes ken-burns {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
          }
          .animate-ken-burns {
            animation: ken-burns 20s ease-out forwards;
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
            animation: fadeInUp 0.8s ease-out forwards;
          }

          @keyframes scroll {
            0% { transform: translateY(0); opacity: 1; }
            75% { transform: translateY(6px); opacity: 0.5; }
            100% { transform: translateY(8px); opacity: 0; }
          }
          .animate-scroll {
            animation: scroll 2s infinite;
          }

          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }

          .animation-delay-200 {
            animation-delay: 200ms;
          }
          .animation-delay-400 {
            animation-delay: 400ms;
          }
          .animation-delay-600 {
            animation-delay: 600ms;
          }
          .animation-delay-800 {
            animation-delay: 800ms;
          }
          .animation-delay-1000 {
            animation-delay: 1000ms;
          }
          .animation-delay-2000 {
            animation-delay: 2000ms;
          }

          .duration-800 {
            transition-duration: 800ms;
          }
        `}</style>
      </main>
    </Navigation>
  );
}