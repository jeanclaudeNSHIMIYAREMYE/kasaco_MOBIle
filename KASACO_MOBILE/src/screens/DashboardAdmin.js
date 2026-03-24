// src/screens/DashboardAdmin.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, VoitureService, UtilisateurService, ReservationService, MarqueService, ModeleService } from '../services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Fonction utilitaire pour extraire un tableau des données API
const extractArrayFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (data && data.results && Array.isArray(data.results)) return data.results;
  if (data && typeof data === 'object') {
    for (const key in data) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
};

// Composant de carte statistique
const StatCard = ({ title, value, icon, color, onPress, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const getGradientColors = () => {
    switch (color) {
      case 'red': return ['#ef4444', '#dc2626'];
      case 'blue': return ['#3b82f6', '#2563eb'];
      case 'green': return ['#10b981', '#059669'];
      case 'purple': return ['#8b5cf6', '#7c3aed'];
      case 'orange': return ['#f97316', '#ea580c'];
      default: return ['#ef4444', '#dc2626'];
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
      case 'orange': return '#f97316';
      default: return '#ef4444';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'red': return styles.redText;
      case 'blue': return styles.blueText;
      case 'green': return styles.greenText;
      case 'purple': return styles.purpleText;
      case 'orange': return styles.orangeText;
      default: return styles.redText;
    }
  };

  return (
    <Animated.View
      style={[
        styles.statCardContainer,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: scaleAnim,
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.statCard}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statCardGradient}
        />
        <View style={styles.statCardContent}>
          <View style={styles.statCardHeader}>
            <View style={styles.statCardIconContainer}>
              <Icon name={icon} size={24} color={getIconColor()} />
            </View>
            <Text style={[styles.statCardValue, getTextColor()]}>{value}</Text>
          </View>
          <Text style={styles.statCardTitle}>{title}</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>En ligne</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant d'action rapide
const QuickAction = ({ title, icon, color, description, onPress, delay = 0 }) => {
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.spring(translateYAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);

  const getBgColor = () => {
    switch (color) {
      case 'red': return styles.redBg;
      case 'blue': return styles.blueBg;
      case 'green': return styles.greenBg;
      case 'purple': return styles.purpleBg;
      case 'orange': return styles.orangeBg;
      default: return styles.grayBg;
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
      case 'orange': return '#f97316';
      default: return '#6b7280';
    }
  };

  return (
    <Animated.View
      style={[
        styles.quickActionContainer,
        {
          transform: [{ translateY: translateYAnim }],
          opacity: translateYAnim.interpolate({
            inputRange: [0, 30],
            outputRange: [1, 0],
          }),
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.quickAction}>
        <View style={styles.quickActionContent}>
          <View style={[styles.quickActionIconContainer, getBgColor()]}>
            <Icon name={icon} size={24} color={getIconColor()} />
          </View>
          <View style={styles.quickActionTextContainer}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionDescription}>{description}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de navigation
const NavItem = ({ title, icon, onPress, isActive }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navItem, isActive && styles.navItemActive]}>
      <View style={[styles.navIconContainer, isActive && styles.navIconContainerActive]}>
        <Icon name={icon} size={20} color={isActive ? '#ef4444' : '#6b7280'} />
      </View>
      <Text style={[styles.navText, isActive && styles.navTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function DashboardAdmin() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    utilisateurs: 0,
    voitures: 0,
    reservations: 0,
    marques: 0,
    modeles: 0,
    revenus: 0,
    voituresDisponibles: 0,
    voituresReservees: 0,
    tauxOccupation: 0
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useFocusEffect(
    React.useCallback(() => {
      checkAuthAndRole();
      return () => {};
    }, [])
  );

  const checkAuthAndRole = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      const userRole = await AsyncStorage.getItem('userRole');
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        navigation.replace('Dashboard');
        return;
      }
    } catch (error) {
      console.error('Erreur checkAuth:', error);
    }
  };

  useEffect(() => {
    loadUserData();
    fetchStats();
    setGreetingMessage();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -width,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [sidebarOpen]);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userFirstName = await AsyncStorage.getItem('userFirstName');
      const userLastName = await AsyncStorage.getItem('userLastName');
      const userRole = await AsyncStorage.getItem('userRole');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      setUser({
        id: userId,
        first_name: userFirstName,
        last_name: userLastName,
        role: userRole,
        email: userEmail,
        username: `${userFirstName} ${userLastName}`.trim() || 'Administrateur'
      });
    } catch (error) {
      console.error('Erreur chargement user:', error);
    }
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Récupération des utilisateurs
      let utilisateurs = [];
      try {
        const data = await UtilisateurService.getAllUtilisateurs();
        utilisateurs = extractArrayFromResponse(data);
      } catch (error) {
        if (error.status !== 403) console.error('Erreur utilisateurs:', error);
      }
      
      // Récupération des voitures
      let voitures = [];
      try {
        const data = await VoitureService.getAllVoitures();
        voitures = extractArrayFromResponse(data);
      } catch (error) {
        console.error('Erreur voitures:', error);
      }
      
      // Récupération des réservations
      let reservations = [];
      try {
        const data = await ReservationService.getAllReservations();
        reservations = extractArrayFromResponse(data);
      } catch (error) {
        console.error('Erreur réservations:', error);
      }
      
      // Récupération des marques
      let marques = [];
      try {
        const data = await MarqueService.getAllMarques();
        marques = extractArrayFromResponse(data);
      } catch (error) {
        console.error('Erreur marques:', error);
      }
      
      // Récupération des modèles
      let modeles = [];
      try {
        const data = await ModeleService.getAllModeles();
        modeles = extractArrayFromResponse(data);
      } catch (error) {
        console.error('Erreur modèles:', error);
      }
      
      // Calcul des statistiques supplémentaires
      const voituresDisponibles = voitures.filter(v => v.etat === 'Disponible').length;
      const voituresReservees = voitures.filter(v => v.etat === 'Réservée').length;
      const totalVoitures = voitures.length;
      const tauxOccupation = totalVoitures > 0 ? Math.round((voituresReservees / totalVoitures) * 100) : 0;

      setStats({
        utilisateurs: utilisateurs.length,
        voitures: totalVoitures,
        reservations: reservations.length,
        marques: marques.length,
        modeles: modeles.length,
        revenus: 0,
        voituresDisponibles,
        voituresReservees,
        tauxOccupation
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.replace('Login');
            } catch (error) {
              navigation.replace('Login');
            }
          }
        }
      ]
    );
  };

  const navigateTo = (screen) => {
    setSidebarOpen(false);
    navigation.navigate(screen);
  };

  // Cartes de statistiques avec ajout du lien vers les statistiques
  const statCards = [
    { title: 'Utilisateurs', value: stats.utilisateurs, icon: 'account-group', color: 'red', screen: 'AdminUtilisateurs' },
    { title: 'Voitures', value: stats.voitures, icon: 'car', color: 'blue', screen: 'AdminVoitures' },
    { title: 'Réservations', value: stats.reservations, icon: 'calendar-check', color: 'green', screen: 'AdminReservations' },
    { title: 'Marques', value: stats.marques, icon: 'tag', color: 'purple', screen: 'AdminMarques' },
    { title: 'Modèles', value: stats.modeles, icon: 'car-convertible', color: 'orange', screen: 'AdminModeles' },
    { title: 'Disponibles', value: stats.voituresDisponibles, icon: 'check-circle', color: 'green', screen: 'AdminVoitures' },
    { title: 'Réservées', value: stats.voituresReservees, icon: 'clock', color: 'orange', screen: 'AdminReservations' },
    { title: 'Occupation', value: `${stats.tauxOccupation}%`, icon: 'percent', color: 'purple', screen: 'AdminStatistiques' }, // AJOUTÉ
  ];

  // Actions rapides
  const quickActions = [
    { title: 'Ajouter une voiture', icon: 'plus-circle', color: 'red', description: 'Nouveau véhicule', screen: 'AjouterVoiture' },
    { title: 'Nouvelle marque', icon: 'plus-circle', color: 'blue', description: 'Ajouter une marque', screen: 'AjouterMarque' },
    { title: 'Créer un modèle', icon: 'car-convertible', color: 'green', description: 'Nouveau modèle', screen: 'AjouterModele' },
    { title: 'Voir les réservations', icon: 'calendar-month', color: 'purple', description: 'Gestion des réservations', screen: 'AdminReservations' },
    { title: 'Voir les statistiques', icon: 'chart-line', color: 'orange', description: 'Analyses détaillées', screen: 'AdminStatistiques' }, // AJOUTÉ
  ];

  // Navigation items avec ajout du lien vers les statistiques
  const navItems = [
    { title: 'Tableau de bord', icon: 'view-dashboard', screen: 'DashboardAdmin', key: 'dashboard' },
    { title: 'Utilisateurs', icon: 'account-group', screen: 'AdminUtilisateurs', key: 'utilisateurs' },
    { title: 'Marques', icon: 'tag', screen: 'AdminMarques', key: 'marques' },
    { title: 'Modèles', icon: 'car-convertible', screen: 'AdminModeles', key: 'modeles' },
    { title: 'Voitures', icon: 'car', screen: 'AdminVoitures', key: 'voitures' },
    { title: 'Réservations', icon: 'calendar-check', screen: 'AdminReservations', key: 'reservations' },
    { title: 'Statistiques', icon: 'chart-line', screen: 'AdminStatistiques', key: 'statistiques' }, // AJOUTÉ
  ];

  const totalItems = stats.utilisateurs + stats.voitures + stats.marques + stats.modeles;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.decorTopRight} />
      <View style={styles.decorBottomLeft} />
      
      <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuButton}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>{greeting},</Text>
              <Text style={styles.usernameText}>{user?.username || 'Administrateur'}</Text>
            </View>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.dashboardTitle}>Tableau de bord</Text>
        <Text style={styles.dashboardSubtitle}>
          Bienvenue sur votre espace de gestion KASACO · {totalItems} éléments
        </Text>
      </LinearGradient>

      {sidebarOpen && (
        <TouchableOpacity activeOpacity={1} onPress={() => setSidebarOpen(false)} style={styles.overlay} />
      )}

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <BlurView intensity={95} tint="light" style={styles.sidebarContent}>
          <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.sidebarHeader}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <Text style={styles.sidebarUsername}>{user?.username || 'Administrateur'}</Text>
            <Text style={styles.sidebarRole}>Administrateur</Text>
          </LinearGradient>

          <ScrollView style={styles.sidebarNav}>
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                title={item.title}
                icon={item.icon}
                onPress={() => navigateTo(item.screen)}
                isActive={activeNav === item.key}
              />
            ))}
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <View style={styles.logoutIconContainer}>
                <Icon name="logout" size={20} color="#ef4444" />
              </View>
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </ScrollView>
        </BlurView>
      </Animated.View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />}
        style={styles.mainContent}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <View style={styles.statsGrid}>
            {statCards.map((card, index) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                onPress={() => navigateTo(card.screen)}
                delay={index * 100}
              />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Actions rapides</Text>
            </View>
            {quickActions.map((action, index) => (
              <QuickAction
                key={action.title}
                title={action.title}
                icon={action.icon}
                color={action.color}
                description={action.description}
                onPress={() => navigateTo(action.screen)}
                delay={index * 100}
              />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Gestion complète</Text>
            </View>
            {navItems.slice(1).map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => navigateTo(item.screen)}
                style={styles.managementCard}
                activeOpacity={0.8}
              >
                <View style={styles.managementCardContent}>
                  <View style={styles.managementIconContainer}>
                    <Icon name={item.icon} size={24} color="#ef4444" />
                  </View>
                  <View style={styles.managementTextContainer}>
                    <Text style={styles.managementTitle}>{item.title}</Text>
                    <Text style={styles.managementDescription}>
                      Gérer les {item.title.toLowerCase()}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Informations administrateur</Text>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
                <Text style={styles.infoValue}>{user?.username || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rôle</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>Administrateur</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID Utilisateur</Text>
                <Text style={styles.infoValue}>{user?.id || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 16, color: '#6b7280' },
  decorTopRight: { position: 'absolute', top: 0, right: 0, width: 256, height: 256, backgroundColor: '#fecaca', borderRadius: 128, opacity: 0.2, transform: [{ translateY: -128 }, { translateX: 128 }] },
  decorBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 256, height: 256, backgroundColor: '#c7d2fe', borderRadius: 128, opacity: 0.2, transform: [{ translateY: 128 }, { translateX: -128 }] },
  header: { paddingTop: 48, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userTextContainer: { marginRight: 12, alignItems: 'flex-end' },
  greetingText: { color: 'white', fontSize: 10, opacity: 0.8 },
  usernameText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  dashboardTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  dashboardSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: width * 0.8, zIndex: 20 },
  sidebarContent: { flex: 1 },
  sidebarHeader: { paddingTop: 48, paddingBottom: 24, alignItems: 'center', justifyContent: 'center' },
  sidebarAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sidebarAvatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  sidebarUsername: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  sidebarRole: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  sidebarNav: { flex: 1, padding: 16 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 4 },
  navItemActive: { backgroundColor: '#fee2e2' },
  navIconContainer: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#f3f4f6' },
  navIconContainerActive: { backgroundColor: '#fecaca' },
  navText: { fontWeight: '500', color: '#374151' },
  navTextActive: { color: '#ef4444' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  logoutIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoutText: { fontWeight: '500', color: '#ef4444' },
  mainContent: { flex: 1 },
  contentContainer: { padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCardContainer: { width: '48%', marginBottom: 16 },
  statCard: { backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  statCardGradient: { height: 4 },
  statCardContent: { padding: 20 },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statCardIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  statCardValue: { fontSize: 24, fontWeight: 'bold' },
  redText: { color: '#ef4444' }, blueText: { color: '#3b82f6' }, greenText: { color: '#10b981' }, purpleText: { color: '#8b5cf6' }, orangeText: { color: '#f97316' },
  statCardTitle: { color: '#4b5563', fontWeight: '500', fontSize: 16 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 8 },
  statusText: { fontSize: 10, color: '#9ca3af' },
  quickActionContainer: { marginBottom: 12 },
  quickAction: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  quickActionContent: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  quickActionIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  redBg: { backgroundColor: '#fee2e2' }, blueBg: { backgroundColor: '#dbeafe' }, greenBg: { backgroundColor: '#d1fae5' }, purpleBg: { backgroundColor: '#ede9fe' }, orangeBg: { backgroundColor: '#ffedd5' }, grayBg: { backgroundColor: '#f9fafb' },
  quickActionTextContainer: { flex: 1 },
  quickActionTitle: { fontWeight: 'bold', color: '#1f2937', fontSize: 16 },
  quickActionDescription: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { marginTop: 24, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIndicator: { width: 4, height: 24, backgroundColor: '#ef4444', borderRadius: 2, marginRight: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  managementCard: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 12 },
  managementCardContent: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  managementIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff5f5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  managementTextContainer: { flex: 1 },
  managementTitle: { fontWeight: 'bold', color: '#1f2937', fontSize: 16 },
  managementDescription: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  infoCard: { backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, padding: 24, marginBottom: 32 },
  infoContent: { marginTop: 8 },
  infoRow: { marginBottom: 16 },
  infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  infoValue: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  roleBadge: { backgroundColor: '#fee2e2', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: '#ef4444', fontWeight: '600', fontSize: 12 },
});