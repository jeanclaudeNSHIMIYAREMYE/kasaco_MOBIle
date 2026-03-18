// src/pages/admin/Users.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond (à placer dans assets/images/admin-bg.jpg)
import adminBg from "../../assets/images/admin-bg.jpg";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getUtilisateurs();
      // Si l'API retourne des données paginées
      if (response.data.results) {
        setUsers(response.data.results);
        setTotalPages(Math.ceil(response.data.count / usersPerPage));
      } else {
        setUsers(response.data);
        setTotalPages(Math.ceil(response.data.length / usersPerPage));
      }
      setError(null);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setError("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.changerRole(userId);
      
      // Mettre à jour la liste localement
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      setActionMessage({
        type: 'success',
        text: 'Rôle modifié avec succès'
      });
      
      // Effacer le message après 3 secondes
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Erreur lors de la modification du rôle'
      });
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await api.deleteUtilisateur(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setActionMessage({
        type: 'success',
        text: 'Utilisateur supprimé avec succès'
      });
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Erreur lors de la suppression'
      });
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (user) => {
    if (user.is_superuser) {
      return <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-semibold rounded-full shadow-lg">Super Admin</span>;
    } else if (user.role === 'admin') {
      return <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-lg">Admin</span>;
    } else {
      return <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">Utilisateur</span>;
    }
  };

  const paginatedUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      
      {/* Message d'action */}
      {actionMessage.text && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-2xl animate-slideIn ${
          actionMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center space-x-2">
            <i className={`fa ${actionMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700 animate-scaleIn">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa fa-exclamation-triangle text-4xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <br />
                <span className="font-semibold text-red-400">{userToDelete?.username}</span> ?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition transform hover:scale-105"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${adminBg})` }}>
        {/* Overlay avec effet de verre */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-gray-900/95 backdrop-blur-sm"></div>
        
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative container mx-auto mt-6 md:mt-10 px-3 md:px-4 pb-10">
          {/* Titre */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide flex items-center justify-center md:justify-start drop-shadow-lg">
              <i className="fa fa-users text-purple-400 mr-3 animate-pulse"></i>
              Gestion des Utilisateurs
            </h2>
            <div className="mt-4 md:mt-0">
              <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white text-sm border border-white/20">
                Total: <span className="font-bold text-purple-400">{users.length}</span> utilisateurs
              </span>
            </div>
          </div>

          {/* Carte principale */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-4 md:px-6 py-4 flex justify-between items-center">
              <h5 className="font-semibold text-base md:text-lg tracking-wide flex items-center">
                <i className="fa fa-list mr-2"></i> Liste des utilisateurs
              </h5>
              <div className="flex items-center space-x-2">
                <i className="fa fa-search text-white/70"></i>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-3 py-1 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block p-6 overflow-x-auto">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="text-center bg-white/5 text-purple-300 uppercase text-xs border-b border-white/10">
                    <th className="px-4 py-3 border border-white/10">#</th>
                    <th className="px-4 py-3 border border-white/10">Nom</th>
                    <th className="px-4 py-3 border border-white/10">Email</th>
                    <th className="px-4 py-3 border border-white/10">Rôle</th>
                    <th className="px-4 py-3 border border-white/10">Inscription</th>
                    <th className="px-4 py-3 border border-white/10">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((userItem, index) => (
                      <tr key={userItem.id} className="border-b border-white/10 hover:bg-white/5 transition duration-300 text-center group">
                        <td className="px-4 py-3 text-white">{(currentPage - 1) * usersPerPage + index + 1}</td>
                        <td className="px-4 py-3 text-left text-white">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-2">
                              {userItem.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{userItem.username}</span>
                            {userItem.id === user?.id && (
                              <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Vous</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white">{userItem.email}</td>
                        <td className="px-4 py-3">{getRoleBadge(userItem)}</td>
                        <td className="px-4 py-3 text-white">
                          {new Date(userItem.date_joined).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleRoleChange(userItem.id, userItem.role)}
                              disabled={userItem.id === user?.id}
                              className={`px-3 py-1 rounded-lg text-sm transition-all transform hover:scale-110 ${
                                userItem.id === user?.id
                                  ? 'bg-gray-600 cursor-not-allowed'
                                  : 'bg-yellow-500 hover:bg-yellow-600'
                              }`}
                            >
                              <i className="fa fa-exchange-alt mr-1"></i>
                              Rôle
                            </button>
                            <button
                              onClick={() => handleDeleteClick(userItem)}
                              disabled={userItem.id === user?.id}
                              className={`px-3 py-1 rounded-lg text-sm transition-all transform hover:scale-110 ${
                                userItem.id === user?.id
                                  ? 'bg-gray-600 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              <i className="fa fa-trash mr-1"></i>
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-gray-400">
                        <i className="fa fa-users text-4xl mb-3 block opacity-50"></i>
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((userItem) => (
                  <div key={userItem.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-white flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-2">
                          {userItem.username?.charAt(0).toUpperCase()}
                        </div>
                        {userItem.username}
                        {userItem.id === user?.id && (
                          <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Vous</span>
                        )}
                      </h3>
                      {getRoleBadge(userItem)}
                    </div>

                    <p className="text-sm text-gray-300 mb-1">
                      <i className="fa fa-envelope mr-2 text-purple-400"></i>
                      {userItem.email}
                    </p>

                    <p className="text-xs text-gray-400 mb-3">
                      <i className="fa fa-calendar mr-2 text-purple-400"></i>
                      {new Date(userItem.date_joined).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRoleChange(userItem.id, userItem.role)}
                        disabled={userItem.id === user?.id}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all transform hover:scale-105 ${
                          userItem.id === user?.id
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                      >
                        <i className="fa fa-exchange-alt mr-1"></i> Changer rôle
                      </button>
                      <button
                        onClick={() => handleDeleteClick(userItem)}
                        disabled={userItem.id === user?.id}
                        className={`flex-1 py-2 rounded-lg text-sm transition-all transform hover:scale-105 ${
                          userItem.id === user?.id
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        <i className="fa fa-trash mr-1"></i> Supprimer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-10">
                  <i className="fa fa-users text-4xl mb-3 block opacity-50"></i>
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-6 flex justify-center">
                <nav className="inline-flex rounded-lg overflow-hidden shadow-lg">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 transition-all ${
                      currentPage === 1
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <i className="fa fa-chevron-left"></i>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 transition-all ${
                        currentPage === i + 1
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 transition-all ${
                      currentPage === totalPages
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <i className="fa fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles additionnels */}
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
      `}</style>
    </div>
  );
}