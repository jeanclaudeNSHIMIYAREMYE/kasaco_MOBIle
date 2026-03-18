// src/pages/admin/Modeles.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import api, { getImageUrl } from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond
import carBg2 from "../../assets/images/car-bg2.jpg";

export default function AdminModeles() {
  const { user } = useAuth();
  const [modeles, setModeles] = useState([]);
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    marque: "",
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  // Charger les données
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger les marques pour le select
      const marquesResponse = await api.getMarquesAdmin();
      if (marquesResponse.data?.results) {
        setMarques(marquesResponse.data.results);
      } else if (Array.isArray(marquesResponse.data)) {
        setMarques(marquesResponse.data);
      }

      // Charger les modèles
      const modelesResponse = await api.getModelesAdmin();
      console.log("📦 Modèles reçus:", modelesResponse.data);
      
      if (modelesResponse.data?.results) {
        setModeles(modelesResponse.data.results);
        setTotalPages(Math.ceil(modelesResponse.data.count / itemsPerPage));
      } else if (Array.isArray(modelesResponse.data)) {
        setModeles(modelesResponse.data);
        setTotalPages(Math.ceil(modelesResponse.data.length / itemsPerPage));
      }
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ type: 'error', text: 'Erreur de chargement' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({ nom: "", marque: "", image: null });
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.marque) {
      setMessage({ type: 'error', text: 'Le nom et la marque sont requis' });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('marque', formData.marque);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await api.createModele(formDataToSend);
      
      setMessage({ type: 'success', text: 'Modèle ajouté avec succès !' });
      setShowModal(false);
      resetForm();
      chargerDonnees();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.nom?.[0] || 'Erreur lors de l\'ajout' 
      });
    }
  };

  const handleDelete = async (id, nomModele) => {
    if (!window.confirm(`Supprimer le modèle "${nomModele}" ?`)) return;
    
    try {
      await api.deleteModele(id);
      setMessage({ type: 'success', text: 'Modèle supprimé !' });
      chargerDonnees();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const paginatedModeles = modeles.slice(
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

      {/* Contenu principal */}
      <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${carBg2})` }}>
        <div className="absolute inset-0 bg-black/75"></div>
        
        <div className="relative container mx-auto p-6">
          {/* Titre et bouton */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fa fa-car-side text-green-400 mr-3"></i>
              Gestion des Modèles
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <i className="fa fa-plus mr-2"></i>
              Ajouter
            </button>
          </div>

          {/* Tableau des modèles */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            {modeles.length === 0 ? (
              <p className="text-center py-8 text-gray-400">Aucun modèle trouvé</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/10 text-green-300">
                        <th className="p-2 border border-white/20">#</th>
                        <th className="p-2 border border-white/20">Image</th>
                        <th className="p-2 border border-white/20">Nom</th>
                        <th className="p-2 border border-white/20">Marque</th>
                        <th className="p-2 border border-white/20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedModeles.map((modele, index) => (
                        <tr key={modele.id} className="border-b border-white/20 hover:bg-white/5">
                          <td className="p-2 text-center">{(currentPage-1)*itemsPerPage + index + 1}</td>
                          <td className="p-2 text-center">
                            {modele.image_url ? (
                              <img 
                                src={getImageUrl(modele.image_url)} 
                                alt={modele.nom}
                                className="h-10 w-16 object-cover rounded mx-auto"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">Pas d'image</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <i className="fa fa-car-side text-gray-400 mr-2"></i>
                            {modele.nom}
                          </td>
                          <td className="p-2 text-center">{modele.marque_nom || modele.marque?.nom}</td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleDelete(modele.id, modele.nom)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1 ? 'bg-white/10 text-gray-500' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      &laquo;
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i+1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i+1 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {i+1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${
                        currentPage === totalPages ? 'bg-white/10 text-gray-500' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Ajouter un modèle</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Marque</label>
                <select
                  name="marque"
                  value={formData.marque}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  required
                >
                  <option value="">Sélectionner une marque</option>
                  {marques.map(marque => (
                    <option key={marque.id} value={marque.id}>{marque.nom}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full text-white"
                />
                {preview && (
                  <img src={preview} alt="Preview" className="mt-2 h-20 object-contain" />
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}