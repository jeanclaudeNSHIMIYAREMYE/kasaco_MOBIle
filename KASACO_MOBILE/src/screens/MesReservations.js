// src/screens/MesReservations.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import { ReservationService } from '../services/api';
import Navigation from '../components/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Image de fond
const hondaBg = { uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=800&fit=crop' };

// Fonction utilitaire pour extraire un tableau des données API
const extractArrayFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (data && data.results && Array.isArray(data.results)) return data.results;
  return [];
};

// Composant de carte de réservation animée
const ReservationCard = ({ reservation, index, formatPrix, formatDate, getStatusBadge }) => {
  const voiture = reservation.voiture_detail || reservation.voiture;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.reservationCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
        style={styles.cardGradient}
      >
        {/* En-tête de la carte */}
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#ef4444', '#f97316']}
            style={styles.carIcon}
          >
            <Icon name="car" size={24} color="white" />
          </LinearGradient>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.carName} numberOfLines={1}>
              {voiture?.marque_nom || 'N/A'} {voiture?.modele_nom || ''}
            </Text>
            <View style={styles.carDetails}>
              <Icon name="calendar" size={12} color="#6b7280" />
              <Text style={styles.carYear}>{voiture?.annee || 'Année N/A'}</Text>
            </View>
          </View>
          {getStatusBadge(voiture?.etat)}
        </View>

        {/* Détails de la réservation */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#10b98120', '#10b98110']}
                style={styles.infoIconContainer}
              >
                <Icon name="cash" size={18} color="#10b981" />
              </LinearGradient>
              <View>
                <Text style={styles.infoLabel}>Prix</Text>
                <Text style={styles.infoValue}>
                  {formatPrix(voiture?.prix, voiture?.devise)}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#3b82f620', '#3b82f610']}
                style={styles.infoIconContainer}
              >
                <Icon name="calendar-clock" size={18} color="#3b82f6" />
              </LinearGradient>
              <View>
                <Text style={styles.infoLabel}>Réservation</Text>
                <Text style={styles.infoValue}>
                  {formatDate(reservation.date_reservation)}
                </Text>
              </View>
            </View>
          </View>

          {/* Informations supplémentaires */}
          <View style={styles.additionalInfo}>
            <View style={styles.additionalInfoItem}>
              <Icon name="barcode" size={12} color="#9ca3af" />
              <Text style={styles.additionalInfoText}>
                Réf: #{reservation.id}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Composant d'état vide animé
const EmptyState = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
        style={styles.emptyGradient}
      >
        <View style={styles.emptyIconContainer}>
          <Icon name="calendar-blank" size={64} color="#ef4444" />
        </View>
        <Text style={styles.emptyTitle}>Aucune réservation</Text>
        <Text style={styles.emptyDescription}>
          Vous n'avez pas encore effectué de réservation
        </Text>
        <Text style={styles.emptyHint}>
          Explorez nos véhicules et faites votre première réservation
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default function MesReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadUserId();
    chargerReservations();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id ? parseInt(id) : null);
    } catch (error) {
      console.error('Erreur chargement userId:', error);
    }
  };

  const chargerReservations = async () => {
    try {
      setLoading(true);
      const data = await ReservationService.getAllReservations();
      const allReservations = extractArrayFromResponse(data);
      
      const mesReservations = allReservations.filter(r => {
        const reservationUserId = r.utilisateur || r.utilisateur_id;
        return reservationUserId === userId;
      });
      
      setReservations(mesReservations);
    } catch (error) {
      console.error("❌ Erreur chargement réservations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerReservations();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'N/A';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    if (isNaN(prixNumber)) return 'N/A';
    const formatted = prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${formatted} FCFA`;
  };

  const getStatusBadge = (etat) => {
    if (etat === 'Réservée') {
      return (
        <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statusBadge}>
          <Icon name="clock" size={12} color="white" />
          <Text style={styles.statusBadgeText}>Réservée</Text>
        </LinearGradient>
      );
    }
    return (
      <LinearGradient colors={['#10b981', '#059669']} style={styles.statusBadge}>
        <Icon name="check-circle" size={12} color="white" />
        <Text style={styles.statusBadgeText}>Confirmée</Text>
      </LinearGradient>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Chargement de vos réservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Image de fond avec effet parallaxe */}
      <Image source={hondaBg} style={styles.backgroundImage} blurRadius={10} />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />
      
      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* En-tête personnalisé */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#ef4444', '#f97316']}
            style={styles.headerGradient}
          >
            <Icon name="calendar-check" size={28} color="white" />
            <Text style={styles.headerTitle}>Mes réservations</Text>
          </LinearGradient>
          <Text style={styles.headerSubtitle}>
            {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
          </Text>
        </View>

        {/* Liste des réservations */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ef4444']}
              tintColor="#ef4444"
            />
          }
        >
          {reservations.length > 0 ? (
            <View style={styles.cardsContainer}>
              {reservations.map((reservation, index) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  index={index}
                  formatPrix={formatPrix}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}

          {/* Espacement pour le scroll */}
          <View style={styles.bottomSpacing} />
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 40,
    gap: 10,
    marginBottom: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  cardsContainer: {
    gap: 16,
  },
  reservationCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  carIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitleContainer: {
    flex: 1,
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  carDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  carYear: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  additionalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  additionalInfoText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginTop: 40,
  },
  emptyGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 32,
    width: width - 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});