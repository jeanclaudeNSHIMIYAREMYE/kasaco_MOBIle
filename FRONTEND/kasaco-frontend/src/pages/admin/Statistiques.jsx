// src/pages/admin/Statistiques.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond
import statsBg from "../../assets/images/stats-bg.jpg";

// Icônes SVG personnalisées
const Icons = {
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Car: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  CarAvailable: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CarReserved: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CarSold: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
    </svg>
  ),
  Reservation: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Brand: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Model: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

export default function AdminStatistiques() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    utilisateurs: 0,
    voitures: 0,
    voitures_disponibles: 0,
    voitures_reservees: 0,
    voitures_vendues: 0,
    reservations: 0,
    marques: 0,
    modeles: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Charger les statistiques
  useEffect(() => {
    chargerStats();
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  const chargerStats = async () => {
    try {
      setLoading(true);
      const response = await api.getStats();
      console.log("📊 Statistiques reçues:", response.data);
      setStats(response.data);
      setMessage({ 
        type: 'success', 
        text: 'Données mises à jour avec succès' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ 
        type: 'error', 
        text: 'Erreur de chargement des statistiques' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculer les pourcentages
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const statsCards = [
    {
      title: "Utilisateurs",
      value: stats.utilisateurs,
      icon: Icons.Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-500",
      description: "Total des utilisateurs enregistrés"
    },
    {
      title: "Voitures",
      value: stats.voitures,
      icon: Icons.Car,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-500",
      description: "Total des véhicules"
    },
    {
      title: "Disponibles",
      value: stats.voitures_disponibles,
      icon: Icons.CarAvailable,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-500",
      description: "Véhicules disponibles"
    },
    {
      title: "Réservées",
      value: stats.voitures_reservees,
      icon: Icons.CarReserved,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-500",
      description: "Véhicules réservés"
    },
    {
      title: "Vendues",
      value: stats.voitures_vendues,
      icon: Icons.CarSold,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-500",
      description: "Véhicules vendus"
    },
    {
      title: "Réservations",
      value: stats.reservations,
      icon: Icons.Reservation,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-500",
      description: "Total des réservations"
    },
    {
      title: "Marques",
      value: stats.marques,
      icon: Icons.Brand,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      borderColor: "border-pink-500",
      description: "Marques disponibles"
    },
    {
      title: "Modèles",
      value: stats.modeles,
      icon: Icons.Model,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      borderColor: "border-teal-500",
      description: "Modèles disponibles"
    }
  ];

  // Graphique circulaire pour la répartition des voitures
  const voituresTotal = stats.voitures;
  const disponibiliteData = [
    { label: 'Disponibles', value: stats.voitures_disponibles, color: 'bg-green-500', percentage: calculatePercentage(stats.voitures_disponibles, voituresTotal) },
    { label: 'Réservées', value: stats.voitures_reservees, color: 'bg-yellow-500', percentage: calculatePercentage(stats.voitures_reservees, voituresTotal) },
    { label: 'Vendues', value: stats.voitures_vendues, color: 'bg-red-500', percentage: calculatePercentage(stats.voitures_vendues, voituresTotal) }
  ];

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
            <p className="text-white mt-4 text-sm animate-pulse">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      
      {/* Message de notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl animate-slideIn ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {message.type === 'success' ? <Icons.CarAvailable /> : <Icons.CarSold />}
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

      {/* Contenu principal */}
      <div className="relative min-h-screen px-4 py-6">
        
        {/* Background avec overlay */}
        <div className="fixed inset-0 -z-10">
          <img 
            src={statsBg} 
            alt="Background" 
            className="w-full h-full object-cover blur-sm brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-900/95"></div>
        </div>

        {/* Éléments décoratifs animés */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Container */}
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">

          {/* En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-fadeInDown">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Statistiques
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                Vue d'ensemble de votre plateforme KASACO
              </p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              
              <button
                onClick={chargerStats}
                className="p-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-blue-500 transition-all duration-300 group"
                title="Rafraîchir"
              >
                <Icons.Refresh />
              </button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <div
                key={card.title}
                className={`group bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
                  animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${card.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon />
                    </div>
                    <span className={`text-3xl font-bold ${card.textColor}`}>{card.value}</span>
                  </div>
                  <h3 className="text-gray-800 font-semibold mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500">{card.description}</p>
                  
                  {/* Mini barre de progression */}
                  <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min((card.value / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Graphiques et analyses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            
            {/* Répartition des voitures */}
            <div className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 transform transition-all duration-700 ${
              animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '800ms' }}>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Icons.TrendingUp />
                <span>Répartition des véhicules</span>
              </h2>
              
              <div className="space-y-4">
                {disponibiliteData.map((item, index) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-800">{item.value} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistiques supplémentaires */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.voitures}</p>
                  <p className="text-xs text-gray-500">Total véhicules</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {((stats.voitures_disponibles / stats.voitures) * 100 || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Taux de disponibilité</p>
                </div>
              </div>
            </div>

            {/* Aperçu rapide */}
            <div className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 transform transition-all duration-700 ${
              animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '900ms' }}>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Aperçu rapide</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Icons.Users />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Utilisateurs</p>
                      <p className="text-xl font-bold text-gray-800">{stats.utilisateurs}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">+12%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Icons.Reservation />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Réservations</p>
                      <p className="text-xl font-bold text-gray-800">{stats.reservations}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">+5%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Icons.Brand />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Marques/Modèles</p>
                      <p className="text-xl font-bold text-gray-800">{stats.marques}/{stats.modeles}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">+3%</span>
                </div>
              </div>

              {/* Dernière mise à jour */}
              <div className="mt-6 text-center text-xs text-gray-400">
                Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="text-center text-gray-500 text-xs mt-8 animate-fadeInUp">
            © {new Date().getFullYear()} KASACO - Tableau de bord administrateur
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

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}