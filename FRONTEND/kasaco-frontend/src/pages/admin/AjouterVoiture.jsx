// src/pages/admin/AjouterVoiture.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import api, { getImageUrl } from "../../services/api";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Image de fond
import carBg from "../../assets/images/car-bg.jpg";

export default function AjouterVoiture() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // États pour les formulaires
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [loadingModeles, setLoadingModeles] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Options pour les pays
  const paysOptions = [
    { value: "Burundi", label: "🇧🇮 Burundi" },
    { value: "Rwanda", label: "🇷🇼 Rwanda" },
    { value: "Tanzanie", label: "🇹🇿 Tanzanie" },
    { value: "Ouganda", label: "🇺🇬 Ouganda" },
    { value: "Kenya", label: "🇰🇪 Kenya" },
    { value: "RDC", label: "🇨🇩 République Démocratique du Congo" },
    { value: "France", label: "🇫🇷 France" },
    { value: "Belgique", label: "🇧🇪 Belgique" },
    { value: "Allemagne", label: "🇩🇪 Allemagne" },
    { value: "Japon", label: "🇯🇵 Japon" },
    { value: "Emirats Arabes Unis", label: "🇦🇪 Émirats Arabes Unis" },
    { value: "USA", label: "🇺🇸 États-Unis" },
    { value: "Chine", label: "🇨🇳 Chine" },
    { value: "Corée du Sud", label: "🇰🇷 Corée du Sud" },
    { value: "Italie", label: "🇮🇹 Italie" },
    { value: "Espagne", label: "🇪🇸 Espagne" },
    { value: "Suède", label: "🇸🇪 Suède" },
    { value: "Royaume-Uni", label: "🇬🇧 Royaume-Uni" },
    { value: "Autre", label: "🌍 Autre" },
  ];

  // État du formulaire voiture
  const [voitureData, setVoitureData] = useState({
    marque: '',
    modele: '',
    numero_chassis: '',
    numero_moteur: '',
    annee: new Date().getFullYear(),
    transmission: '',
    kilometrage: '',
    couleur: '',
    cylindree_cc: '',
    prix: '',
    devise: 'BIF',
    pays: 'Burundi',  // Valeur par défaut
    etat: 'Disponible',
    photo: null
  });

  // État pour les images supplémentaires
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Charger les marques au démarrage
  useEffect(() => {
    chargerMarques();
  }, []);

  const chargerMarques = async () => {
    try {
      const response = await api.getMarquesAdmin();
      if (response.data?.results) {
        setMarques(response.data.results);
      } else if (Array.isArray(response.data)) {
        setMarques(response.data);
      }
    } catch (error) {
      console.error("❌ Erreur chargement marques:", error);
      setMessage({ type: 'error', text: 'Erreur de chargement des marques' });
    }
  };

  // Charger les modèles quand la marque change
  useEffect(() => {
    if (voitureData.marque) {
      chargerModeles(voitureData.marque);
    } else {
      setModeles([]);
    }
  }, [voitureData.marque]);

  const chargerModeles = async (marqueId) => {
    try {
      setLoadingModeles(true);
      const response = await api.getModelesByMarque(marqueId);
      if (response.data?.results) {
        setModeles(response.data.results);
      } else if (Array.isArray(response.data)) {
        setModeles(response.data);
      } else {
        setModeles([]);
      }
    } catch (error) {
      console.error("❌ Erreur chargement modèles:", error);
      setModeles([]);
    } finally {
      setLoadingModeles(false);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'photo' && files && files[0]) {
      setVoitureData({ ...voitureData, photo: files[0] });
    } else if (name === 'images') {
      const selectedFiles = Array.from(files);
      setImages(selectedFiles);
      
      // Créer les prévisualisations
      const previews = [];
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === selectedFiles.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    } else if (name === 'prix') {
      // Formatage automatique du prix (affichage seulement)
      let rawValue = value.replace(/[^0-9.]/g, "");
      
      // Éviter les points multiples
      const parts = rawValue.split(".");
      if (parts.length > 2) {
        rawValue = parts[0] + "." + parts.slice(1).join("");
      }
      
      setVoitureData({ 
        ...voitureData, 
        prix: rawValue
      });
    } else {
      setVoitureData({ ...voitureData, [name]: value });
    }
  };

  // Formatage du prix pour l'affichage
  const formatPrixAffichage = (prix) => {
    if (!prix) return '';
    const parts = prix.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts[1] ? `${integerPart}.${parts[1].substring(0, 2)}` : integerPart;
  };

  // Validation du formulaire
  const validateForm = () => {
    const required = ['marque', 'modele', 'numero_chassis', 'numero_moteur', 'annee', 'transmission', 'kilometrage', 'couleur', 'cylindree_cc', 'prix', 'pays'];
    
    for (const field of required) {
      if (!voitureData[field]) {
        setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
        return false;
      }
    }
    
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Ajouter les champs de la voiture
      Object.keys(voitureData).forEach(key => {
        if (voitureData[key] !== null && voitureData[key] !== '') {
          if (key === 'prix') {
            // Nettoyer le prix (enlever les espaces et virgules)
            const cleanPrix = voitureData.prix.replace(/[^\d.]/g, '');
            formData.append(key, cleanPrix);
          } else {
            formData.append(key, voitureData[key]);
          }
        }
      });
      
      // Ajouter les images supplémentaires
      images.forEach(image => {
        formData.append('images', image);
      });
      
      await api.createVoiture(formData);
      
      setMessage({ type: 'success', text: 'Voiture ajoutée avec succès !' });
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/admin/voitures');
      }, 2000);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de l\'ajout' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar />
      
      {/* Message de notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded shadow-lg animate-slideIn ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          <div className="flex items-center gap-2">
            <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-4 text-white/80 hover:text-white"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative min-h-screen bg-gray-100">
        {/* Image de fond + overlay */}
        <div className="absolute inset-0 bg-cover bg-center">
          <img src={carBg} alt="Background" className="w-full h-full object-cover brightness-50 blur-sm" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
          
          {/* Header formulaire */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8 text-white">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg mr-3">
                <i className="fa-solid fa-car-side text-xl sm:text-3xl"></i>
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold">Ajouter une Voiture</h2>
                <p className="text-xs sm:text-sm text-gray-200 mt-0.5">Remplissez les informations du véhicule</p>
              </div>
            </div>
          </div>

          {/* Carte formulaire */}
          <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-5 sm:p-8">
              
              {/* ================= VOITURE FORM ================= */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    1
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Informations du véhicule</h3>
                </div>

                {/* Grille responsive */}
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-5">
                  
                  {/* Marque */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Marque <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="marque"
                      value={voitureData.marque}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    >
                      <option value="">Sélectionner une marque</option>
                      {marques.map(marque => (
                        <option key={marque.id} value={marque.id}>{marque.nom}</option>
                      ))}
                    </select>
                  </div>

                  {/* Modèle */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Modèle <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="modele"
                      value={voitureData.modele}
                      onChange={handleInputChange}
                      disabled={!voitureData.marque || loadingModeles}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">
                        {loadingModeles ? 'Chargement...' : 'Sélectionner un modèle'}
                      </option>
                      {modeles.map(modele => (
                        <option key={modele.id} value={modele.id}>{modele.nom}</option>
                      ))}
                    </select>
                  </div>

                  {/* Numéro châssis */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Numéro châssis <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numero_chassis"
                      value={voitureData.numero_chassis}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Numéro moteur */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Numéro moteur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="numero_moteur"
                      value={voitureData.numero_moteur}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Année */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Année <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="annee"
                      value={voitureData.annee}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Transmission */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="transmission"
                      value={voitureData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="Manuelle">Manuelle</option>
                      <option value="Automatique">Automatique</option>
                    </select>
                  </div>

                  {/* Kilométrage */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Kilométrage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="kilometrage"
                      value={voitureData.kilometrage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Couleur */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Couleur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="couleur"
                      value={voitureData.couleur}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Cylindrée */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Cylindrée (CC) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cylindree_cc"
                      value={voitureData.cylindree_cc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  {/* Prix */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Prix <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="prix"
                      value={formatPrixAffichage(voitureData.prix)}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      placeholder="0,00"
                      required
                    />
                  </div>

                  {/* Devise */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Devise</label>
                    <select
                      name="devise"
                      value={voitureData.devise}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                    >
                      <option value="BIF">BIF</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  {/* PAYS - NOUVEAU CHAMP */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      Pays <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="pays"
                      value={voitureData.pays}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                      required
                    >
                      {paysOptions.map(pays => (
                        <option key={pays.value} value={pays.value}>{pays.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Pays où se trouve actuellement le véhicule</p>
                  </div>

                  {/* État */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">État</label>
                    <select
                      name="etat"
                      value={voitureData.etat}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition bg-white shadow-sm"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Réservée">Réservée</option>
                      <option value="Vendue">Vendue</option>
                    </select>
                  </div>

                  {/* Photo principale */}
                  <div className="flex flex-col space-y-1.5 col-span-2">
                    <label className="text-sm font-medium text-gray-700">Photo principale</label>
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* ================= IMAGES FORM ================= */}
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    2
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Images supplémentaires</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Images (optionnel)</label>
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition shadow-sm"
                    />
                  </div>

                  {/* Prévisualisation des images */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2 text-xs text-blue-800">
                  <i className="fa-regular fa-image text-blue-500 mt-0.5"></i>
                  <div>
                    <p className="font-medium">Formats acceptés : JPG, PNG</p>
                    <p className="text-blue-600/70">Taille maximale : 5 Mo par image</p>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/voitures')}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition text-center flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-times"></i>
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-900 transition shadow-lg flex items-center justify-center gap-2 shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-check"></i>
                  {isSubmitting ? 'Publication...' : 'Publier le véhicule'}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                <span className="text-red-500">*</span> Champs obligatoires
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Style pour les animations */}
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
      `}</style>
    </div>
  );
}