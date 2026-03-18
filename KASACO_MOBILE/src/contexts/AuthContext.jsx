import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE_URL = 'http://192.168.1.54:8000/api'; // À remplacer par votre URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('🔍 Chargement des données utilisateur...');
        const token = await AsyncStorage.getItem('accessToken');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            console.log('✅ Utilisateur chargé:', parsedUser.email);
          } catch (e) {
            console.error('❌ Erreur parsing user data:', e);
            await AsyncStorage.removeItem('user');
          }
        } else {
          console.log('ℹ️ Aucun utilisateur connecté');
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      console.log('📡 Tentative de connexion...', credentials.email);
      
      const response = await api.post('/auth/login/', credentials);
      console.log('✅ Réponse reçue:', response.status);
      
      const { access, refresh, user } = response.data;

      // Stocker dans AsyncStorage
      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Stocker aussi séparément pour un accès facile
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userId', String(user.id));
      if (user.first_name) await AsyncStorage.setItem('userFirstName', user.first_name);
      if (user.last_name) await AsyncStorage.setItem('userLastName', user.last_name);

      setUser(user);
      return { success: true, user };
      
    } catch (err) {
      console.error('❌ Erreur login:', err);
      
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (err.response) {
        // La requête a été faite mais le serveur a répondu avec un statut d'erreur
        console.error('Détails:', err.response.data);
        errorMessage = err.response.data?.detail || 
                      err.response.data?.message || 
                      err.response.data?.non_field_errors?.[0] ||
                      errorMessage;
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMessage = 'Erreur de connexion';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      console.log('📡 Tentative d\'inscription...');
      
      const response = await api.post('/auth/register/', userData);
      console.log('✅ Réponse reçue:', response.status);
      
      const { access, refresh, user } = response.data;

      // Stocker dans AsyncStorage
      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Stocker aussi séparément
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userId', String(user.id));
      if (user.first_name) await AsyncStorage.setItem('userFirstName', user.first_name);
      if (user.last_name) await AsyncStorage.setItem('userLastName', user.last_name);

      setUser(user);
      return { success: true, user };
      
    } catch (err) {
      console.error('❌ Erreur register:', err);
      
      let errorMessage = "Erreur lors de l'inscription";
      
      if (err.response) {
        console.error('Détails:', err.response.data);
        
        // Gérer les erreurs de validation Django
        const data = err.response.data;
        if (data.email) errorMessage = data.email[0];
        else if (data.username) errorMessage = data.username[0];
        else if (data.password) errorMessage = data.password[0];
        else if (data.non_field_errors) errorMessage = data.non_field_errors[0];
        else if (data.detail) errorMessage = data.detail;
        else if (data.message) errorMessage = data.message;
      } else if (err.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      console.log('📡 Déconnexion...');
      
      // Optionnel : appeler l'API de déconnexion
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await api.post('/auth/logout/', { refresh: refreshToken });
        } catch (e) {
          console.error('❌ Erreur lors de la déconnexion API:', e);
        }
      }
    } catch (error) {
      console.error('❌ Erreur logout:', error);
    } finally {
      // Nettoyer le stockage dans tous les cas
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'user',
        'userRole',
        'userId',
        'userFirstName',
        'userLastName'
      ]);
      
      setUser(null);
      console.log('✅ Déconnexion réussie');
    }
  };

  // Rafraîchir le token (optionnel)
  const refreshToken = async () => {
    try {
      const refresh = await AsyncStorage.getItem('refreshToken');
      if (!refresh) return false;

      const response = await api.post('/auth/token/refresh/', { refresh });
      const { access } = response.data;

      await AsyncStorage.setItem('accessToken', access);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      await logout(); // Déconnecter si le refresh échoue
      return false;
    }
  };

  // Mettre à jour les infos utilisateur
  const updateUser = async (newUserData) => {
    try {
      setUser(prev => ({ ...prev, ...newUserData }));
      await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...newUserData }));
    } catch (error) {
      console.error('❌ Erreur update user:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    isUser: user?.role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};