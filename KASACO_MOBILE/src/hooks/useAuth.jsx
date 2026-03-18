import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService'; // ← Cet import est correct

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
      
      if (token) {
        setUser({ 
          role, 
          id: userId,
          first_name: firstName,
          last_name: lastName 
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
      console.log('🔑 Login hook appelé');
      console.log('🔍 authService:', authService);
      console.log('🔍 authService.login:', typeof authService.login);
      
      const data = await authService.login(email, password);
      console.log('✅ Login hook réussi');
      
      const firstName = await AsyncStorage.getItem('userFirstName');
      const lastName = await AsyncStorage.getItem('userLastName');
      
      setUser({ 
        role: data.user.role, 
        id: data.user.id,
        first_name: firstName || data.user.first_name,
        last_name: lastName || data.user.last_name
      });
      
      return data;
    } catch (error) {
      console.error('❌ Login hook erreur:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      
      setUser({ 
        role: data.user.role, 
        id: data.user.id,
        first_name: data.user.first_name,
        last_name: data.user.last_name
      });
      return data;
    } catch (error) {
      console.error('❌ Register hook erreur:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ Logout hook erreur:', error);
    } finally {
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