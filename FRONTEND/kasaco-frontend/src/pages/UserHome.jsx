// src/pages/UserHome.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import api, { getImageUrl } from "../services/api";
import Navigation from "../components/Navigation"; // Changé de UserNavbar à Navigation

// Import des images
import home1 from "../assets/images/home1.jpg";
import home2 from "../assets/images/home2.jpeg";
import home3 from "../assets/images/home3.jpeg";

// Icônes SVG personnalisées
const Icons = {
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
};

export default function UserHome() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [marques, setMarques] = useState([]);
  const [voituresPopulaires, setVoituresPopulaires] = useState([]);
  const [loading, setLoading] = useState({ marques: true, voitures: true });
  const [showItems, setShowItems] = useState({});
  const observerRef = useRef(null);

  const slides = [
    { id: 1, image: home1, title: "L'élégance sur route", subtitle: "Découvrez notre sélection de véhicules d'exception" },
    { id: 2, image: home2, title: "Performance et style", subtitle: "Des voitures qui allient puissance et design" },
    { id: 3, image: home3, title: "L'avenir de l'automobile", subtitle: "Innovation et technologie au service de votre confort" },
  ];

  const durations = [9000, 4000, 4000];

  // Slider automatique
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, durations[currentSlide]);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const marquesRes = await api.getMarques();
        setMarques(marquesRes.data?.results || marquesRes.data || []);
        
        const voituresRes = await api.getVoituresPopulaires(8);
        setVoituresPopulaires(voituresRes.data?.results || voituresRes.data || []);
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading({ marques: false, voitures: false });
      }
    };
    fetchData();
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
      { threshold: 0.15 }
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

  const LoadingSpinner = () => (
    <div className="flex justify-center py-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    </div>
  );

  return (
    <Navigation>
      <main className="overflow-hidden">
        {/* ================= HERO SECTION ================= */}
        <section className="relative h-[500px] sm:h-[600px] md:h-[750px] lg:h-[800px] overflow-hidden">
          {/* Slider */}
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover scale-105 animate-ken-burns"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          </div>

          {/* Contenu Hero */}
          <div className="relative z-10 h-full flex items-center container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 animate-fadeInUp">
                Roulez vers l'avenir avec{' '}
                <span className="bg-gradient-to-r from-red-500 to-indigo-500 bg-clip-text text-transparent">
                  KASACO
                </span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 animate-fadeInUp animation-delay-200">
                L'innovation au bout de vos roues.
              </p>
              <Link
                to="/marques"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 rounded-xl font-semibold hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-400"
              >
                <span>Découvrir nos voitures</span>
                <Icons.ArrowRight />
              </Link>
            </div>
          </div>

          {/* Indicateur de slide */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-8 bg-red-600' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* ================= MARQUES (CARTES PETITES) ================= */}
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
          className={`py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50
                     ${showItems.populaires ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Voitures les plus populaires</h2>

            {loading.voitures ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {voituresPopulaires.length > 0 ? (
                  voituresPopulaires.map((voiture, index) => (
                    <Link
                      key={voiture.id}
                      to={`/voiture/${voiture.id}`}
                      data-animate="item"
                      data-id={`voiture-${voiture.id}`}
                      className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                        showItems[`voiture-${voiture.id}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-32 overflow-hidden rounded-t-xl bg-gray-200">
                        <img
                          src={getImageUrl(voiture.photo_url) || "https://via.placeholder.com/300x200"}
                          alt={voiture.modele_nom}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          <Icons.Star />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-red-600">
                          {voiture.marque_nom} {voiture.modele_nom}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{voiture.annee} • {voiture.transmission}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-green-600">
                            {voiture.prix?.toLocaleString()} {voiture.devise || 'BIF'}
                          </span>
                          <span className="text-red-600 group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">Aucune voiture disponible</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </Navigation>
  );
}