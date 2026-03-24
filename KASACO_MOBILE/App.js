// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import Navigation from './src/components/Navigation';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';

// ==================== ÉCRANS PUBLICS ====================
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

import PourquoiKasacoScreen from './src/screens/PourquoiKasacoScreen';
import Marques from './src/screens/Marques';

// ==================== NOUVEAUX ÉCRANS ====================
import Modeles from './src/screens/Modeles';
import RechercheModele from './src/screens/RechercheModele';
import VoitureDetail from './src/screens/VoitureDetail';

// ==================== ÉCRANS UTILISATEUR ====================
import DashboardScreen from './src/screens/DashboardScreen';


import MesReservations from './src/screens/MesReservations';

// ==================== ÉCRANS ADMIN ====================
import DashboardAdmin from './src/screens/DashboardAdmin';
import AdminUtilisateurs from './src/screens/admin/AdminUtilisateurs';
import AdminMarques from './src/screens/admin/AdminMarques';
import AdminModeles from './src/screens/admin/AdminModeles';
import AdminVoitures from './src/screens/admin/AdminVoitures';
import AdminReservations from './src/screens/admin/AdminReservations';
import AdminStatistiques from './src/screens/admin/AdminStatistiques';
import AjouterVoiture from './src/screens/admin/AjouterVoiture';
import ReserverVoiture from './src/screens/admin/ReserverVoiture';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#ef4444" />
    <View style={styles.loadingContent}>
      <ActivityIndicator size="large" color="#ef4444" />
      <Text style={styles.loadingText}>Chargement de KASACO...</Text>
    </View>
  </View>
);

function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (loading) return <LoadingScreen />;

  return (
    <Navigation>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? 'Dashboard' : 'Home'} 
        screenOptions={{ 
          headerShown: false, 
          cardStyle: { backgroundColor: '#f5f5f5' } 
        }}
      >
        {/* ================= SECTION PUBLIQUE ================= */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Marques" component={Marques} />
        <Stack.Screen name="PourquoiKasaco" component={PourquoiKasacoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
     
        
        {/* ================= NOUVEAUX ÉCRANS REMPLACÉS ================= */}
        <Stack.Screen name="Modeles" component={Modeles} />
        <Stack.Screen name="RechercheModele" component={RechercheModele} />
        <Stack.Screen name="VoitureDetail" component={VoitureDetail} />

        {/* ================= SECTION UTILISATEUR ================= */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      
        <Stack.Screen name="MesReservations" component={MesReservations} />

        {/* ================= SECTION ADMIN ================= */}
        <Stack.Screen name="DashboardAdmin" component={DashboardAdmin} />
        <Stack.Screen name="AdminUtilisateurs" component={AdminUtilisateurs} />
        <Stack.Screen name="AdminMarques" component={AdminMarques} />
        <Stack.Screen name="AdminModeles" component={AdminModeles} />
        <Stack.Screen name="AdminVoitures" component={AdminVoitures} />
        <Stack.Screen name="AdminReservations" component={AdminReservations} />
        <Stack.Screen name="AdminStatistiques" component={AdminStatistiques} />
        <Stack.Screen name="AjouterVoiture" component={AjouterVoiture} />
        <Stack.Screen name="ReserverVoiture" component={ReserverVoiture} />
      </Stack.Navigator>
    </Navigation>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#ef4444" translucent={false} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingContent: { 
    alignItems: 'center', 
    gap: 20 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 10 
  },
});