// src/components/admin/AdminNavbar.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function AdminNavbar() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const handleLogout = () => {
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
              navigation.replace('Login');
            } catch (error) {
              console.error('Erreur logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleNavigation = (screen) => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigation.navigate(screen);
  };

  const isActive = (screenName) => {
    return route.name === screenName;
  };

  const getNavItemStyle = (screenName) => {
    const isActiveScreen = isActive(screenName);
    return {
      container: [
        styles.navItem,
        isActiveScreen && styles.navItemActive
      ],
      text: [
        styles.navItemText,
        isActiveScreen && styles.navItemTextActive
      ],
      icon: isActiveScreen ? styles.navIconActive : styles.navIcon
    };
  };

  const navItems = [
    { screen: "DashboardAdmin", icon: "chart-pie", label: "Dashboard", color: "#8b5cf6" },
    { screen: "AdminUtilisateurs", icon: "account-group", label: "Utilisateurs", color: "#8b5cf6" },
    { screen: "AdminMarques", icon: "tag", label: "Marques", color: "#8b5cf6" },
    { screen: "AdminModeles", icon: "car-convertible", label: "Modèles", color: "#10b981" },
    { screen: "AdminVoitures", icon: "car", label: "Voitures", color: "#8b5cf6" },
    { screen: "AdminReservations", icon: "calendar-check", label: "Réservations", color: "#8b5cf6" },
    { screen: "AdminStatistiques", icon: "chart-line", label: "Statistiques", color: "#ec4899" },
  ];

  const mobileNavItems = [
    { screen: "DashboardAdmin", icon: "chart-pie", label: "Dashboard" },
    { screen: "AdminVoitures", icon: "car", label: "Voitures" },
    { screen: "AdminReservations", icon: "calendar-check", label: "Réserv." },
    { screen: "AdminUtilisateurs", icon: "account-group", label: "Users" },
    { screen: "AdminStatistiques", icon: "chart-line", label: "Stats" },
  ];

  // Animation pour le menu mobile
  useEffect(() => {
    if (isMobileMenuOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -width,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isMobileMenuOpen]);

  const ProfileMenu = () => (
    <Animated.View style={[styles.profileMenu, { opacity: fadeAnim }]}>
      <BlurView intensity={95} tint="dark" style={styles.profileMenuBlur}>
        {/* En-tête */}
        <View style={styles.profileMenuHeader}>
          <LinearGradient
            colors={['#8b5cf6', '#ec4899']}
            style={styles.profileAvatar}
          >
            <Text style={styles.profileAvatarText}>
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username || 'Administrateur'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'admin@kasaco.com'}</Text>
          </View>
        </View>

        {/* Liens */}
        <TouchableOpacity
          style={styles.profileMenuItem}
          onPress={() => handleNavigation('Profile')}
        >
          <Icon name="account" size={20} color="#9ca3af" />
          <Text style={styles.profileMenuItemText}>Mon profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileMenuItem}
          onPress={() => handleNavigation('AdminStatistiques')}
        >
          <Icon name="chart-line" size={20} color="#9ca3af" />
          <Text style={styles.profileMenuItemText}>Statistiques</Text>
        </TouchableOpacity>

        <View style={styles.profileMenuDivider} />

        <TouchableOpacity
          style={styles.profileMenuItem}
          onPress={() => handleNavigation('AjouterVoiture')}
        >
          <Icon name="plus-circle" size={20} color="#10b981" />
          <Text style={[styles.profileMenuItemText, { color: '#10b981' }]}>Ajouter une voiture</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileMenuItem}
          onPress={() => handleNavigation('AdminVoitures')}
        >
          <Icon name="format-list-bulleted" size={20} color="#3b82f6" />
          <Text style={[styles.profileMenuItemText, { color: '#3b82f6' }]}>Liste des voitures</Text>
        </TouchableOpacity>

        <View style={styles.profileMenuDivider} />

        <TouchableOpacity
          style={styles.profileMenuItem}
          onPress={handleLogout}
        >
          <Icon name="logout" size={20} color="#ef4444" />
          <Text style={[styles.profileMenuItemText, { color: '#ef4444' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  const MobileMenu = () => (
    <Modal visible={isMobileMenuOpen} transparent animationType="none">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsMobileMenuOpen(false)}
      >
        <Animated.View style={[styles.mobileMenu, { transform: [{ translateX: slideAnim }] }]}>
          <BlurView intensity={95} tint="dark" style={styles.mobileMenuBlur}>
            <View style={styles.mobileMenuHeader}>
              <LinearGradient
                colors={['#8b5cf6', '#ec4899']}
                style={styles.mobileMenuAvatar}
              >
                <Text style={styles.mobileMenuAvatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </Text>
              </LinearGradient>
              <Text style={styles.mobileMenuName}>{user?.username || 'Administrateur'}</Text>
              <Text style={styles.mobileMenuRole}>Administrateur</Text>
            </View>

            <ScrollView style={styles.mobileMenuNav}>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={[
                    styles.mobileNavItem,
                    isActive(item.screen) && styles.mobileNavItemActive
                  ]}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Icon
                    name={item.icon}
                    size={22}
                    color={isActive(item.screen) ? '#ef4444' : '#9ca3af'}
                  />
                  <Text style={[
                    styles.mobileNavText,
                    isActive(item.screen) && styles.mobileNavTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.mobileMenuDivider} />

              <TouchableOpacity
                style={styles.mobileNavItem}
                onPress={() => handleNavigation('AjouterVoiture')}
              >
                <Icon name="plus-circle" size={22} color="#10b981" />
                <Text style={[styles.mobileNavText, { color: '#10b981' }]}>Ajouter une voiture</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobileNavItem}
                onPress={handleLogout}
              >
                <Icon name="logout" size={22} color="#ef4444" />
                <Text style={[styles.mobileNavText, { color: '#ef4444' }]}>Déconnexion</Text>
              </TouchableOpacity>
            </ScrollView>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      <LinearGradient
        colors={['#1f2937', '#1e1b4b', '#1f2937']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.navbar}
      >
        <View style={styles.navbarContent}>
          {/* Logo */}
          <TouchableOpacity
            onPress={() => handleNavigation('DashboardAdmin')}
            style={styles.logoContainer}
          >
            <LinearGradient
              colors={['#8b5cf6', '#ec4899']}
              style={styles.logoIcon}
            >
              <Text style={styles.logoIconText}>K</Text>
            </LinearGradient>
            <Text style={styles.logoText}>KASACO Admin</Text>
          </TouchableOpacity>

          {/* Menu Desktop */}
          <View style={styles.desktopMenu}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={getNavItemStyle(item.screen).container}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={isActive(item.screen) ? '#ef4444' : '#e5e7eb'}
                    style={getNavItemStyle(item.screen).icon}
                  />
                  <Text style={getNavItemStyle(item.screen).text}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Profil */}
            <View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <View style={styles.profileInfoText}>
                  <Text style={styles.profileInfoName}>{user?.username || 'Admin'}</Text>
                  <Text style={styles.profileInfoRole}>Administrateur</Text>
                </View>
                <LinearGradient
                  colors={['#8b5cf6', '#ec4899']}
                  style={styles.profileAvatarSmall}
                >
                  <Text style={styles.profileAvatarSmallText}>
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {isProfileMenuOpen && <ProfileMenu />}
            </View>
          </View>

          {/* Menu Button Mobile */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMobileMenuOpen(true)}
          >
            <Icon name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Menu Mobile Bottom Bar */}
        <View style={styles.mobileBottomBar}>
          {mobileNavItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.mobileBottomItem}
              onPress={() => handleNavigation(item.screen)}
            >
              <Icon
                name={item.icon}
                size={20}
                color={isActive(item.screen) ? '#ef4444' : '#9ca3af'}
              />
              <Text style={[
                styles.mobileBottomText,
                isActive(item.screen) && styles.mobileBottomTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <MobileMenu />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingTop: Platform.OS === 'ios' ? 48 : 40,
    paddingBottom: 8,
  },
  navbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  desktopMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    display: width > 768 ? 'flex' : 'none',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  navItemText: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#ef4444',
  },
  navIcon: {
    opacity: 0.8,
  },
  navIconActive: {
    opacity: 1,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 12,
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.2)',
  },
  profileInfoText: {
    alignItems: 'flex-end',
  },
  profileInfoName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  profileInfoRole: {
    fontSize: 10,
    color: '#c084fc',
  },
  profileAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarSmallText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  profileMenu: {
    position: 'absolute',
    top: 60,
    right: 0,
    width: 280,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  profileMenuBlur: {
    padding: 8,
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  profileEmail: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  profileMenuItemText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    display: width > 768 ? 'none' : 'flex',
  },
  mobileBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    display: width > 768 ? 'none' : 'flex',
  },
  mobileBottomItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mobileBottomText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  mobileBottomTextActive: {
    color: '#ef4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mobileMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    zIndex: 200,
  },
  mobileMenuBlur: {
    flex: 1,
  },
  mobileMenuHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  mobileMenuAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mobileMenuAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  mobileMenuName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  mobileMenuRole: {
    fontSize: 12,
    color: '#c084fc',
  },
  mobileMenuNav: {
    flex: 1,
    padding: 16,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  mobileNavItemActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  mobileNavText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  mobileNavTextActive: {
    color: '#ef4444',
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
});