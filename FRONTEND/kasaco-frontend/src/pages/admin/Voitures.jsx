// src/pages/admin/Voitures.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api, { getImageUrl } from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond
import luxuryCarsBg from "../../assets/images/luxury-cars-bg.jpg";

export default function AdminVoitures() {
  const { user } = useAuth();
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voitureToDelete, setVoitureToDelete] = useState(null);
  
  // État pour forcer le rechargement
  const [refreshKey, setRefreshKey] = useState(0);

  const itemsPerPage = 10;

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

  // Fonction pour obtenir l'emoji du pays
  const getPaysEmoji = (pays) => {
    const emojis = {
      'Burundi': '🇧🇮',
      'Rwanda': '🇷🇼',
      'Tanzanie': '🇹🇿',
      'Ouganda': '🇺🇬',
      'Kenya': '🇰🇪',
      'RDC': '🇨🇩',
      'France': '🇫🇷',
      'Belgique': '🇧🇪',
      'Allemagne': '🇩🇪',
      'Japon': '🇯🇵',
      'Emirats Arabes Unis': '🇦🇪',
      'USA': '🇺🇸',
      'Chine': '🇨🇳',
      'Corée du Sud': '🇰🇷',
      'Italie': '🇮🇹',
      'Espagne': '🇪🇸',
      'Suède': '🇸🇪',
      'Royaume-Uni': '🇬🇧',
      'Autre': '🌍'
    };
    return emojis[pays] || '🌍';
  };

  // Écouter les événements de réservation
  useEffect(() => {
    const handleReservation = () => {
      console.log("🔄 Réservation détectée, rechargement des voitures");
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

  // Charger les voitures
  useEffect(() => {
    chargerVoitures();
  }, [currentPage, refreshKey]);

  const chargerVoitures = async () => {
    try {
      setLoading(true);
      const response = await api.getVoituresAdmin();
      console.log("📦 Voitures reçues:", response.data);
      
      // Adapter selon la structure
      if (response.data?.results) {
        setVoitures(response.data.results);
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else if (Array.isArray(response.data)) {
        setVoitures(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      }
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ type: 'error', text: 'Erreur de chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (voiture) => {
    setVoitureToDelete(voiture);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!voitureToDelete) return;
    
    try {
      await api.deleteVoiture(voitureToDelete.id);
      setMessage({ 
        type: 'success', 
        text: `Voiture "${voitureToDelete.marque_nom} ${voitureToDelete.modele_nom}" supprimée` 
      });
      
      // Recharger après suppression
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setShowConfirmModal(false);
      setVoitureToDelete(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const getEtatBadge = (etat) => {
    switch(etat) {
      case 'Disponible':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
            {etat}
          </span>
        );
      case 'Réservée':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white">
            {etat}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
            {etat}
          </span>
        );
    }
  };

  const paginatedVoitures = voitures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      
      {/* Message de notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded shadow-lg animate-fadeOut ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      {/* Modal de confirmation suppression */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-4">
              Supprimer la voiture <br />
              <span className="font-semibold text-red-400">
                {voitureToDelete?.marque_nom} {voitureToDelete?.modele_nom}
              </span> ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${luxuryCarsBg})` }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-purple-900/80 to-indigo-950/90"></div>

        <div className="relative z-10 container mx-auto px-3 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center text-white gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-3xl shadow-2xl border border-white/20">
                <i className="fa-solid fa-car-side text-3xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Administration du parc</h1>
                <p className="text-blue-200 text-sm mt-1">
                  {voitures.length} véhicules enregistrés
                </p>
              </div>
            </div>

            <Link
              to="/admin/voitures/ajouter"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition"
            >
              <i className="fa-solid fa-circle-plus"></i>
              Nouvelle voiture
            </Link>
          </div>

          {/* Carte principale */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            
            {/* Version Mobile - avec pays */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {paginatedVoitures.length > 0 ? (
                paginatedVoitures.map((voiture) => (
                  <div key={voiture.id} className="p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition">
                    
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {voiture.marque_nom} {voiture.modele_nom}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="fa-regular fa-calendar mr-1"></i>
                          {voiture.annee}
                        </p>
                      </div>
                      {getEtatBadge(voiture.etat)}
                    </div>

                    {/* Infos */}
                    <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl">
                      <div>
                        <p className="text-gray-400 text-xs">Châssis</p>
                        <p className="font-mono text-xs">{voiture.numero_chassis?.substring(0, 10)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Prix</p>
                        <p className="font-bold text-blue-600">
                          {formatPrix(voiture.prix, voiture.devise)}
                        </p>
                      </div>
                    </div>

                    {/* Pays */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">📍 Pays:</span>
                      <span className="font-medium">
                        {getPaysEmoji(voiture.pays)} {voiture.pays_display || voiture.pays}
                      </span>
                    </div>

                    {/* Action suppression */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleDeleteClick(voiture)}
                        className="w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm shadow-lg"
                      >
                        <i className="fa-regular fa-trash-can mr-1"></i>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <i className="fa-solid fa-car-side text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-500">Aucune voiture enregistrée</p>
                </div>
              )}
            </div>

            {/* Version Desktop - avec colonne Pays */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase">#</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Marque</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Modèle</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Châssis</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Année</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Prix</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">Pays</th>
                    <th className="px-6 py-4 text-left text-xs uppercase">État</th>
                    <th className="px-6 py-4 text-center text-xs uppercase">Supprimer</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {paginatedVoitures.length > 0 ? (
                    paginatedVoitures.map((voiture, index) => (
                      <tr key={voiture.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition">
                        <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-6 py-4 font-medium">{voiture.marque_nom}</td>
                        <td className="px-6 py-4">{voiture.modele_nom}</td>
                        <td className="px-6 py-4 font-mono text-xs">{voiture.numero_chassis?.substring(0, 12)}...</td>
                        <td className="px-6 py-4">{voiture.annee}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                          {formatPrix(voiture.prix, voiture.devise)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {getPaysEmoji(voiture.pays)} {voiture.pays_display || voiture.pays}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getEtatBadge(voiture.etat)}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteClick(voiture)}
                            className="w-9 h-9 bg-red-600 text-white rounded-lg flex items-center justify-center hover:scale-110 transition mx-auto"
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-gray-500">
                        Aucune voiture enregistrée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-4 space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  ←
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i+1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i+1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i+1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}