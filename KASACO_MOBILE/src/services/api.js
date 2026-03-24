// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.54:8000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Création de l'instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

console.log('✅ Instance api créée avec succès');

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    } catch (error) {
      console.error('❌ Erreur intercepteur request:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erreur request:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ Erreur API:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });
    
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userRole',
        'userId',
        'userFirstName',
        'userLastName'
      ]);
    }
    
    return Promise.reject(error);
  }
);

// ==================== SERVICES API ====================

// Service d'authentification
const AuthService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login/', credentials);
      
      if (response.data) {
        await AsyncStorage.setItem('accessToken', response.data.access);
        await AsyncStorage.setItem('refreshToken', response.data.refresh);
        await AsyncStorage.setItem('userRole', response.data.role);
        await AsyncStorage.setItem('userId', String(response.data.user_id));
        await AsyncStorage.setItem('userFirstName', response.data.first_name);
        await AsyncStorage.setItem('userLastName', response.data.last_name);
        
        const redirectResponse = await this.getRedirectByRole();
        return {
          ...response.data,
          redirect: redirectResponse.redirect_url
        };
      }
      
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      await api.post('/auth/logout/', { refresh: refreshToken });
      
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userRole',
        'userId',
        'userFirstName',
        'userLastName'
      ]);
      
      return true;
    } catch (error) {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userRole',
        'userId',
        'userFirstName',
        'userLastName'
      ]);
      throw handleError(error);
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await api.post('/auth/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getRedirectByRole() {
    try {
      const response = await api.get('/auth/redirect/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getCurrentUser() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return null;
      
      const response = await api.get(`/utilisateurs/${userId}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour les voitures
const VoitureService = {
  async getAllVoitures() {
    try {
      const response = await api.get('/voitures/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getVoitureById(id) {
    try {
      const response = await api.get(`/voitures/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async createVoiture(voitureData) {
    try {
      const response = await api.post('/voitures/', voitureData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async updateVoiture(id, voitureData) {
    try {
      const response = await api.put(`/voitures/${id}/`, voitureData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async partialUpdateVoiture(id, voitureData) {
    try {
      const response = await api.patch(`/voitures/${id}/`, voitureData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async deleteVoiture(id) {
    try {
      const response = await api.delete(`/voitures/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPublicVoitures() {
    try {
      const response = await api.get('/voituresuser/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPublicVoitureById(id) {
    try {
      const response = await api.get(`/voituresuser/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // CORRIGÉ - Récupérer les voitures par modèle
  async getVoituresByModele(modeleId) {
    try {
      console.log(`🔍 Récupération des voitures pour le modèle ID: ${modeleId}`);
      const response = await api.get(`/voituresuser/?modele=${modeleId}`);
      console.log(`✅ ${response.data?.length || 0} voitures trouvées`);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur dans getVoituresByModele:", error);
      throw handleError(error);
    }
  }
};

// Service pour les marques
const MarqueService = {
  async getAllMarques() {
    try {
      const response = await api.get('/marques/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getMarqueById(id) {
    try {
      const response = await api.get(`/marques/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async createMarque(marqueData) {
    try {
      const response = await api.post('/marques/', marqueData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async updateMarque(id, marqueData) {
    try {
      const response = await api.put(`/marques/${id}/`, marqueData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async deleteMarque(id) {
    try {
      const response = await api.delete(`/marques/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPublicMarques() {
    try {
      const response = await api.get('/marquesuser/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPublicMarqueById(id) {
    try {
      const response = await api.get(`/marquesuser/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // CORRIGÉ - Récupérer les modèles d'une marque
  async getModelesByMarque(marqueId) {
    try {
      console.log(`🔍 Récupération des modèles pour la marque ID: ${marqueId}`);
      const response = await api.get(`/modelesuser/?marque=${marqueId}`);
      
      let modelesData = [];
      if (Array.isArray(response.data)) {
        modelesData = response.data;
      } else if (response.data && response.data.results) {
        modelesData = response.data.results;
      }
      
      console.log(`✅ ${modelesData.length} modèles trouvés pour la marque ${marqueId}`);
      return modelesData;
    } catch (error) {
      console.error("❌ Erreur dans getModelesByMarque:", error);
      throw handleError(error);
    }
  }
};

// Service pour les modèles - CORRIGÉ
const ModeleService = {
  async getAllModeles() {
    try {
      const response = await api.get('/modeles/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // CORRIGÉ - Récupérer directement les modèles par marque via API
  async getModelesByMarque(marqueId) {
    try {
      console.log(`🔍 ModeleService - Récupération des modèles pour marque ID: ${marqueId}`);
      const response = await api.get(`/modelesuser/?marque=${marqueId}`);
      
      let modelesData = [];
      if (Array.isArray(response.data)) {
        modelesData = response.data;
      } else if (response.data && response.data.results) {
        modelesData = response.data.results;
      }
      
      console.log(`✅ ModeleService - ${modelesData.length} modèles trouvés`);
      
      // Log pour débogage
      if (modelesData.length > 0) {
        console.log('📦 Premier modèle:', modelesData[0]);
      }
      
      return modelesData;
    } catch (error) {
      console.error("❌ Erreur dans getModelesByMarque:", error);
      throw handleError(error);
    }
  },

  async getModeleById(id) {
    try {
      const response = await api.get(`/modeles/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPublicModeleById(id) {
    try {
      const response = await api.get(`/modelesuser/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async createModele(modeleData) {
    try {
      const response = await api.post('/modeles/', modeleData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async updateModele(id, modeleData) {
    try {
      const response = await api.put(`/modeles/${id}/`, modeleData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async deleteModele(id) {
    try {
      const response = await api.delete(`/modeles/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPublicModeles() {
    try {
      const response = await api.get('/modelesuser/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour les réservations
const ReservationService = {
  async getAllReservations() {
    try {
      const response = await api.get('/reservations/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getReservationById(id) {
    try {
      const response = await api.get(`/reservations/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async createReservation(reservationData) {
    try {
      const response = await api.post('/reservations/', reservationData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async updateReservation(id, reservationData) {
    try {
      const response = await api.put(`/reservations/${id}/`, reservationData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async deleteReservation(id) {
    try {
      const response = await api.delete(`/reservations/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour les utilisateurs
const UtilisateurService = {
  async getAllUtilisateurs() {
    try {
      const response = await api.get('/utilisateurs/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getUtilisateurById(id) {
    try {
      const response = await api.get(`/utilisateurs/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async createUtilisateur(utilisateurData) {
    try {
      const response = await api.post('/utilisateurs/', utilisateurData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async updateUtilisateur(id, utilisateurData) {
    try {
      const response = await api.put(`/utilisateurs/${id}/`, utilisateurData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async deleteUtilisateur(id) {
    try {
      const response = await api.delete(`/utilisateurs/${id}/`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour les dashboards
const DashboardService = {
  async getAdminDashboard() {
    try {
      const response = await api.get('/dashboard/admin/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getUserHome() {
    try {
      const response = await api.get('/dashboard/user/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour le contact
const ContactService = {
  async getContactInfo() {
    try {
      const response = await api.get('/contact/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async updateContactInfo(contactData) {
    try {
      const response = await api.post('/contact/update/', contactData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour les statistiques
const StatistiqueService = {
  async getStatistiques() {
    try {
      const response = await api.get('/statistiques/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour la recherche
const RechercheService = {
  async rechercher(query) {
    try {
      const response = await api.get('/recherche/', { params: query });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Service pour les pages publiques
const PublicService = {
  async getHome() {
    try {
      const response = await api.get('/home/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async getPourquoiKasaco() {
    try {
      const response = await api.get('/pourquoi-kasaco/');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// Fonction utilitaire de gestion d'erreurs
function handleError(error) {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data.detail || error.response.data.message || 'Une erreur est survenue',
      data: error.response.data
    };
  } else if (error.request) {
    return {
      status: 503,
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.'
    };
  } else {
    return {
      status: 500,
      message: error.message || 'Une erreur inattendue est survenue'
    };
  }
}

// ==================== EXPORTATION ====================

export default api;

export {
  AuthService,
  VoitureService,
  MarqueService,
  ModeleService,
  ReservationService,
  UtilisateurService,
  DashboardService,
  ContactService,
  StatistiqueService,
  RechercheService,
  PublicService,
  handleError
};