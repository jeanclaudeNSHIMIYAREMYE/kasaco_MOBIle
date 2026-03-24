// src/screens/admin/AdminStatistiques.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StatistiqueService } from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Image de fond
const statsBg = { uri: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=800&fit=crop' };

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
const StatCard = ({ title, value, icon, color, description, delay = 0, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  const getGradientColors = () => {
    switch (color) {
      case 'blue': return ['#3b82f6', '#2563eb'];
      case 'purple': return ['#8b5cf6', '#7c3aed'];
      case 'green': return ['#10b981', '#059669'];
      case 'yellow': return ['#f59e0b', '#d97706'];
      case 'red': return ['#ef4444', '#dc2626'];
      case 'indigo': return ['#6366f1', '#4f46e5'];
      case 'pink': return ['#ec4899', '#db2777'];
      case 'teal': return ['#14b8a6', '#0d9488'];
      default: return ['#3b82f6', '#2563eb'];
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'blue': return '#3b82f6';
      case 'purple': return '#8b5cf6';
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'indigo': return '#6366f1';
      case 'pink': return '#ec4899';
      case 'teal': return '#14b8a6';
      default: return '#3b82f6';
    }
  };

  const getBgColor = () => {
    switch (color) {
      case 'blue': return '#dbeafe';
      case 'purple': return '#ede9fe';
      case 'green': return '#d1fae5';
      case 'yellow': return '#fed7aa';
      case 'red': return '#fee2e2';
      case 'indigo': return '#e0e7ff';
      case 'pink': return '#fce7f3';
      case 'teal': return '#ccfbf1';
      default: return '#dbeafe';
    }
  };

  const maxValue = 100;
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <Animated.View
      style={[
        styles.statCardContainer,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
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
            <View style={[styles.statCardIconContainer, { backgroundColor: getBgColor() }]}>
              <Icon name={icon} size={24} color={getIconColor()} />
            </View>
            <Text style={[styles.statCardValue, { color: getIconColor() }]}>{value}</Text>
          </View>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Text style={styles.statCardDescription}>{description}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: getIconColor() }]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant pour la répartition des véhicules
const RepartitionSection = ({ stats, animate }) => {
  const total = stats.voitures || 1;
  const disponibles = stats.voitures_disponibles || 0;
  const reservees = stats.voitures_reservees || 0;
  const vendues = stats.voitures_vendues || 0;

  const data = [
    { label: 'Disponibles', value: disponibles, color: '#10b981', percentage: ((disponibles / total) * 100).toFixed(1) },
    { label: 'Réservées', value: reservees, color: '#f59e0b', percentage: ((reservees / total) * 100).toFixed(1) },
    { label: 'Vendues', value: vendues, color: '#ef4444', percentage: ((vendues / total) * 100).toFixed(1) },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [animate]);

  return (
    <Animated.View style={[styles.repartitionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient colors={['#ffffff', '#f9fafb']} style={styles.repartitionGradient}>
        <View style={styles.sectionHeader}>
          <Icon name="chart-pie" size={24} color="#f97316" />
          <Text style={styles.sectionTitle}>Répartition des véhicules</Text>
        </View>

        <View style={styles.repartitionList}>
          {data.map((item) => (
            <View key={item.label} style={styles.repartitionItem}>
              <View style={styles.repartitionHeader}>
                <View style={[styles.repartitionDot, { backgroundColor: item.color }]} />
                <Text style={styles.repartitionLabel}>{item.label}</Text>
                <Text style={styles.repartitionValue}>{item.value} ({item.percentage}%)</Text>
              </View>
              <View style={styles.repartitionBarContainer}>
                <View style={[styles.repartitionBar, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.statsFooter}>
          <View style={styles.statsFooterItem}>
            <Text style={styles.statsFooterNumber}>{stats.voitures}</Text>
            <Text style={styles.statsFooterLabel}>Total véhicules</Text>
          </View>
          <View style={styles.statsFooterItem}>
            <Text style={styles.statsFooterNumber}>
              {((disponibles / total) * 100).toFixed(1)}%
            </Text>
            <Text style={styles.statsFooterLabel}>Taux de disponibilité</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Composant pour l'aperçu rapide
const ApercuRapide = ({ stats, animate }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, delay: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [animate]);

  return (
    <Animated.View style={[styles.apercuCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient colors={['#ffffff', '#f9fafb']} style={styles.apercuGradient}>
        <View style={styles.sectionHeader}>
          <Icon name="speedometer" size={24} color="#f97316" />
          <Text style={styles.sectionTitle}>Aperçu rapide</Text>
        </View>

        <View style={styles.apercuList}>
          <View style={[styles.apercuItem, { backgroundColor: '#dbeafe' }]}>
            <View style={[styles.apercuIcon, { backgroundColor: '#3b82f6' }]}>
              <Icon name="account-group" size={20} color="white" />
            </View>
            <View style={styles.apercuInfo}>
              <Text style={styles.apercuLabel}>Utilisateurs</Text>
              <Text style={styles.apercuValue}>{stats.utilisateurs}</Text>
            </View>
            <Text style={styles.apercuTrend}>+12%</Text>
          </View>

          <View style={[styles.apercuItem, { backgroundColor: '#ede9fe' }]}>
            <View style={[styles.apercuIcon, { backgroundColor: '#8b5cf6' }]}>
              <Icon name="calendar-check" size={20} color="white" />
            </View>
            <View style={styles.apercuInfo}>
              <Text style={styles.apercuLabel}>Réservations</Text>
              <Text style={styles.apercuValue}>{stats.reservations}</Text>
            </View>
            <Text style={styles.apercuTrend}>+5%</Text>
          </View>

          <View style={[styles.apercuItem, { backgroundColor: '#ccfbf1' }]}>
            <View style={[styles.apercuIcon, { backgroundColor: '#14b8a6' }]}>
              <Icon name="tag" size={20} color="white" />
            </View>
            <View style={styles.apercuInfo}>
              <Text style={styles.apercuLabel}>Marques/Modèles</Text>
              <Text style={styles.apercuValue}>{stats.marques}/{stats.modeles}</Text>
            </View>
            <Text style={styles.apercuTrend}>+3%</Text>
          </View>
        </View>

        <Text style={styles.updateTime}>
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default function AdminStatistiques() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    utilisateurs: 0,
    voitures: 0,
    voitures_disponibles: 0,
    voitures_reservees: 0,
    voitures_vendues: 0,
    reservations: 0,
    marques: 0,
    modeles: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      checkAuth();
      chargerStats();
      startAnimations();
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
      const userRole = await AsyncStorage.getItem('userRole');
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        navigation.replace('Dashboard');
        return;
      }
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId ? parseInt(userId) : null);
    } catch (error) {
      console.error('Erreur checkAuth:', error);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setAnimateCards(true), 100);
  };

  const showMessageAnimation = () => {
    Animated.sequence([
      Animated.timing(messageAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(messageAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    showMessageAnimation();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const chargerStats = async () => {
    try {
      setLoading(true);
      const data = await StatistiqueService.getStatistiques();
      console.log("📊 Statistiques reçues:", data);
      setStats({
        utilisateurs: data.utilisateurs || 0,
        voitures: data.voitures || 0,
        voitures_disponibles: data.voitures_disponibles || 0,
        voitures_reservees: data.voitures_reservees || 0,
        voitures_vendues: data.voitures_vendues || 0,
        reservations: data.reservations || 0,
        marques: data.marques || 0,
        modeles: data.modeles || 0
      });
      showMessage('success', 'Données mises à jour avec succès');
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', 'Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerStats();
  };

  const statsCards = [
    { title: "Utilisateurs", value: stats.utilisateurs, icon: "account-group", color: "blue", description: "Total des utilisateurs enregistrés", screen: "AdminUtilisateurs" },
    { title: "Voitures", value: stats.voitures, icon: "car", color: "purple", description: "Total des véhicules", screen: "AdminVoitures" },
    { title: "Disponibles", value: stats.voitures_disponibles, icon: "check-circle", color: "green", description: "Véhicules disponibles", screen: "AdminVoitures" },
    { title: "Réservées", value: stats.voitures_reservees, icon: "clock", color: "yellow", description: "Véhicules réservés", screen: "AdminReservations" },
    { title: "Vendues", value: stats.voitures_vendues, icon: "sale", color: "red", description: "Véhicules vendus", screen: "AdminVoitures" },
    { title: "Réservations", value: stats.reservations, icon: "calendar-check", color: "indigo", description: "Total des réservations", screen: "AdminReservations" },
    { title: "Marques", value: stats.marques, icon: "tag", color: "pink", description: "Marques disponibles", screen: "AdminMarques" },
    { title: "Modèles", value: stats.modeles, icon: "car-convertible", color: "teal", description: "Modèles disponibles", screen: "AdminModeles" },
  ];

  const periodOptions = [
    { value: 'all', label: 'Toutes les périodes' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
  ];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>Chargement des statistiques...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Image de fond */}
      <Image source={statsBg} style={styles.backgroundImage} blurRadius={10} />
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      />

      {/* Message de notification */}
      {message.text && (
        <Animated.View style={[
          styles.messageContainer,
          message.type === 'success' ? styles.messageSuccess : styles.messageError,
          {
            transform: [{ translateY: messageAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }],
            opacity: messageAnim
          }
        ]}>
          <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={20} color="white" />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      {/* Modal de sélection de période */}
      <Modal visible={showPeriodModal} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.periodModal}>
            <Text style={styles.periodModalTitle}>Sélectionner une période</Text>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.periodOption, selectedPeriod === option.value && styles.periodOptionActive]}
                onPress={() => {
                  setSelectedPeriod(option.value);
                  setShowPeriodModal(false);
                }}
              >
                <Text style={[styles.periodOptionText, selectedPeriod === option.value && styles.periodOptionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowPeriodModal(false)} style={styles.periodCloseButton}>
              <Text style={styles.periodCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Statistiques</Text>
            <Text style={styles.headerSubtitle}>Vue d'ensemble de votre plateforme KASACO</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowPeriodModal(true)}
              style={styles.periodButton}
            >
              <Icon name="calendar" size={18} color="#94a3b8" />
              <Text style={styles.periodButtonText}>
                {periodOptions.find(p => p.value === selectedPeriod)?.label || 'Toutes'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={chargerStats}
              style={styles.refreshButton}
            >
              <Icon name="refresh" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
          }
        >
          {/* Cartes de statistiques */}
          <View style={styles.statsGrid}>
            {statsCards.map((card, index) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                description={card.description}
                delay={index * 100}
                onPress={() => navigation.navigate(card.screen)}
              />
            ))}
          </View>

          {/* Graphiques et analyses */}
          <View style={styles.chartsContainer}>
            <RepartitionSection stats={stats} animate={animateCards} />
            <ApercuRapide stats={stats} animate={animateCards} />
          </View>

          {/* Pied de page */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} KASACO - Tableau de bord administrateur
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 14,
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  periodButtonText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statCardGradient: {
    height: 4,
  },
  statCardContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statCardDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  chartsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  repartitionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  repartitionGradient: {
    padding: 20,
  },
  apercuCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  apercuGradient: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  repartitionList: {
    gap: 16,
    marginBottom: 20,
  },
  repartitionItem: {
    gap: 6,
  },
  repartitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  repartitionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  repartitionLabel: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  repartitionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  repartitionBarContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  repartitionBar: {
    height: '100%',
    borderRadius: 3,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  statsFooterItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsFooterNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsFooterLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  apercuList: {
    gap: 12,
    marginBottom: 20,
  },
  apercuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  apercuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apercuInfo: {
    flex: 1,
  },
  apercuLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  apercuValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  apercuTrend: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  updateTime: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#6b7280',
  },
  messageContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 100,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageSuccess: {
    backgroundColor: '#10b981',
  },
  messageError: {
    backgroundColor: '#ef4444',
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodModal: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 320,
  },
  periodModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  periodOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#374151',
  },
  periodOptionActive: {
    backgroundColor: '#f97316',
  },
  periodOptionText: {
    color: '#e5e7eb',
    fontSize: 14,
    textAlign: 'center',
  },
  periodOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  periodCloseButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#4b5563',
    alignItems: 'center',
  },
  periodCloseText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
});