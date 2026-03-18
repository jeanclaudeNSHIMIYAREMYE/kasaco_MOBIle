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
import { useNavigation } from '@react-navigation/native'; // ← IMPORTANT: ajoutez ceci
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Import du logo
const logo = require('../../assets/icon.png');

// Couleurs professionnelles
const Colors = {
  primary: '#ef4444',
  primaryDark: '#dc2626',
  secondary: '#1f2937',
  secondaryLight: '#374151',
  background: '#f9fafb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af',
    white: '#ffffff',
  },
  whatsapp: '#25D366',
};

// Composants d'icônes
const Icons = {
  Home: ({ color, size }) => <Icon name="home-outline" size={size || 20} color={color || Colors.text.white} />,
  Info: ({ color, size }) => <Icon name="information-circle-outline" size={size || 20} color={color || Colors.text.white} />,
  Dashboard: ({ color, size }) => <Icon name="grid-outline" size={size || 20} color={color || Colors.text.white} />,
  Admin: ({ color, size }) => <Icon name="shield-checkmark-outline" size={size || 20} color={color || Colors.text.white} />,
  Login: ({ color, size }) => <Icon name="log-in-outline" size={size || 20} color={color || Colors.text.white} />,
  Signup: ({ color, size }) => <Icon name="person-add-outline" size={size || 20} color={color || Colors.text.white} />,
  Logout: ({ color, size }) => <Icon name="log-out-outline" size={size || 20} color={color || Colors.text.white} />,
  Menu: ({ color, size }) => <Icon name="menu-outline" size={size || 24} color={color || Colors.text.white} />,
  Close: ({ color, size }) => <Icon name="close-outline" size={size || 24} color={color || Colors.text.white} />,
  WhatsApp: ({ color, size }) => <Icon name="logo-whatsapp" size={size || 24} color={color || Colors.whatsapp} />,
  Location: ({ color, size }) => <Icon name="location-outline" size={size || 18} color={color || Colors.primary} />,
  Email: ({ color, size }) => <Icon name="mail-outline" size={size || 18} color={color || Colors.primary} />,
  Phone: ({ color, size }) => <Icon name="call-outline" size={size || 18} color={color || Colors.primary} />,
  ChevronRight: ({ color, size }) => <Icon name="chevron-forward-outline" size={size || 16} color={color || Colors.text.light} />,
};

export default function Navigation({ children }) { // ← Plus de prop navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation(); // ← Utilisez le hook ici !

  // Animation pour le menu mobile
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isMobileMenuOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
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
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  const handleWhatsApp = (phone) => {
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url).catch(() => 
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp')
    );
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`).catch(() => 
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email')
    );
  };

  const handlePhone = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => 
      Alert.alert('Erreur', 'Impossible d\'effectuer l\'appel')
    );
  };

  const handleNavigation = (screen) => {
    setIsMobileMenuOpen(false);
    if (navigation) {
      navigation.navigate(screen);
    } else {
      console.error('❌ navigation non disponible');
    }
  };

  // Liens de navigation
  const navLinks = [
    { to: "Home", icon: Icons.Home, label: "Accueil" },
    { to: "PourquoiKasaco", icon: Icons.Info, label: "Pourquoi KASACO" },
    ...(isAuthenticated ? [
      { to: "Dashboard", icon: Icons.Dashboard, label: "Tableau de bord" },
      ...(user?.role === "admin" || user?.role === "superadmin" ? 
        [{ to: "Admin", icon: Icons.Admin, label: "Administration" }] : [])
    ] : [])
  ];

  // Couleurs navbar
  const navbarColors = scrolled 
    ? { bg: Colors.secondary, text: Colors.text.white }
    : { bg: Colors.primary, text: Colors.text.white };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={navbarColors.bg}
        translucent={false}
      />
      
      {/* Navbar */}
      <Animated.View style={[
        styles.navbar, 
        { backgroundColor: navbarColors.bg },
        scrolled && styles.navbarShadow
      ]}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
          <View style={styles.navbarContent}>
            {/* Logo */}
            <TouchableOpacity
              onPress={() => handleNavigation('Home')}
              style={styles.logoContainer}
              activeOpacity={0.7}
              android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
            >
              <Image
                source={logo}
                style={styles.logo}
              />
              <Text style={[styles.logoText, { color: navbarColors.text }]}>
                KASACO
              </Text>
            </TouchableOpacity>

            {/* Menu Desktop - caché sur mobile */}
            <View style={styles.desktopMenu}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {navLinks.map((link) => (
                  <TouchableOpacity
                    key={link.to}
                    onPress={() => handleNavigation(link.to)}
                    style={styles.navLink}
                    android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
                  >
                    <link.icon color={Colors.text.white} size={18} />
                    <Text style={styles.navLinkText}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Boutons auth */}
              <View style={styles.authButtons}>
                {isAuthenticated ? (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
                  >
                    <Icons.Logout color={Colors.text.white} size={18} />
                    <Text style={styles.buttonText}>Déconnexion</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleNavigation('Login')}
                      style={styles.loginButton}
                      android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
                    >
                      <Icons.Login color={Colors.primary} size={18} />
                      <Text style={styles.loginButtonText}>Connexion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleNavigation('Register')}
                      style={styles.signupButton}
                      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
                    >
                      <Icons.Signup color={Colors.text.white} size={18} />
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
              android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
            >
              <Icons.Menu color={Colors.text.white} size={24} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Menu Mobile Modal */}
      <Modal
        visible={isMobileMenuOpen}
        transparent={true}
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
                <View style={styles.modalHeader}>
                  <View style={styles.modalLogoContainer}>
                    <Image source={logo} style={styles.modalLogo} />
                    <Text style={styles.modalLogoText}>KASACO</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsMobileMenuOpen(false)}
                    style={styles.closeButton}
                    android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
                  >
                    <Icons.Close color={Colors.text.white} size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  {navLinks.map((link) => (
                    <TouchableOpacity
                      key={link.to}
                      onPress={() => handleNavigation(link.to)}
                      style={styles.modalNavItem}
                      android_ripple={{ color: 'rgba(239,68,68,0.1)', borderless: false }}
                    >
                      <link.icon color={Colors.primary} size={20} />
                      <Text style={styles.modalNavText}>{link.label}</Text>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.modalDivider} />

                  {/* Auth buttons mobile */}
                  {isAuthenticated ? (
                    <TouchableOpacity
                      onPress={handleLogout}
                      style={styles.modalLogoutButton}
                      android_ripple={{ color: 'rgba(239,68,68,0.1)', borderless: false }}
                    >
                      <Icons.Logout color={Colors.primary} size={20} />
                      <Text style={styles.modalLogoutText}>Déconnexion</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => handleNavigation('Login')}
                        style={styles.modalAuthButton}
                        android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: false }}
                      >
                        <Icons.Login color={Colors.primary} size={20} />
                        <Text style={styles.modalAuthText}>Connexion</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleNavigation('Register')}
                        style={styles.modalAuthButton}
                        android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: false }}
                      >
                        <Icons.Signup color={Colors.primary} size={20} />
                        <Text style={styles.modalAuthText}>Inscription</Text>
                      </TouchableOpacity>
                    </>
                  )}
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

        {/* ================= FOOTER PROFESSIONNEL ================= */}
        <View style={styles.footer}>
          {/* Logo et nom */}
          

          {/* WhatsApp uniquement */}
         

          {/* Copyright */}
          
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// Styles (gardez les mêmes styles que vous aviez)
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
    elevation: 0,
  },
  navbarShadow: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    padding: 4,
    borderRadius: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  desktopMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    display: width > 768 ? 'flex' : 'none',
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 4,
  },
  navLinkText: {
    color: Colors.text.white,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.text.white,
    borderRadius: 8,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.text.white,
    borderRadius: 8,
  },
  signupButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  
  // Styles du modal mobile
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.7,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondaryLight,
  },
  modalLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalLogoText: {
    color: Colors.text.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 16,
  },
  modalNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalNavText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.secondaryLight,
    marginVertical: 16,
  },
  modalAuthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalAuthText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '500',
  },
  modalLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  modalLogoutText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },

  // ================= FOOTER PROFESSIONNEL =================
  footer: {
    backgroundColor: Colors.secondary,
    marginTop: 40,
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
  },
  footerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  footerTitle: {
    color: Colors.text.white,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerSocial: {
    marginBottom: 25,
    alignItems: 'center',
  },
  socialTitle: {
    color: Colors.text.light,
    fontSize: 13,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37,211,102,0.1)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.3)',
  },
  whatsappButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  footerCopyright: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.secondaryLight,
    alignItems: 'center',
  },
  footerCopyrightText: {
    color: Colors.text.light,
    fontSize: 12,
  },
});