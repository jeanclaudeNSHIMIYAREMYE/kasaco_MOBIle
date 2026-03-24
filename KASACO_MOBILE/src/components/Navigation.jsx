// src/components/Navigation.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
  Image,
  StatusBar,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Import du logo
const logo = require('../../assets/icon.png');

// Palette de couleurs moderne
const Colors = {
  primary: '#ef4444',
  primaryDark: '#dc2626',
  secondary: '#ffffff',
  secondaryDark: '#f8f9fa',
  background: '#ffffff',
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    light: '#9ca3af',
    white: '#ffffff',
    dark: '#111827',
  },
  whatsapp: '#25D366',
  border: '#e5e7eb',
  shadow: '#000000',
};

export default function Navigation({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation();

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Animation pour le menu mobile
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isMobileMenuOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isMobileMenuOpen]);

  // Détection du scroll
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setScrolled(value > 20);
    });
    return () => scrollY.removeListener(listener);
  }, []);

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
              await logout();
              setIsMobileMenuOpen(false);
              navigation.navigate('Home');
            } catch (error) {
              console.error('Erreur logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleWhatsApp = (phone) => {
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url).catch(() => 
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp')
    );
  };

  const handleNavigation = (screen) => {
    setIsMobileMenuOpen(false);
    navigation.navigate(screen);
  };

  // ==================== LIENS DE NAVIGATION PAR RÔLE ====================
  
  // Liens publics (toujours visibles)
  const publicLinks = [
    { to: "Home", icon: "home-outline", label: "Accueil" },
    { to: "PourquoiKasaco", icon: "information-circle-outline", label: "Pourquoi KASACO" },
  ];

  // Liens pour utilisateur connecté (non admin) - SANS Tableau de bord
  const userLinks = isAuthenticated && !isAdmin ? [
    { to: "MesReservations", icon: "calendar-check", label: "Mes réservations" },
  ] : [];

  // Liens pour administrateur (tous les onglets admin)
  const adminLinks = isAdmin ? [
    { to: "DashboardAdmin", icon: "shield-checkmark-outline", label: "Tableau de bord" },
    { to: "AdminStatistiques", icon: "chart-line", label: "Statistiques" },
    { to: "AdminUtilisateurs", icon: "people-outline", label: "Utilisateurs" },
    { to: "AdminMarques", icon: "pricetag-outline", label: "Marques" },
    { to: "AdminModeles", icon: "car-sport-outline", label: "Modèles" },
    { to: "AdminVoitures", icon: "car-outline", label: "Voitures" },
    { to: "AdminReservations", icon: "calendar-outline", label: "Réservations" },
  ] : [];

  // Tous les liens selon le rôle
  const allLinks = [...publicLinks, ...userLinks, ...adminLinks];

  // Couleurs navbar
  const navbarStyle = scrolled 
    ? { backgroundColor: Colors.secondary, shadowOpacity: 0.1, elevation: 4 }
    : { backgroundColor: Colors.secondary, shadowOpacity: 0 };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.secondary}
        translucent={false}
      />
      
      {/* Navbar */}
      <Animated.View style={[
        styles.navbar,
        navbarStyle,
        scrolled && styles.navbarShadow
      ]}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          <View style={styles.navbarContent}>
            {/* Logo */}
            <TouchableOpacity
              onPress={() => handleNavigation('Home')}
              style={styles.logoContainer}
              activeOpacity={0.7}
            >
              <Image source={logo} style={styles.logo} />
              <Text style={[styles.logoText, { color: Colors.primary }]}>
                KASACO
              </Text>
            </TouchableOpacity>

            {/* Menu Desktop */}
            <View style={styles.desktopMenu}>
              {allLinks.map((link) => (
                <TouchableOpacity
                  key={link.to}
                  onPress={() => handleNavigation(link.to)}
                  style={styles.navLink}
                  activeOpacity={0.7}
                >
                  <Icon name={link.icon} size={18} color={Colors.text.secondary} />
                  <Text style={styles.navLinkText}>{link.label}</Text>
                </TouchableOpacity>
              ))}

              {/* Boutons auth */}
              <View style={styles.authButtons}>
                {isAuthenticated ? (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="log-out-outline" size={18} color={Colors.primary} />
                    <Text style={styles.logoutButtonText}>Déconnexion</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleNavigation('Login')}
                      style={styles.loginButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.loginButtonText}>Connexion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleNavigation('Register')}
                      style={styles.signupButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.signupButtonText}>Inscription</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Menu Button Mobile */}
            <TouchableOpacity
              onPress={() => setIsMobileMenuOpen(true)}
              style={styles.menuButton}
              activeOpacity={0.7}
            >
              <Icon name="menu-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Menu Mobile Modal */}
      <Modal
        visible={isMobileMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMobileMenuOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMobileMenuOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                {/* En-tête du modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalLogoContainer}>
                    <Image source={logo} style={styles.modalLogo} />
                    <Text style={styles.modalLogoText}>KASACO</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsMobileMenuOpen(false)}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="close-outline" size={24} color={Colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Profil utilisateur si connecté */}
                  {isAuthenticated && user && (
                    <View style={styles.profileSection}>
                      <View style={styles.profileAvatar}>
                        <Text style={styles.profileInitial}>
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>
                      <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user.username}</Text>
                        <Text style={styles.profileEmail}>{user.email}</Text>
                        {isAdmin && (
                          <View style={styles.adminBadge}>
                            <Icon name="shield-checkmark" size={12} color={Colors.primary} />
                            <Text style={styles.adminBadgeText}>Administrateur</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Section Navigation - Liens publics */}
                  <Text style={styles.modalSectionTitle}>NAVIGATION</Text>
                  {publicLinks.map((link) => (
                    <TouchableOpacity
                      key={link.to}
                      onPress={() => handleNavigation(link.to)}
                      style={styles.modalNavItem}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalNavIcon}>
                        <Icon name={link.icon} size={22} color={Colors.primary} />
                      </View>
                      <Text style={styles.modalNavText}>{link.label}</Text>
                      <Icon name="chevron-forward-outline" size={18} color={Colors.text.light} />
                    </TouchableOpacity>
                  ))}

                  {/* Section Mon compte - Pour utilisateur normal (non admin) - SANS Tableau de bord */}
                  {isAuthenticated && !isAdmin && (
                    <>
                      <Text style={styles.modalSectionTitle}>MON COMPTE</Text>
                      {userLinks.map((link) => (
                        <TouchableOpacity
                          key={link.to}
                          onPress={() => handleNavigation(link.to)}
                          style={styles.modalNavItem}
                          activeOpacity={0.7}
                        >
                          <View style={styles.modalNavIcon}>
                            <Icon name={link.icon} size={22} color={Colors.primary} />
                          </View>
                          <Text style={styles.modalNavText}>{link.label}</Text>
                          <Icon name="chevron-forward-outline" size={18} color={Colors.text.light} />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* Section Administration - Pour admin seulement */}
                  {isAdmin && (
                    <>
                      <Text style={[styles.modalSectionTitle, styles.adminSectionTitle]}>ADMINISTRATION</Text>
                      {adminLinks.map((link) => (
                        <TouchableOpacity
                          key={link.to}
                          onPress={() => handleNavigation(link.to)}
                          style={[styles.modalNavItem, styles.adminNavItem]}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.modalNavIcon, styles.adminIcon]}>
                            <Icon name={link.icon} size={22} color={Colors.primary} />
                          </View>
                          <Text style={[styles.modalNavText, styles.adminText]}>{link.label}</Text>
                          <Icon name="chevron-forward-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  <View style={styles.modalDivider} />

                  {/* Section Connexion / Déconnexion */}
                  <Text style={styles.modalSectionTitle}>COMPTE</Text>
                  
                  {isAuthenticated ? (
                    <TouchableOpacity
                      onPress={handleLogout}
                      style={styles.modalLogoutButton}
                      activeOpacity={0.7}
                    >
                      <Icon name="log-out-outline" size={22} color={Colors.primary} />
                      <Text style={styles.modalLogoutText}>Déconnexion</Text>
                      <Icon name="chevron-forward-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => handleNavigation('Login')}
                        style={styles.modalAuthButton}
                        activeOpacity={0.7}
                      >
                        <Icon name="log-in-outline" size={22} color={Colors.primary} />
                        <Text style={styles.modalAuthText}>Connexion</Text>
                        <Icon name="chevron-forward-outline" size={18} color={Colors.text.light} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleNavigation('Register')}
                        style={styles.modalAuthButton}
                        activeOpacity={0.7}
                      >
                        <Icon name="person-add-outline" size={22} color={Colors.primary} />
                        <Text style={styles.modalAuthText}>Inscription</Text>
                        <Icon name="chevron-forward-outline" size={18} color={Colors.text.light} />
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Section contact rapide */}
                  <View style={styles.modalContactSection}>
                    <Text style={styles.modalContactTitle}>Besoin d'aide ?</Text>
                    <TouchableOpacity
                      onPress={() => handleWhatsApp('25776543210')}
                      style={styles.modalWhatsAppButton}
                      activeOpacity={0.7}
                    >
                      <Icon name="logo-whatsapp" size={22} color={Colors.whatsapp} />
                      <Text style={styles.modalWhatsAppText}>WhatsApp</Text>
                      <Icon name="chevron-forward-outline" size={18} color={Colors.whatsapp} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Contenu principal */}
      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.mainContent, 
          scrolled && styles.mainContentScrolled
        ]}>
          {children}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: Colors.secondary,
  },
  navbarShadow: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  safeArea: {
    width: '100%',
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  desktopMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    display: width > 768 ? 'flex' : 'none',
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
  },
  navLinkText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  loginButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  signupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  signupButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    display: width > 768 ? 'none' : 'flex',
  },
  content: {
    flex: 1,
    marginTop: 64,
  },
  contentContainer: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mainContentScrolled: {
    paddingTop: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.5,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  profileEmail: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 16,
  },
  adminSectionTitle: {
    color: Colors.primary,
  },
  modalNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#f9fafb',
  },
  modalNavIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNavText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  adminNavItem: {
    backgroundColor: '#fee2e2',
  },
  adminIcon: {
    backgroundColor: '#fff',
  },
  adminText: {
    color: Colors.primary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  modalAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  modalAuthText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  modalLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  modalLogoutText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  modalContactSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalContactTitle: {
    color: Colors.text.secondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  modalWhatsAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
  },
  modalWhatsAppText: {
    color: Colors.whatsapp,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});