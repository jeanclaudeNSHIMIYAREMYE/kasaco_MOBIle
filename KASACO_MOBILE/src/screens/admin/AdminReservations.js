// src/screens/admin/AdminReservations.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { VoitureService, ReservationService } from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Breakpoints
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// Composant pour la carte de statistiques
const StatCard = ({ icon, value, label, colors, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.statCard}>
    <LinearGradient colors={colors} style={styles.statCardGradient}>
      <View style={styles.statCardContent}>
        <View>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={styles.statIconContainer}>
          <Icon name={icon} size={24} color="white" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// Composant pour la carte de voiture disponible (mobile)
const VoitureDisponibleCard = ({ item, index, onReserver, formatPrix, getPaysEmoji, getEtatBadge }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, friction: 8, tension: 40, delay: index * 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={[styles.mobileCard, { opacity: cardAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']} style={styles.mobileCardGradient}>
        <View style={styles.mobileCardHeader}>
          <View style={styles.mobileCardTitle}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.cardIcon}>
              <Icon name="car" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.mobileCardName} numberOfLines={1}>
              {item.marque_nom} {item.modele_nom}
            </Text>
          </View>
          {getEtatBadge(item.etat)}
        </View>

        <View style={styles.mobileCardInfo}>
          <View style={styles.mobileInfoGrid}>
            <View style={styles.mobileInfoItem}>
              <Icon name="calendar" size={14} color="#3b82f6" />
              <Text style={styles.mobileInfoLabel}>Année</Text>
              <Text style={styles.mobileInfoValue}>{item.annee}</Text>
            </View>
            <View style={styles.mobileInfoItem}>
              <Icon name="speedometer" size={14} color="#3b82f6" />
              <Text style={styles.mobileInfoLabel}>KM</Text>
              <Text style={styles.mobileInfoValue}>{item.kilometrage?.toLocaleString()} km</Text>
            </View>
            <View style={styles.mobileInfoItem}>
              <Icon name="cash" size={14} color="#3b82f6" />
              <Text style={styles.mobileInfoLabel}>Prix</Text>
              <Text style={[styles.mobileInfoValue, styles.priceValue]}>{formatPrix(item.prix, item.devise)}</Text>
            </View>
          </View>
          <View style={styles.mobileChassisInfo}>
            <Icon name="map-marker" size={12} color="#64748b" />
            <Text style={styles.mobileChassisText}>
              {getPaysEmoji(item.pays)} {item.pays_display || item.pays}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onReserver(item.id)} style={styles.mobileReserverButton} activeOpacity={0.8}>
          <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.mobileActionGradient}>
            <Icon name="calendar-plus" size={18} color="white" />
            <Text style={styles.mobileActionText}>Réserver</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// Composant pour la carte de réservation (mobile)
const ReservationCard = ({ item, index, onAnnuler, formatPrix, formatDate, getPaysEmoji }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, friction: 8, tension: 40, delay: index * 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, [index]);

  const voitureDetail = item.voiture_detail;
  const utilisateurDetail = item.utilisateur_detail;

  return (
    <Animated.View style={[styles.mobileCard, { opacity: cardAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']} style={styles.mobileCardGradient}>
        <View style={styles.mobileCardHeader}>
          <View style={styles.mobileCardTitle}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.cardIcon}>
              <Icon name="clock" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.mobileCardName} numberOfLines={1}>
              {voitureDetail?.marque_nom} {voitureDetail?.modele_nom}
            </Text>
          </View>
          <View style={styles.reservationBadge}>
            <Icon name="calendar-check" size={10} color="#f59e0b" />
            <Text style={styles.reservationBadgeText}>Réservée</Text>
          </View>
        </View>

        <View style={styles.mobileCardInfo}>
          <View style={styles.mobileInfoGrid}>
            <View style={styles.mobileInfoItem}>
              <Icon name="calendar" size={14} color="#f59e0b" />
              <Text style={styles.mobileInfoLabel}>Année</Text>
              <Text style={styles.mobileInfoValue}>{voitureDetail?.annee || 'N/A'}</Text>
            </View>
            <View style={styles.mobileInfoItem}>
              <Icon name="cash" size={14} color="#f59e0b" />
              <Text style={styles.mobileInfoLabel}>Prix</Text>
              <Text style={[styles.mobileInfoValue, styles.priceValue]}>{formatPrix(voitureDetail?.prix, voitureDetail?.devise)}</Text>
            </View>
            <View style={styles.mobileInfoItem}>
              <Icon name="map-marker" size={14} color="#f59e0b" />
              <Text style={styles.mobileInfoLabel}>Pays</Text>
              <Text style={styles.mobileInfoValue}>
                {getPaysEmoji(voitureDetail?.pays)} {voitureDetail?.pays_display || voitureDetail?.pays}
              </Text>
            </View>
          </View>
          <View style={styles.mobileReservationInfo}>
            <View style={styles.mobileInfoRow}>
              <Icon name="calendar-month" size={12} color="#94a3b8" />
              <Text style={styles.mobileInfoLabel}>Réservation</Text>
              <Text style={styles.mobileInfoValue}>{formatDate(item.date_reservation)}</Text>
            </View>
            <View style={styles.mobileInfoRow}>
              <Icon name="account" size={12} color="#94a3b8" />
              <Text style={styles.mobileInfoLabel}>Client</Text>
              <Text style={styles.mobileInfoValue}>{utilisateurDetail?.username || 'Inconnu'}</Text>
              <Text style={styles.mobileInfoEmail}>{utilisateurDetail?.email}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => onAnnuler(item)} style={styles.mobileAnnulerButton} activeOpacity={0.8}>
          <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.mobileActionGradient}>
            <Icon name="delete" size={18} color="white" />
            <Text style={styles.mobileActionText}>Annuler</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// Barre de recherche
const SearchBar = ({ value, onChange, onClear }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchInputContainer}>
      <Icon name="magnify" size={20} color="#94a3b8" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une voiture..."
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChange}
      />
      {value !== '' && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Icon name="close" size={18} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Filtres
const FilterChips = ({ activeFilter, onFilterChange }) => (
  <View style={styles.filterContainer}>
    {['all', 'Disponible', 'Réservée'].map((filter) => (
      <TouchableOpacity
        key={filter}
        style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
        onPress={() => onFilterChange(filter)}
      >
        <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
          {filter === 'all' ? 'Tous' : filter}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function AdminReservations() {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const [voituresDisponibles, setVoituresDisponibles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtat, setFilterEtat] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [stats, setStats] = useState({ total: 0, disponibles: 0, reservees: 0 });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  const isMobile = screenWidth < BREAKPOINTS.MOBILE;

  useFocusEffect(React.useCallback(() => { chargerDonnees(); startAnimations(); return () => {}; }, []));

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
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

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const voituresData = await VoitureService.getAllVoitures();
      let toutesVoitures = [];
      if (Array.isArray(voituresData)) toutesVoitures = voituresData;
      else if (voituresData?.results) toutesVoitures = voituresData.results;

      const disponibles = toutesVoitures.filter(v => v.etat === 'Disponible');
      setVoituresDisponibles(disponibles);

      const reservationsData = await ReservationService.getAllReservations();
      let reservationsList = [];
      if (Array.isArray(reservationsData)) reservationsList = reservationsData;
      else if (reservationsData?.results) reservationsList = reservationsData.results;
      setReservations(reservationsList);

      setStats({ total: reservationsList.length, disponibles: disponibles.length, reservees: reservationsList.length });
    } catch (error) {
      showMessage('error', 'Erreur de chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => { setRefreshing(true); await chargerDonnees(); };

  const handleAnnulerClick = (reservation) => { setReservationToCancel(reservation); setShowConfirmModal(true); };
  const confirmAnnuler = async () => {
    if (!reservationToCancel) return;
    try {
      await ReservationService.deleteReservation(reservationToCancel.id);
      showMessage('success', 'Réservation annulée avec succès');
      await chargerDonnees();
      setShowConfirmModal(false);
      setReservationToCancel(null);
    } catch (error) { showMessage('error', 'Erreur lors de l\'annulation'); }
  };

  const handleReserver = (voitureId) => { navigation.navigate('ReserverVoiture', { voitureId }); };

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'N/A';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    if (isNaN(prixNumber)) return 'N/A';
    const formatted = prixNumber.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    switch(devise?.toUpperCase()) {
      case 'USD': return `$${formatted}`;
      case 'EUR': return `€${formatted}`;
      default: return `${formatted} FCFA`;
    }
  };

  const getPaysEmoji = (pays) => {
    const emojis = {
      'Burundi': '🇧🇮', 'Rwanda': '🇷🇼', 'Tanzanie': '🇹🇿', 'Ouganda': '🇺🇬', 'Kenya': '🇰🇪',
      'RDC': '🇨🇩', 'France': '🇫🇷', 'Belgique': '🇧🇪', 'Allemagne': '🇩🇪', 'Japon': '🇯🇵',
      'USA': '🇺🇸', 'Chine': '🇨🇳', 'Italie': '🇮🇹', 'Espagne': '🇪🇸', 'Suède': '🇸🇪', 'Royaume-Uni': '🇬🇧'
    };
    return emojis[pays] || '🌍';
  };

  const getEtatBadge = (etat) => {
    if (etat === 'Disponible') {
      return <View style={[styles.badge, styles.badgeDisponible]}><Icon name="check-circle" size={10} color="#10b981" /><Text style={[styles.badgeText, styles.badgeTextDisponible]}>Disponible</Text></View>;
    }
    return <View style={[styles.badge, styles.badgeReservee]}><Icon name="clock" size={10} color="#f59e0b" /><Text style={[styles.badgeText, styles.badgeTextReservee]}>Réservée</Text></View>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const voituresFiltrees = voituresDisponibles.filter(v =>
    v.marque_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modele_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reservationsFiltrees = reservations.filter(r =>
    r.voiture_detail?.marque_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.voiture_detail?.modele_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.background} />
      <View style={styles.decorCircle1} /><View style={styles.decorCircle2} />

      {message.text && (
        <Animated.View style={[styles.messageContainer, message.type === 'success' ? styles.messageSuccess : styles.messageError, {
          transform: [{ translateY: messageAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }], opacity: messageAnim
        }]}>
          <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={20} color="white" />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <Animated.View style={[styles.confirmModal, { transform: [{ scale: fadeAnim }] }]}>
            <View style={styles.confirmModalIcon}><Icon name="alert-octagon" size={48} color="#f97316" /></View>
            <Text style={styles.confirmModalTitle}>Confirmer l'annulation</Text>
            <Text style={styles.confirmModalText}>Annuler la réservation de</Text>
            <Text style={styles.confirmModalMarque}>{reservationToCancel?.voiture_detail?.marque_nom} {reservationToCancel?.voiture_detail?.modele_nom}</Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.confirmCancelButton}><Text style={styles.confirmCancelButtonText}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity onPress={confirmAnnuler} style={styles.confirmDeleteButton}><Icon name="delete" size={18} color="white" /><Text style={styles.confirmDeleteButtonText}>Confirmer</Text></TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <StatCard icon="car" value={stats.disponibles + stats.reservees} label="Total" colors={['#3b82f6', '#2563eb']} />
            <StatCard icon="check-circle" value={stats.disponibles} label="Disponibles" colors={['#10b981', '#059669']} />
            <StatCard icon="clock" value={stats.reservees} label="Réservées" colors={['#f59e0b', '#d97706']} />
          </View>

          {/* Recherche et filtres */}
          <SearchBar value={searchTerm} onChange={setSearchTerm} onClear={() => setSearchTerm('')} />
          <FilterChips activeFilter={filterEtat} onFilterChange={setFilterEtat} />

          {/* Voitures Disponibles */}
          {(filterEtat === 'all' || filterEtat === 'Disponible') && (
            <View style={styles.section}>
              <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.sectionHeader}>
                <Icon name="car" size={20} color="white" />
                <Text style={styles.sectionTitle}>Voitures Disponibles ({voituresFiltrees.length})</Text>
              </LinearGradient>
              <FlatList
                data={voituresFiltrees}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <VoitureDisponibleCard
                    item={item} index={index} onReserver={handleReserver}
                    formatPrix={formatPrix} getPaysEmoji={getPaysEmoji} getEtatBadge={getEtatBadge}
                  />
                )}
                scrollEnabled={false}
                ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="car-off" size={48} color="#64748b" /><Text style={styles.emptyText}>Aucune voiture disponible</Text></View>}
              />
            </View>
          )}

          {/* Réservations */}
          {(filterEtat === 'all' || filterEtat === 'Réservée') && (
            <View style={styles.section}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.sectionHeader}>
                <Icon name="clock" size={20} color="white" />
                <Text style={styles.sectionTitle}>Réservations ({reservationsFiltrees.length})</Text>
              </LinearGradient>
              <FlatList
                data={reservationsFiltrees}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <ReservationCard
                    item={item} index={index} onAnnuler={handleAnnulerClick}
                    formatPrix={formatPrix} formatDate={formatDate} getPaysEmoji={getPaysEmoji}
                  />
                )}
                scrollEnabled={false}
                ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="clock" size={48} color="#64748b" /><Text style={styles.emptyText}>Aucune réservation</Text></View>}
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  decorCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59,130,246,0.1)' },
  decorCircle2: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(139,92,246,0.05)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingText: { marginTop: 16, color: '#94a3b8', fontSize: 14 },
  content: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  statCardGradient: { padding: 16 },
  statCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  statIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchContainer: { marginBottom: 16 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: 'white', paddingVertical: 10 },
  clearButton: { padding: 4 },
  filterContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  filterChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filterChipText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  filterChipTextActive: { color: 'white', fontWeight: 'bold' },
  section: { marginBottom: 24, borderRadius: 20, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  mobileCard: { marginBottom: 12, borderRadius: 20, overflow: 'hidden' },
  mobileCardGradient: { padding: 16 },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mobileCardTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  mobileCardName: { fontSize: 16, fontWeight: 'bold', color: 'white', flex: 1 },
  mobileCardInfo: { marginBottom: 16 },
  mobileInfoGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  mobileInfoItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 12, gap: 6 },
  mobileInfoLabel: { fontSize: 10, color: '#94a3b8' },
  mobileInfoValue: { fontSize: 13, color: 'white', fontWeight: '500' },
  priceValue: { color: '#f97316', fontWeight: 'bold' },
  mobileChassisInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.4)', padding: 8, borderRadius: 10, gap: 6, justifyContent: 'center' },
  mobileChassisText: { fontSize: 11, color: '#94a3b8' },
  mobileReservationInfo: { gap: 8, marginTop: 4 },
  mobileInfoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.4)', padding: 8, borderRadius: 10, gap: 8 },
  mobileInfoEmail: { fontSize: 10, color: '#64748b', marginLeft: 4 },
  mobileReserverButton: { borderRadius: 12, overflow: 'hidden' },
  mobileAnnulerButton: { borderRadius: 12, overflow: 'hidden' },
  mobileActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  mobileActionText: { color: 'white', fontWeight: '600', fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeDisponible: { backgroundColor: '#10b98120' },
  badgeReservee: { backgroundColor: '#f59e0b20' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeTextDisponible: { color: '#10b981' },
  badgeTextReservee: { color: '#f59e0b' },
  reservationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f59e0b20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  reservationBadgeText: { fontSize: 10, fontWeight: '600', color: '#f59e0b' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#64748b', marginTop: 12 },
  messageContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, zIndex: 100, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  messageSuccess: { backgroundColor: '#10b981' },
  messageError: { backgroundColor: '#ef4444' },
  messageText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  confirmModal: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, width: width - 40, maxWidth: 320, alignItems: 'center' },
  confirmModalIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmModalTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  confirmModalText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  confirmModalMarque: { fontSize: 16, fontWeight: 'bold', color: '#f97316', marginVertical: 6 },
  confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  confirmCancelButtonText: { color: '#e2e8f0', fontWeight: '500' },
  confirmDeleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#ef4444', gap: 6 },
  confirmDeleteButtonText: { color: 'white', fontWeight: 'bold' },
});