import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import Navigation from './src/components/Navigation';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';

// Import de vos écrans existants
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import des nouveaux écrans
import VoitureDetailScreen from './src/screens/VoitureDetailScreen';
import ModelesScreen from './src/screens/ModelesScreen';
import ContactScreen from './src/screens/ContactScreen';
import FavorisScreen from './src/screens/FavorisScreen';
import SearchScreen from './src/screens/SearchScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

const Stack = createStackNavigator();

// Écran de chargement
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#ef4444" />
    <View style={styles.loadingContent}>
      <ActivityIndicator size="large" color="#ef4444" />
      <Text style={styles.loadingText}>Chargement de KASACO...</Text>
    </View>
  </View>
);

// Navigation principale
function AppNavigator() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Cacher le splash screen après 2 secondes
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Navigation>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? 'Dashboard' : 'Home'}
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        {/* Écrans publics */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />

        {/* Écrans protégés */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="VoitureDetail" component={VoitureDetailScreen} />
        <Stack.Screen name="Modeles" component={ModelesScreen} />
        <Stack.Screen name="Favoris" component={FavorisScreen} />
      </Stack.Navigator>
    </Navigation>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#ef4444"
          translucent={false}
        />
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
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});