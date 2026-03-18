// src/pages/admin/Marques.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import api, { getImageUrl } from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond (à placer dans assets/images/car-bg.jpg)
import carBg from "../../assets/images/car-bg.jpg";

// Image par défaut pour les logos
import defaultLogo from "../../assets/images/default-logo.png";

export default function AdminMarques() {
  const { user } = useAuth();
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nom: "", logo: null });
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [marqueToDelete, setMarqueToDelete] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);

  const itemsPerPage = 10;

  // Charger les marques
  useEffect(() => {
    fetchMarques();
  }, []);

  const fetchMarques = async () => {
    try {
      setLoading(true);
      const response = await api.getMarquesAdmin();
      console.log("📦 Marques reçues:", response.data);
      
      // Gérer la structure des données
      let marquesData = [];
      if (response.data && response.data.results) {
        marquesData = response.data.results;
        setTotalPages(Math.ceil(response.data.count / itemsPerPage));
      } else if (Array.isArray(response.data)) {
        marquesData = response.data;
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      }
      
      setMarques(marquesData);
    } catch (err) {
      console.error("❌ Erreur chargement marques:", err);
      setMessage({
        type: 'error',
        text: 'Impossible de charger les marques'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'logo' && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, logo: file });
      
      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => setPreviewLogo(reader.result);
      reader.readAsDataURL(file);
    } else if (name === 'nom') {
      setFormData({ ...formData, nom: value });
    }
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const resetForm = () => {
    setFormData({ nom: "", logo: null });
    setPreviewLogo(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nom?.trim()) {
      setFormErrors({ nom: "Le nom de la marque est requis" });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      await api.createMarque(formDataToSend);
      
      setMessage({ type: 'success', text: 'Marque ajoutée avec succès !' });
      await fetchMarques();
      setShowModal(false);
      resetForm();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (err) {
      console.error("❌ Erreur:", err);
      setMessage({
        type: 'error',
        text: err.response?.data?.nom?.[0] || 'Erreur lors de l\'ajout'
      });
    }
  };

  const handleDeleteClick = (marque) => {
    setMarqueToDelete(marque);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!marqueToDelete) return;
    
    try {
      await api.deleteMarque(marqueToDelete.id);
      setMessage({
        type: 'success',
        text: `Marque "${marqueToDelete.nom}" supprimée`
      });
      await fetchMarques();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally {
      setShowConfirmModal(false);
      setMarqueToDelete(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const paginatedMarques = marques.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      
      {/* Message de notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-lg shadow-2xl animate-slideIn ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <i className={`fa mr-2 ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-4">
              Supprimer la marque <span className="font-semibold text-red-400">{marqueToDelete?.nom}</span> ?
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Annuler
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Ajouter une marque</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg ${formErrors.nom ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.nom && <p className="text-red-500 text-sm mt-1">{formErrors.nom}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Logo</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full"
                />
                {previewLogo && (
                  <img src={previewLogo} alt="Prévisualisation" className="mt-2 h-20 object-contain" />
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${carBg})` }}>
        <div className="absolute inset-0 bg-black/80"></div>
        
        <div className="relative container mx-auto mt-10 px-4 pb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Gestion des Marques</h2>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <i className="fa fa-plus mr-2"></i>Ajouter
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <table className="w-full text-white">
              <thead className="bg-white/20">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Logo</th>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMarques.map((marque, index) => (
                  <tr key={marque.id} className="border-t border-white/10">
                    <td className="px-4 py-2 text-center">{(currentPage-1)*itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2 text-center">
                      {marque.logo_url ? (
                        <img src={getImageUrl(marque.logo_url)} alt={marque.nom} className="h-10 mx-auto" />
                      ) : (
                        <i className="fa fa-image text-gray-400"></i>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">{marque.nom}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => handleDeleteClick(marque)} className="text-red-400 hover:text-red-300">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination simple */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}
                  className="px-3 py-1 bg-white/20 rounded disabled:opacity-50">
                  ←
                </button>
                <span className="px-3 py-1 bg-white/20 rounded">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}
                  className="px-3 py-1 bg-white/20 rounded disabled:opacity-50">
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