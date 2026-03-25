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
  Animated,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import { ReservationService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Image de fond
const bgImage = { uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=800&fit=crop' };

// Composant de carte de réservation animée
const ReservationCard = ({ reservation, index, formatPrix, formatDate, getStatusBadge, onCancel }) => {
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
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseURL = 'http://192.168.1.54:8000';
    if (path.startsWith('/media')) return `${baseURL}${path}`;
    return `${baseURL}/media/${path}`;
  };

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
        colors={['#ffffff', '#fef9f5']}
        style={styles.cardGradient}
      >
        {/* Image du véhicule */}
        {(voiture?.photo_url || voiture?.photo_principale) && (
          <View style={styles.cardImageContainer}>
            <Image
              source={{ uri: getImageUrl(voiture.photo_url || voiture.photo_principale) }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageOverlay}
            />
            <View style={styles.reservationIdBadge}>
              <Icon name="barcode" size={10} color="white" />
              <Text style={styles.reservationIdText}>#{reservation.id}</Text>
            </View>
            {getStatusBadge(voiture?.etat)}
          </View>
        )}

        <View style={styles.cardContent}>
          {/* En-tête */}
          <View style={styles.cardHeader}>
            <View style={styles.carInfo}>
              <Text style={styles.carName} numberOfLines={1}>
                {voiture?.marque_nom || 'N/A'} {voiture?.modele_nom || ''}
              </Text>
              <View style={styles.carMeta}>
                <Icon name="calendar" size={12} color="#9ca3af" />
                <Text style={styles.carYear}>{voiture?.annee || 'Année N/A'}</Text>
                <Icon name="speedometer" size={12} color="#9ca3af" style={styles.metaIcon} />
                <Text style={styles.carKm}>{voiture?.kilometrage?.toLocaleString() || '0'} km</Text>
              </View>
            </View>
          </View>

          {/* Détails de la réservation */}
          <View style={styles.cardBody}>
            <View style={styles.infoGrid}>
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
                  <Text style={styles.infoLabel}>Réservé le</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(reservation.date_reservation)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transmission et pays */}
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Icon name="car-shift-pattern" size={14} color="#f97316" />
                <Text style={styles.featureText}>{voiture?.transmission || 'Manuelle'}</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="map-marker" size={14} color="#f97316" />
                <Text style={styles.featureText}>{voiture?.pays_display || voiture?.pays || 'Burundi'}</Text>
              </View>
            </View>

            {/* Bouton annuler */}
            <TouchableOpacity
              onPress={() => onCancel(reservation)}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.cancelGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="delete-outline" size={18} color="white" />
                <Text style={styles.cancelButtonText}>Annuler la réservation</Text>
              </LinearGradient>
            </TouchableOpacity>
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
          <LinearGradient colors={['#ef4444', '#f97316']} style={styles.emptyIconGradient}>
            <Icon name="calendar-blank" size={48} color="white" />
          </LinearGradient>
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
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
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
      
      let allReservations = [];
      if (Array.isArray(data)) {
        allReservations = data;
      } else if (data && data.results) {
        allReservations = data.results;
      }
      
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

  const handleCancelReservation = (reservation) => {
    Alert.alert(
      'Annuler la réservation',
      `Voulez-vous vraiment annuler la réservation de ${reservation.voiture_detail?.marque_nom} ${reservation.voiture_detail?.modele_nom} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await ReservationService.deleteReservation(reservation.id);
              await chargerReservations();
              Alert.alert('Succès', 'Réservation annulée avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la réservation');
            }
          }
        }
      ]
    );
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
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text style={styles.loadingText}>Chargement de vos réservations...</Text>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Image source={bgImage} style={styles.backgroundImage} blurRadius={8} />
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      />
      
      <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* En-tête animé */}
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
          <LinearGradient
            colors={['#ef4444', '#f97316']}
            style={styles.headerGradient}
          >
            <Icon name="calendar-check" size={28} color="white" />
            <Text style={styles.headerTitle}>Mes réservations</Text>
          </LinearGradient>
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsNumber}>{reservations.length}</Text>
            <Text style={styles.headerStatsLabel}>réservation{reservations.length > 1 ? 's' : ''}</Text>
          </View>
        </Animated.View>

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
                  onCancel={handleCancelReservation}
                />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
          
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
  loadingCard: {
    borderRadius: 20,
    padding: 30,
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
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 50,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  headerStatsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStatsLabel: {
    fontSize: 12,
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
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  reservationIdBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  reservationIdText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  carMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  carYear: {
    fontSize: 12,
    color: '#6b7280',
  },
  carKm: {
    fontSize: 12,
    color: '#6b7280',
  },
  metaIcon: {
    marginLeft: 4,
  },
  cardBody: {
    gap: 12,
  },
  infoGrid: {
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
  featuresRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cancelButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  cancelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: 24,
    overflow: 'hidden',
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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