// src/pages/VoitureDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import api, { getImageUrl } from "../services/api";

// Image par défaut
import defaultCarImage from "../assets/images/default-car.jpg";

// Icônes SVG personnalisées
const Icons = {
  WhatsApp: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Price: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Gauge: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Engine: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Color: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  Chassis: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
};

export default function VoitureDetail() {
  const { voitureId } = useParams();
  const [voiture, setVoiture] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setAnimateCard(true), 100);
    
    const fetchVoiture = async () => {
      try {
        setLoading(true);
        console.log("🔄 Chargement voiture ID:", voitureId);
        
        const response = await api.getVoitureDetail(voitureId);
        console.log("✅ Voiture reçue:", response.data);
        
        setVoiture(response.data);
        
        // Construire le tableau d'images
        const allImages = [];
        if (response.data.photo_url) {
          allImages.push(getImageUrl(response.data.photo_url));
        }
        if (response.data.images && response.data.images.length > 0) {
          response.data.images.forEach(img => {
            if (img.image_url) {
              allImages.push(getImageUrl(img.image_url));
            }
          });
        }
        setImages(allImages);
        
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError("Impossible de charger les détails de la voiture");
      } finally {
        setLoading(false);
      }
    };

    if (voitureId) {
      fetchVoiture();
    }
  }, [voitureId]);

  const setImage = (index) => {
    if (images.length === 0) return;
    setCurrentIndex(index);
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix) return '0 BIF';
    
    // Formater avec séparateurs de milliers
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    const formatted = prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    let symbole = '';
    if (devise === 'USD') symbole = '$';
    else if (devise === 'EUR') symbole = '€';
    else symbole = 'FBu';
    
    return `${formatted} ${symbole}`;
  };

  const getEtatBadge = (etat) => {
    switch(etat?.toLowerCase()) {
      case 'disponible':
        return (
          <span className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Disponible
          </span>
        );
      case 'réservée':
        return (
          <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Réservée
          </span>
        );
      case 'vendue':
        return (
          <span className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-sm font-semibold shadow-lg">
            Vendue
          </span>
        );
      default:
        return (
          <span className="px-4 py-1.5 bg-gray-600 text-white rounded-full text-sm font-semibold shadow-lg">
            {etat}
          </span>
        );
    }
  };

  const getWhatsAppLink = () => {
    if (!voiture) return '#';
    const message = `Bonjour, je suis intéressé par ${voiture.marque_nom || ''} ${voiture.modele_nom || ''} (ID: A2E${voiture.id}) au prix de ${formatPrix(voiture.prix, voiture.devise)}. Pourriez-vous me donner plus d'informations ?`;
    return `https://wa.me/25769080278?text=${encodeURIComponent(message)}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${voiture.marque_nom} ${voiture.modele_nom}`,
        text: `Découvrez cette magnifique voiture sur KASACO`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lien copié dans le presse-papier !');
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
            <p className="text-white mt-4 text-sm animate-pulse">Chargement des informations...</p>
          </div>
        </div>
      </Navigation>
    );
  }

  if (error || !voiture) {
    return (
      <Navigation>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md text-center border border-white/20">
            <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oups !</h2>
            <p className="text-gray-300 mb-6">{error || "Voiture non trouvée"}</p>
            <Link
              to="/marques"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
            >
              <Icons.ArrowLeft />
              Retour aux marques
            </Link>
          </div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
        
        {/* Éléments décoratifs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 animate-fadeInDown">
            <Link to="/" className="hover:text-red-500 transition-colors">Accueil</Link>
            <span>/</span>
            <Link to="/marques" className="hover:text-red-500 transition-colors">Marques</Link>
            <span>/</span>
            <Link to={`/modeles/${voiture.modele?.id}`} className="hover:text-red-500 transition-colors">
              {voiture.marque_nom}
            </Link>
            <span>/</span>
            <span className="text-white">{voiture.modele_nom}</span>
          </nav>

          {/* Bouton retour mobile */}
          <Link
            to={`/modeles/${voiture.modele?.id}`}
            className="md:hidden inline-flex items-center gap-2 text-white mb-4 hover:text-red-500 transition-colors"
          >
            <Icons.ArrowLeft />
            Retour
          </Link>

          {/* En-tête avec actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2">
                {voiture.marque_nom} {voiture.modele_nom}
              </h1>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1">
                  <Icons.Calendar />
                  {voiture.annee}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <Icons.Gauge />
                  {voiture.kilometrage?.toLocaleString()} km
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Badge état */}
              {getEtatBadge(voiture.etat)}
              
              {/* Bouton partage */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
                >
                  <Icons.Share />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 py-2 z-50 animate-fadeInDown">
                    <button
                      onClick={copyToClipboard}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                    >
                      📋 Copier le lien
                    </button>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                    >
                      📘 Partager sur Facebook
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=Découvrez%20cette%20voiture%20sur%20KASACO&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                    >
                      🐦 Partager sur Twitter
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte principale */}
          <div className={`bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 transform transition-all duration-700 ${
            animateCard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}>
            <div className="flex flex-col lg:flex-row gap-8">

              {/* SECTION IMAGE */}
              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 aspect-[4/3]">
                  {/* Image principale */}
                  <img
                    src={images[currentIndex] || defaultCarImage}
                    alt={`${voiture.marque_nom} ${voiture.modele_nom}`}
                    className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultCarImage;
                    }}
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

                  {/* ID badge */}
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white text-sm font-mono">
                    A2E{voiture.id}
                  </div>

                  {/* Navigation flèches */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 transition-all duration-300"
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 transition-all duration-300"
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Miniatures */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                          currentIndex === index ? 'border-red-500 scale-105' : 'border-white/20'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Miniature ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultCarImage;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* INFORMATIONS */}
              <div className="flex-1 space-y-6">
                
                {/* Prix et actions rapides */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Prix</span>
                    <span className="text-3xl font-bold text-green-400">
                      {formatPrix(voiture.prix, voiture.devise)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Icons.WhatsApp />
                      <span>WhatsApp</span>
                    </a>
                    
                    <Link
                      to={`/reserver/${voiture.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    >
                      <Icons.Car />
                      <span>Réserver</span>
                    </Link>
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Caractéristiques</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Transmission</p>
                      <p className="text-white font-semibold">{voiture.transmission}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Cylindrée</p>
                      <p className="text-white font-semibold">{voiture.cylindree_cc} CC</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Couleur</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: voiture.couleur?.toLowerCase() || '#000' }}
                        ></span>
                        <span className="text-white font-semibold">{voiture.couleur}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Kilométrage</p>
                      <p className="text-white font-semibold">{voiture.kilometrage?.toLocaleString()} km</p>
                    </div>
                  </div>
                </div>

                {/* Identification */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Identification</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Numéro de châssis</p>
                      <p className="font-mono text-white bg-black/30 p-2 rounded-lg text-sm break-all">
                        {voiture.numero_chassis}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Numéro moteur</p>
                      <p className="font-mono text-white bg-black/30 p-2 rounded-lg text-sm break-all">
                        {voiture.numero_moteur}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          animation: fadeInDown 0.6s ease-out forwards;
        }
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

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />
    </Navigation>
  );
}