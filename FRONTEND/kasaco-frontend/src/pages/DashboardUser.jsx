// src/pages/MesReservations.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import api from "../services/api";
import Navigation from "../components/Navigation";

// Image de fond
import hondaBg from "../assets/images/honda.jpg";

// Icônes SVG personnalisées
const Icons = {
  Car: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  Price: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Status: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Empty: () => (
    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export default function MesReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerReservations();
  }, []);

  const chargerReservations = async () => {
    try {
      setLoading(true);
      const response = await api.getMesReservations();
      console.log("📦 Réservations reçues:", response.data);
      
      if (response.data?.results) {
        setReservations(response.data.results);
      } else if (Array.isArray(response.data)) {
        setReservations(response.data);
      }
    } catch (error) {
      console.error("❌ Erreur chargement réservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrix = (prix) => {
    if (!prix) return '0 $';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    return prixNumber.toLocaleString('fr-FR') + ' $';
  };

  const getStatusBadge = (etat) => {
    switch(etat) {
      case 'Disponible':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Disponible
          </span>
        );
      case 'Réservée':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Réservée
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-red-600 to-rose-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {etat}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <Navigation>
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="relative min-h-screen px-6 py-12 flex items-center justify-center">
        
        {/* Fond */}
        <div className="absolute inset-0">
          <img
            src={hondaBg}
            alt="Mes réservations"
            className="w-full h-full object-cover blur-sm brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-orange-400/20 to-yellow-200/20"></div>
        </div>

        {/* Conteneur principal */}
        <div className="relative w-full max-w-6xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8">
          
          {/* Titre */}
          <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-fadeIn">
            <i className="bi bi-journal-check mr-2"></i>
            Mes réservations
          </h2>

          {/* Tableau des réservations */}
          <div className="overflow-x-auto rounded-xl shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
              
              {/* En-tête */}
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <Icons.Car />
                      Voiture
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <Icons.Price />
                      Prix
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    <div className="flex items-center gap-2">
                      <Icons.Calendar />
                      Date réservation
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">
                    <div className="flex items-center justify-center gap-2">
                      <Icons.Status />
                      Statut
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Corps */}
              <tbody className="bg-white divide-y divide-gray-100">
                {reservations.length > 0 ? (
                  reservations.map((reservation) => {
                    const voiture = reservation.voiture_detail || reservation.voiture;
                    
                    return (
                      <tr key={reservation.id} className="group hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition duration-300 transform hover:scale-[1.01]">
                        
                        {/* Voiture */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icons.Car />
                            <span className="font-semibold text-gray-800">
                              {voiture?.marque_nom} {voiture?.modele_nom}
                            </span>
                          </div>
                        </td>

                        {/* Prix */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-700">
                            {formatPrix(voiture?.prix)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Icons.Calendar />
                            <span>{formatDate(reservation.date_reservation)}</span>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(voiture?.etat)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Icons.Empty />
                      <p className="text-lg font-semibold text-red-600 mt-4">
                        Vous n'avez aucune réservation
                      </p>
                    
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.9s ease-out forwards;
        }
      `}</style>
    </Navigation>
  );
}