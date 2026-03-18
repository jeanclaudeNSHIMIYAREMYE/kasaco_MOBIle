// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Erreur API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Fonction pour obtenir l'URL complète d'une image
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/media")) {
    return `${API_BASE_URL.replace("/api", "")}${imagePath}`;
  }
  return `${API_BASE_URL.replace("/api", "")}/media/${imagePath}`;
};

// Fonction pour extraire les données (gestion pagination)
const extractData = (response) => {
  if (response.data && response.data.results !== undefined) {
    return response.data.results;
  }
  return response.data;
};

// Objet contenant toutes les méthodes API
const apiService = {
  // ==================== MARQUES (public) ====================
  getMarques: async () => {
    const response = await api.get("/marquesuser/");
    console.log("🔍 Réponse brute API marques:", response.data);
    const data = extractData(response);
    console.log("📦 Données extraites marques:", data);
    return { ...response, data };
  },
  
  getMarqueById: async (id) => {
    const response = await api.get(`/marquesuser/${id}/`);
    return response;
  },
  
  // ==================== MARQUES (admin) ====================
  getMarquesAdmin: async () => {
    try {
      const response = await api.get("/marques/");
      console.log("🔍 Réponse brute API marques admin:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Erreur getMarquesAdmin:", error);
      throw error;
    }
  },
  
  createMarque: async (formData) => {
    try {
      const response = await api.post("/marques/", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("✅ Marque créée:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Erreur createMarque:", error);
      throw error;
    }
  },
  
  updateMarque: async (id, formData) => {
    try {
      const response = await api.put(`/marques/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("✅ Marque mise à jour:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Erreur updateMarque:", error);
      throw error;
    }
  },
  
  deleteMarque: async (id) => {
    try {
      const response = await api.delete(`/marques/${id}/`);
      console.log("✅ Marque supprimée");
      return response;
    } catch (error) {
      console.error("❌ Erreur deleteMarque:", error);
      throw error;
    }
  },
  
  // ==================== MODELES ====================
 // src/services/api.js
// Assurez-vous que cette méthode existe et est correcte

// Modèles par marque
getModelesByMarque: async (marqueId) => {
  try {
    console.log(`📡 Récupération des modèles pour marque ID: ${marqueId}`);
    const response = await api.get(`/marquesuser/${marqueId}/modeles/`);
    console.log("✅ Modèles reçus:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur getModelesByMarque:", error);
    throw error;
  }
},
  
  getModeleById: async (modeleId) => {
    try {
      // Récupérer toutes les marques
      const marquesResponse = await api.get("/marquesuser/");
      const marques = extractData(marquesResponse);
      
      // Chercher le modèle dans toutes les marques
      for (const marque of marques) {
        const modelesResponse = await api.get(`/marquesuser/${marque.id}/modeles/`);
        const modeles = extractData(modelesResponse);
        const modele = modeles.find(m => m.id === parseInt(modeleId));
        if (modele) {
          return {
            ...modele,
            marque_nom: marque.nom,
            marque_id: marque.id
          };
        }
      }
      throw new Error("Modèle non trouvé");
    } catch (error) {
      console.error("❌ Erreur getModeleById:", error);
      throw error;
    }
  },
  
  // ==================== VOITURES ====================
  getVoituresPopulaires: async (limit = 6) => {
    const response = await api.get(`/voituresuser/populaires/?limit=${limit}`);
    console.log("🔍 Réponse brute API voitures populaires:", response.data);
    const data = extractData(response);
    console.log("📦 Données extraites voitures populaires:", data);
    return { ...response, data };
  },
  
  getVoitureDetail: async (id) => {
    const response = await api.get(`/voituresuser/${id}/`);
    return response;
  },
  
  getVoituresByModele: async (modeleId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const queryString = params.toString();
    const url = queryString 
      ? `/modelesuser/${modeleId}/voitures/?${queryString}`
      : `/modelesuser/${modeleId}/voitures/`;
    
    const response = await api.get(url);
    console.log("🔍 Voitures par modèle reçues:", response.data);
    const data = extractData(response);
    return { ...response, data };
  },




// Ajoutez ces méthodes dans apiService, après la section MARQUES

// ==================== MODELES (admin) ====================
getModelesAdmin: async () => {
  try {
    const response = await api.get("/modeles/");
    console.log("🔍 Réponse brute API modèles admin:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur getModelesAdmin:", error);
    throw error;
  }
},

createModele: async (formData) => {
  try {
    const response = await api.post("/modeles/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("✅ Modèle créé:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur createModele:", error);
    throw error;
  }
},

updateModele: async (id, formData) => {
  try {
    const response = await api.put(`/modeles/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("✅ Modèle mis à jour:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur updateModele:", error);
    throw error;
  }
},

deleteModele: async (id) => {
  try {
    const response = await api.delete(`/modeles/${id}/`);
    console.log("✅ Modèle supprimé");
    return response;
  } catch (error) {
    console.error("❌ Erreur deleteModele:", error);
    throw error;
  }
},
  
  // ==================== RECHERCHE ====================
  search: async (query) => {
    const response = await api.get(`/recherche/?q=${query}`);
    return response;
  },
  
  // ==================== CONTACT ====================
  getContactInfo: async () => {
    const response = await api.get("/contact/");
    return response;
  },
  
  // ==================== STATISTIQUES ====================
  getStats: async () => {
    const response = await api.get("/statistiques/");
    return response;
  },
  
  // ==================== AUTHENTIFICATION ====================
  login: async (credentials) => {
    const response = await api.post("/auth/login/", credentials);
    return response;
  },
  
  register: async (userData) => {
    const response = await api.post("/auth/register/", userData);
    return response;
  },
  
  logout: async (refreshToken) => {
    const response = await api.post("/auth/logout/", { refresh: refreshToken });
    return response;
  },
  
  // ==================== UTILISATEURS (admin) ====================
  getUtilisateurs: async () => {
    const response = await api.get("/utilisateurs/");
    return response;
  },
  
  changerRole: async (userId) => {
    const response = await api.post(`/utilisateurs/${userId}/changer_role/`);
    return response;
  },
  
  deleteUtilisateur: async (userId) => {
    const response = await api.delete(`/utilisateurs/${userId}/`);
    return response;
  },



// Ajoutez ces méthodes dans apiService, après la section MODELES

// ==================== VOITURES (admin) ====================
getVoituresAdmin: async () => {
  try {
    const response = await api.get("/voitures/");
    console.log("🔍 Réponse brute API voitures admin:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur getVoituresAdmin:", error);
    throw error;
  }
},

getVoitureById: async (id) => {
  try {
    const response = await api.get(`/voitures/${id}/`);
    return response;
  } catch (error) {
    console.error("❌ Erreur getVoitureById:", error);
    throw error;
  }
},

createVoiture: async (formData) => {
  try {
    const response = await api.post("/voitures/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("✅ Voiture créée:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur createVoiture:", error);
    throw error;
  }
},

updateVoiture: async (id, formData) => {
  try {
    const response = await api.put(`/voitures/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("✅ Voiture mise à jour:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur updateVoiture:", error);
    throw error;
  }
},

deleteVoiture: async (id) => {
  try {
    const response = await api.delete(`/voitures/${id}/`);
    console.log("✅ Voiture supprimée");
    return response;
  } catch (error) {
    console.error("❌ Erreur deleteVoiture:", error);
    throw error;
  }
},

 
// ==================== VOITURES ====================
getVoituresAdmin: async () => {
  const response = await api.get("/voitures/");
  return response;
},

getVoitureById: async (id) => {
  const response = await api.get(`/voitures/${id}/`);
  return response;
},

// src/services/api.js - Méthodes à vérifier/ajouter

// ==================== RÉSERVATIONS ====================
getReservations: async () => {
  try {
    const response = await api.get("/reservations/");
    console.log("🔍 Réservations reçues:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur getReservations:", error);
    throw error;
  }
},

// src/services/api.js
createReservation: async (data) => {
  try {
    // data doit contenir { voiture: id, utilisateur: id }
    const response = await api.post("/reservations/", data);
    console.log("✅ Réservation créée:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur createReservation:", error.response?.data || error);
    throw error;
  }
},

annulerReservation: async (reservationId) => {
  try {
    const response = await api.post(`/reservations/${reservationId}/annuler/`);
    console.log("✅ Réservation annulée");
    return response;
  } catch (error) {
    console.error("❌ Erreur annulerReservation:", error);
    throw error;
  }
},




// src/services/api.js - Vérifiez que cette méthode existe
getStats: async () => {
  try {
    const response = await api.get("/statistiques/");
    console.log("📊 Statistiques reçues:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Erreur getStats:", error);
    throw error;
  }
},



};

export default apiService;