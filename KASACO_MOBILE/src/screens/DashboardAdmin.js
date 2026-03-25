// src/screens/DashboardAdmin.js
import React, { useState, useEffect } from 'react';
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

// Composant d'action rapide
const QuickAction = ({ title, icon, color, description, onPress, delay = 0 }) => {
  const translateYAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.spring(translateYAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const getBgColor = () => {
    switch (color) {
      case 'red': return styles.redBg;
      case 'blue': return styles.blueBg;
      case 'green': return styles.greenBg;
      case 'purple': return styles.purpleBg;
      default: return styles.grayBg;
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
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

// Composant principal
export default function DashboardAdmin() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  useFocusEffect(
    React.useCallback(() => {
      checkAuth();
      return () => {};
    }, [])
  );

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }
    } catch (error) {
      console.error('Erreur checkAuth:', error);
    }
  };

  useEffect(() => {
    loadUserData();
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
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const userFirstName = await AsyncStorage.getItem('userFirstName');
      const userLastName = await AsyncStorage.getItem('userLastName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userRole = await AsyncStorage.getItem('userRole');
      
      setUser({
        id: userId,
        first_name: userFirstName,
        last_name: userLastName,
        email: userEmail || 'admin@kasaco.com',
        role: userRole,
        fullName: `${userFirstName} ${userLastName}`.trim() || 'Administrateur'
      });
    } catch (error) {
      console.error('Erreur chargement user:', error);
    } finally {
      setLoading(false);
    }
  };

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
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
              console.error('Erreur déconnexion:', error);
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

  // ACTIONS RAPIDES - Liens correspondants
  const quickActions = [
    { title: 'Ajouter une voiture', icon: 'plus-circle', color: 'red', description: 'Ajouter un nouveau véhicule', screen: 'AjouterVoiture' },
    { title: 'Gérer les marques', icon: 'tag', color: 'blue', description: 'Ajouter ou modifier une marque', screen: 'AdminMarques' },
    { title: 'Gérer les modèles', icon: 'car-convertible', color: 'green', description: 'Ajouter ou modifier un modèle', screen: 'AdminModeles' },
    { title: 'Gérer les réservations', icon: 'calendar-month', color: 'purple', description: 'Voir et gérer les réservations', screen: 'AdminReservations' },
    { title: 'Gérer les utilisateurs', icon: 'account-group', color: 'orange', description: 'Gérer les comptes utilisateurs', screen: 'AdminUtilisateurs' },
  ];

  // NAVIGATION ITEMS
  const navItems = [
    { title: 'Tableau de bord', icon: 'view-dashboard', screen: 'DashboardAdmin', key: 'dashboard' },
    { title: 'Utilisateurs', icon: 'account-group', screen: 'AdminUtilisateurs', key: 'utilisateurs' },
    { title: 'Marques', icon: 'tag', screen: 'AdminMarques', key: 'marques' },
    { title: 'Modèles', icon: 'car-convertible', screen: 'AdminModeles', key: 'modeles' },
    { title: 'Voitures', icon: 'car', screen: 'AdminVoitures', key: 'voitures' },
    { title: 'Réservations', icon: 'calendar-check', screen: 'AdminReservations', key: 'reservations' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Éléments décoratifs */}
      <View style={styles.decorTopRight} />
      <View style={styles.decorBottomLeft} />
      
      {/* Header */}
      <LinearGradient
        colors={['#ef4444', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuButton}>
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>{greeting},</Text>
              <Text style={styles.usernameText}>{user?.fullName || 'Administrateur'}</Text>
            </View>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.dashboardTitle}>Tableau de bord</Text>
        <Text style={styles.dashboardSubtitle}>
          Bienvenue sur votre espace de gestion KASACO
        </Text>
      </LinearGradient>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
          style={styles.overlay}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <BlurView intensity={95} tint="light" style={styles.sidebarContent}>
          <LinearGradient
            colors={['#ef4444', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sidebarHeader}
          >
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <Text style={styles.sidebarUsername}>{user?.fullName || 'Administrateur'}</Text>
            <Text style={styles.sidebarEmail}>{user?.email || 'admin@kasaco.com'}</Text>
            <View style={styles.sidebarRoleBadge}>
              <Text style={styles.sidebarRoleText}>Administrateur</Text>
            </View>
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

      {/* Contenu principal */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />
        }
        style={styles.mainContent}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          
          {/* Actions rapides */}
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

          {/* Gestion complète */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Gestion complète</Text>
            </View>
            {navItems.slice(1).map((item, index) => (
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

          {/* Informations administrateur - avec EMAIL au lieu du username */}
          <View style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Informations administrateur</Text>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>{user?.fullName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Adresse email</Text>
                <Text style={styles.infoEmail}>{user?.email || 'admin@kasaco.com'}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  decorTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 256,
    height: 256,
    backgroundColor: '#fecaca',
    borderRadius: 128,
    opacity: 0.2,
    transform: [{ translateY: -128 }, { translateX: 128 }],
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 256,
    height: 256,
    backgroundColor: '#c7d2fe',
    borderRadius: 128,
    opacity: 0.2,
    transform: [{ translateY: 128 }, { translateX: -128 }],
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
  greetingText: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
  },
  usernameText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dashboardTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  dashboardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    zIndex: 20,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarHeader: {
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sidebarAvatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sidebarUsername: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  sidebarEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 8,
  },
  sidebarRoleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sidebarRoleText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  sidebarNav: {
    flex: 1,
    padding: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#fee2e2',
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  navIconContainerActive: {
    backgroundColor: '#fecaca',
  },
  navText: {
    fontWeight: '500',
    color: '#374151',
  },
  navTextActive: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontWeight: '500',
    color: '#ef4444',
  },
  mainContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  quickActionContainer: {
    marginBottom: 12,
  },
  quickAction: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  redBg: { backgroundColor: '#fee2e2' },
  blueBg: { backgroundColor: '#dbeafe' },
  greenBg: { backgroundColor: '#d1fae5' },
  purpleBg: { backgroundColor: '#ede9fe' },
  grayBg: { backgroundColor: '#f9fafb' },
  orangeBg: { backgroundColor: '#ffedd5' },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 24,
    backgroundColor: '#ef4444',
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  managementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  managementCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  managementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  managementTextContainer: {
    flex: 1,
  },
  managementTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  managementDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    padding: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  infoContent: {
    marginTop: 8,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
  roleBadge: {
    backgroundColor: '#fee2e2',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 12,
  },
});