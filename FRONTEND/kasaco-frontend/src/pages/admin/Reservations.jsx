// src/pages/admin/Reservations.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function AdminReservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voituresDisponibles, setVoituresDisponibles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtat, setFilterEtat] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    reservees: 0
  });

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

  // Écouter les événements de réservation
  useEffect(() => {
    const handleReservation = () => {
      console.log("🔄 Réservation détectée, rechargement des réservations");
      setRefreshKey(prev => prev + 1);
    };

    const handleVoitureEtatChange = (event) => {
      console.log("🔄 Changement d'état détecté:", event.detail);
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('reservation-effectuee', handleReservation);
    window.addEventListener('voiture-etat-change', handleVoitureEtatChange);
    
    return () => {
      window.removeEventListener('reservation-effectuee', handleReservation);
      window.removeEventListener('voiture-etat-change', handleVoitureEtatChange);
    };
  }, []);

  // Charger les données
  useEffect(() => {
    chargerDonnees();
  }, [refreshKey]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les voitures
      const voituresResponse = await api.getVoituresAdmin();
      console.log("📦 Voitures reçues:", voituresResponse.data);
      
      let toutesVoitures = [];
      if (voituresResponse.data?.results) {
        toutesVoitures = voituresResponse.data.results;
      } else if (Array.isArray(voituresResponse.data)) {
        toutesVoitures = voituresResponse.data;
      }
      
      // Filtrer les voitures disponibles
      const disponibles = toutesVoitures.filter(v => v.etat === 'Disponible');
      setVoituresDisponibles(disponibles);
      
      // Charger les réservations
      const reservationsResponse = await api.getReservations();
      console.log("📦 Réservations reçues:", reservationsResponse.data);
      
      // Gérer la structure paginée
      if (reservationsResponse.data?.results) {
        setReservations(reservationsResponse.data.results);
        setPagination({
          count: reservationsResponse.data.count,
          next: reservationsResponse.data.next,
          previous: reservationsResponse.data.previous,
          currentPage: 1
        });
        
        setStats({
          total: reservationsResponse.data.count,
          disponibles: disponibles.length,
          reservees: reservationsResponse.data.count
        });
        
      } else if (Array.isArray(reservationsResponse.data)) {
        setReservations(reservationsResponse.data);
        setPagination({
          count: reservationsResponse.data.length,
          next: null,
          previous: null,
          currentPage: 1
        });
        
        setStats({
          total: reservationsResponse.data.length,
          disponibles: disponibles.length,
          reservees: reservationsResponse.data.length
        });
      }
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ type: 'error', text: 'Erreur de chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour annuler une réservation
  const handleAnnulerClick = (reservation) => {
    setReservationToCancel(reservation);
    setShowConfirmModal(true);
  };

  const confirmAnnuler = async () => {
    if (!reservationToCancel) return;
    
    try {
      await api.annulerReservation(reservationToCancel.id);
      
      setMessage({ 
        type: 'success', 
        text: 'Réservation annulée avec succès' 
      });
      
      // Mettre à jour l'état local
      setVoituresDisponibles(prev => {
        // Ajouter la voiture à la liste des disponibles
        const voitureAnnulee = reservationToCancel.voiture_detail;
        if (voitureAnnulee && !prev.some(v => v.id === voitureAnnulee.id)) {
          return [...prev, { ...voitureAnnulee, etat: 'Disponible' }];
        }
        return prev;
      });
      
      // Déclencher les événements pour mettre à jour toutes les pages
      window.dispatchEvent(new CustomEvent('reservation-effectuee', { 
        detail: { message: 'Réservation annulée' } 
      }));
      
      window.dispatchEvent(new CustomEvent('voiture-etat-change', { 
        detail: { 
          voitureId: reservationToCancel.voiture_detail?.id,
          nouvelEtat: 'Disponible'
        } 
      }));
      
      setRefreshKey(prev => prev + 1);
      setShowConfirmModal(false);
      setReservationToCancel(null);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de l\'annulation' 
      });
    }
  };

  const handleReserver = (voitureId) => {
    console.log("🔍 Redirection vers réservation pour voiture:", voitureId);
    navigate(`/admin/voitures/reserver/${voitureId}`);
  };

  const getEtatBadge = (etat) => {
    switch(etat) {
      case 'Disponible':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
            <Icons.Check />
            <span>Disponible</span>
          </span>
        );
      case 'Réservée':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm">
            <Icons.Clock />
            <span>Réservée</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-full bg-red-100 text-red-700 border border-red-200 shadow-sm">
            <span>✖ {etat}</span>
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les voitures disponibles par recherche
  const voituresFiltrees = voituresDisponibles.filter(voiture => 
    voiture.marque_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voiture.modele_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-white mt-4 text-sm animate-pulse">Chargement des données...</p>
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
              {message.type === 'success' ? <Icons.Check /> : <Icons.Trash />}
            </div>
            <span className="font-medium">{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-4 text-white/80 hover:text-white transition-transform hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'annulation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700 animate-scaleIn">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Icons.Trash />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmer l'annulation</h3>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir annuler la réservation de <br />
                <span className="font-semibold text-red-400 text-lg">
                  {reservationToCancel?.voiture_detail?.marque_nom} {reservationToCancel?.voiture_detail?.modele_nom}
                </span> ?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAnnuler}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative min-h-screen px-4 py-6">
        
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

        {/* Container */}
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">

          {/* En-tête avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-5 text-white transform hover:scale-105 transition-all duration-300 animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total véhicules</p>
                  <p className="text-3xl font-bold mt-1">{stats.disponibles + stats.reservees}</p>
                </div>
                <div className="p-3 bg-blue-500/30 rounded-xl">
                  <Icons.Car />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-5 text-white transform hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Disponibles</p>
                  <p className="text-3xl font-bold mt-1">{stats.disponibles}</p>
                </div>
                <div className="p-3 bg-green-500/30 rounded-xl">
                  <Icons.Check />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl shadow-xl p-5 text-white transform hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm font-medium">Réservées</p>
                  <p className="text-3xl font-bold mt-1">{stats.reservees}</p>
                </div>
                <div className="p-3 bg-yellow-500/30 rounded-xl">
                  <Icons.Clock />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-xl p-5 text-white transform hover:scale-105 transition-all duration-300 animate-fadeInUp animation-delay-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Utilisateurs</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-purple-500/30 rounded-xl">
                  <Icons.User />
                </div>
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-white/20 animate-fadeInUp">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher une voiture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                value={filterEtat}
                onChange={(e) => setFilterEtat(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm"
              >
                <option value="all">Tous les états</option>
                <option value="Disponible">Disponible</option>
                <option value="Réservée">Réservée</option>
              </select>
            </div>
          </div>

          {/* Section Voitures Disponibles */}
          <section className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-fadeInUp">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Icons.Car />
                </div>
                <span>🚗 Voitures Disponibles ({voituresFiltrees.length})</span>
              </h2>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marque</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voituresFiltrees.length > 0 ? (
                      voituresFiltrees.map((voiture, index) => (
                        <tr key={voiture.id} className="hover:bg-blue-50 transition-all duration-300 group">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{voiture.marque_nom}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{voiture.modele_nom}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{voiture.annee}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{voiture.kilometrage?.toLocaleString()} km</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatPrix(voiture.prix, voiture.devise)}</td>
                          <td className="px-4 py-3">{getEtatBadge(voiture.etat)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleReserver(voiture.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                              <Icons.Calendar />
                              <span>Réserver</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Icons.Car />
                            <p>Aucune voiture disponible</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section Voitures Réservées */}
          <section className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-fadeInUp">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Icons.Clock />
                </div>
                <span>📌 Voitures Réservées ({reservations.length})</span>
              </h2>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marque</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date réservation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.length > 0 ? (
                      reservations.map((reservation, index) => {
                        const voitureDetail = reservation.voiture_detail;
                        const utilisateurDetail = reservation.utilisateur_detail;
                        
                        return (
                          <tr key={reservation.id} className="hover:bg-yellow-50 transition-all duration-300 group">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{voitureDetail?.marque_nom}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{voitureDetail?.modele_nom}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{voitureDetail?.annee}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatPrix(voitureDetail?.prix, voitureDetail?.devise)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{formatDate(reservation.date_reservation)}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{utilisateurDetail?.username}</span>
                                <span className="text-xs text-gray-500">{utilisateurDetail?.email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleAnnulerClick(reservation)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                              >
                                <Icons.Trash />
                                <span>Annuler</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <Icons.Clock />
                            <p>Aucune réservation</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
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

        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}