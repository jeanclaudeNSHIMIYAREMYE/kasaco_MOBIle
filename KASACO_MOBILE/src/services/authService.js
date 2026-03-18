// IMPORT CORRECT - import direct de l'instance api
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🔄 Initialisation de authService.js');
console.log('🔍 api importé dans authService:', api ? 'OK' : 'UNDEFINED');
console.log('🔍 api.post disponible dans authService:', typeof api.post);

class AuthService {
  async login(email, password) {
    try {
      console.log('📡 Tentative connexion...', email);
      console.log('🔍 Utilisation de api.post:', typeof api.post);
      
      // Utilisation directe de api.post (pas api.default.post)
      const response = await api.post('/auth/login/', { email, password });
      console.log('✅ Réponse login reçue:', response.status);
      
      if (response.data.access) {
        await AsyncStorage.setItem('accessToken', response.data.access);
        await AsyncStorage.setItem('refreshToken', response.data.refresh);
        await AsyncStorage.setItem('userRole', response.data.user.role);
        await AsyncStorage.setItem('userId', String(response.data.user.id));
        
        if (response.data.user.first_name) {
          await AsyncStorage.setItem('userFirstName', response.data.user.first_name);
        }
        if (response.data.user.last_name) {
          await AsyncStorage.setItem('userLastName', response.data.user.last_name);
        }
      }
      return response.data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('📡 Tentative inscription...', userData.email);
      const response = await api.post('/auth/register/', userData);
      console.log('✅ Réponse inscription reçue:', response.status);
      
      if (response.data.access) {
        await AsyncStorage.setItem('accessToken', response.data.access);
        await AsyncStorage.setItem('refreshToken', response.data.refresh);
        await AsyncStorage.setItem('userRole', response.data.user.role);
        await AsyncStorage.setItem('userId', String(response.data.user.id));
        
        if (response.data.user.first_name) {
          await AsyncStorage.setItem('userFirstName', response.data.user.first_name);
        }
        if (response.data.user.last_name) {
          await AsyncStorage.setItem('userLastName', response.data.user.last_name);
        }
      }
      return response.data;
    } catch (error) {
      console.error('❌ Erreur register:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await api.post('/auth/logout/', { refresh: refreshToken });
        } catch (e) {
          console.error('Erreur lors de la déconnexion API:', e);
        }
      }
    } finally {
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userRole',
        'userId',
        'userFirstName',
        'userLastName'
      ]);
    }
  }
}

// Export direct de l'instance
const authService = new AuthService();
export default authService;