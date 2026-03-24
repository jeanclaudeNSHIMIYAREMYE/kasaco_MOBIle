// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const role = await AsyncStorage.getItem('userRole');
      const userId = await AsyncStorage.getItem('userId');
      const firstName = await AsyncStorage.getItem('userFirstName');
      const lastName = await AsyncStorage.getItem('userLastName');
      const email = await AsyncStorage.getItem('userEmail');
      
      if (token) {
        setUser({ 
          role, 
          id: userId,
          first_name: firstName,
          last_name: lastName,
          username: `${firstName} ${lastName}`.trim(),
          email: email
        });
      }
    } catch (error) {
      console.error('Erreur de vérification utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      const data = response.data;
      
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('userRole', data.user.role);
      await AsyncStorage.setItem('userId', String(data.user.id));
      await AsyncStorage.setItem('userFirstName', data.user.first_name || '');
      await AsyncStorage.setItem('userLastName', data.user.last_name || '');
      await AsyncStorage.setItem('userEmail', data.user.email || email);
      
      setUser({ 
        role: data.user.role,
        id: data.user.id,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        username: `${data.user.first_name} ${data.user.last_name}`.trim(),
        email: data.user.email || email
      });
      
      return data;
    } catch (error) {
      console.error('❌ Login erreur:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      const data = response.data;
      
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('userRole', data.user.role);
      await AsyncStorage.setItem('userId', String(data.user.id));
      await AsyncStorage.setItem('userFirstName', data.user.first_name || '');
      await AsyncStorage.setItem('userLastName', data.user.last_name || '');
      await AsyncStorage.setItem('userEmail', data.user.email || userData.email);
      
      setUser({ 
        role: data.user.role,
        id: data.user.id,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        username: `${data.user.first_name} ${data.user.last_name}`.trim(),
        email: data.user.email || userData.email
      });
      
      return data;
    } catch (error) {
      console.error('❌ Register erreur:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken }).catch(() => {});
      }
    } catch (error) {
      console.error('❌ Logout erreur:', error);
    } finally {
      await AsyncStorage.multiRemove([
        'accessToken', 'refreshToken', 'userRole', 'userId', 
        'userFirstName', 'userLastName', 'userEmail'
      ]);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};