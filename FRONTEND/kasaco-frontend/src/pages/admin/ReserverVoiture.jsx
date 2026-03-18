// src/pages/admin/ReserverVoiture.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond
import hondaBg from "../../assets/images/honda.jpg";

// Icônes SVG personnalisées
const Icons = {
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
};

export default function ReserverVoiture() {
  const { voitureId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [voiture, setVoiture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [animateCard, setAnimateCard] = useState(false);

  // Charger les détails de la voiture
  useEffect(() => {
    if (voitureId) {
      chargerVoiture();
    }
    // Animation d'entrée
    setTimeout(() => setAnimateCard(true), 100);
  }, [voitureId]);

  const chargerVoiture = async () => {
    try {
      setLoading(true);
      const response = await api.getVoitureById(voitureId);
      console.log("📦 Voiture chargée:", response.data);
      
      // Vérifier si la voiture est disponible
      if (response.data.etat !== 'Disponible') {
        setMessage({ 
          type: 'error', 
          text: 'Cette voiture n\'est pas disponible à la réservation' 
        });
      }
      
      setVoiture(response.data);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ 
        type: 'error', 
        text: 'Impossible de charger les détails de la voiture' 
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== FONCTION DE FORMATAGE DES PRIX =====
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
        return `${formatted} BIF`;  // Format avec espace avant BIF
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que l'utilisateur est connecté
    if (!user || !user.id) {
      setMessage({ 
        type: 'error', 
        text: 'Vous devez être connecté pour effectuer une réservation' 
      });
      return;
    }

    // Vérifier que la voiture est toujours disponible
    if (voiture?.etat !== 'Disponible') {
      setMessage({ 
        type: 'error', 
        text: 'Cette voiture n\'est plus disponible' 
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Préparer les données avec les deux champs requis
      const reservationData = {
        voiture: parseInt(voitureId),
        utilisateur: user.id
      };
      
      console.log("📤 Envoi réservation:", reservationData);
      
      // Appel API
      const response = await api.createReservation(reservationData);
      console.log("✅ Réponse:", response.data);
      
      setMessage({ 
        type: 'success', 
        text: 'Réservation effectuée avec succès !' 
      });
      
      // Mettre à jour l'état local de la voiture
      setVoiture(prev => ({
        ...prev,
        etat: 'Réservée'
      }));
      
      // Émettre un événement pour informer les autres composants
      window.dispatchEvent(new CustomEvent('reservation-effectuee', { 
        detail: { voitureId: parseInt(voitureId) } 
      }));
      
      // Émettre aussi un événement de mise à jour de l'état
      window.dispatchEvent(new CustomEvent('voiture-etat-change', { 
        detail: { 
          voitureId: parseInt(voitureId),
          nouvelEtat: 'Réservée'
        } 
      }));
      
      // Rediriger vers la liste des voitures après 2 secondes
      setTimeout(() => {
        navigate('/admin/voitures');
      }, 2000);
      
    } catch (error) {
      console.error("❌ Erreur complète:", error);
      
      let errorMessage = 'Erreur lors de la réservation';
      
      if (error.response?.data) {
        if (error.response.data.voiture) {
          errorMessage = `Voiture: ${error.response.data.voiture.join(', ')}`;
        } else if (error.response.data.utilisateur) {
          errorMessage = `Utilisateur: ${error.response.data.utilisateur.join(', ')}`;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join(', ');
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <p className="text-white mt-4 text-sm animate-pulse">Chargement des informations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!voiture) {
    return (
      <div className="min-h-screen bg-gray-900">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-red-500/20">
            <Icons.Car />
            <p className="text-white mt-4">Voiture non trouvée</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      
      {/* Message de notification animé */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl animate-slideIn ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {message.type === 'success' ? <Icons.Check /> : <Icons.Close />}
            </div>
            <span className="font-medium">{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-4 text-white/80 hover:text-white transition-transform hover:scale-110"
            >
              <Icons.Close />
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
        
        {/* Background avec overlay */}
        <div className="fixed inset-0 -z-10">
          <img 
            src={hondaBg} 
            alt="Background" 
            className="w-full h-full object-cover blur-sm brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-900/95"></div>
        </div>

        {/* Éléments décoratifs animés */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        {/* Carte Réservation */}
        <div 
          className={`relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md md:max-w-xl transition-all duration-700 transform ${
            animateCard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          
          {/* Badge décoratif */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
              <i className="fa-solid fa-calendar-check mr-1"></i>
              Nouvelle réservation
            </div>
          </div>
          
          {/* Titre avec icône */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:rotate-6 transition-transform duration-300">
              <Icons.Calendar />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Réserver la voiture
            </h2>
            <p className="text-gray-500 text-sm mt-1">Confirmez votre réservation</p>
          </div>

          {/* Carte voiture sélectionnée */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Icons.Car />
              </div>
              <span className="text-blue-600 font-medium">Véhicule sélectionné</span>
            </div>
            
            <div className="text-center">
              {/* NOM DE LA VOITURE EN GRAND */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {voiture?.marque_nom} {voiture?.modele_nom}
              </h3>
              
              {/* Détails supplémentaires */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/80 rounded-lg p-2">
                  <div className="text-xs text-gray-500">Année</div>
                  <div className="font-semibold text-gray-800">{voiture?.annee}</div>
                </div>
                <div className="bg-white/80 rounded-lg p-2">
                  <div className="text-xs text-gray-500">Prix</div>
                  <div className="font-semibold text-green-600">
                    {formatPrix(voiture?.prix, voiture?.devise)}
                  </div>
                </div>
                <div className="bg-white/80 rounded-lg p-2">
                  <div className="text-xs text-gray-500">État</div>
                  <div className={`font-semibold ${
                    voiture?.etat === 'Disponible' ? 'text-green-600' : 
                    voiture?.etat === 'Réservée' ? 'text-orange-500' : 'text-red-600'
                  }`}>
                    {voiture?.etat}
                  </div>
                </div>
              </div>

              {/* Châssis et moteur en petits caractères */}
              <div className="mt-3 text-xs text-gray-400">
                <p>Châssis: {voiture?.numero_chassis}</p>
                <p>Moteur: {voiture?.numero_moteur}</p>
              </div>
            </div>
          </div>

          {/* Carte utilisateur */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icons.User />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Client</p>
                <p className="font-semibold text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Icons.Check />
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Message d'information avec animation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center animate-pulse-slow">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Icons.Info />
                <span className="text-sm font-medium">
                  Vous êtes sur le point de réserver <span className="font-bold">{voiture?.marque_nom} {voiture?.modele_nom}</span>
                </span>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={submitting || voiture?.etat !== 'Disponible'}
              className="relative w-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:group-hover:scale-100">
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Réservation en cours...</span>
                  </>
                ) : voiture?.etat !== 'Disponible' ? (
                  <>
                    <Icons.Close />
                    <span>Véhicule non disponible</span>
                  </>
                ) : (
                  <>
                    <Icons.Check />
                    <span>Confirmer la réservation de {voiture?.marque_nom} {voiture?.modele_nom}</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Bouton retour */}
          <div className="mt-8 text-center">
            <Link
              to="/admin/voitures"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">
                <Icons.ArrowLeft />
              </span>
              <span>Retour à la liste</span>
            </Link>
          </div>

          {/* Message de confiance */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="text-gray-500 hover:text-blue-600 transition-colors">
                <div className="text-lg mb-1">🔒</div>
                <div className="text-[10px]">Paiement sécurisé</div>
              </div>
              <div className="text-gray-500 hover:text-blue-600 transition-colors">
                <div className="text-lg mb-1">🚘</div>
                <div className="text-[10px]">Véhicules vérifiés</div>
              </div>
              <div className="text-gray-500 hover:text-blue-600 transition-colors">
                <div className="text-lg mb-1">📞</div>
                <div className="text-[10px]">Support 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
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

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}