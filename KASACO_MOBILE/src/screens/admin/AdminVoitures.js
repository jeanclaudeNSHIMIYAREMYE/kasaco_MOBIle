// src/screens/admin/AdminVoitures.js
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
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  useWindowDimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { VoitureService } from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Breakpoints pour les différents écrans
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// Composant pour la carte mobile (optimisé)
const VoitureCard = ({ item, index, onDelete, formatPrix, getPaysEmoji, getEtatBadge }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
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
        styles.mobileCard,
        {
          opacity: cardAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']}
        style={styles.mobileCardGradient}
      >
        <View style={styles.mobileCardHeader}>
          <View style={styles.mobileCardTitle}>
            <LinearGradient colors={['#f97316', '#ea580c']} style={styles.cardIcon}>
              <Icon name="car" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.mobileCardName} numberOfLines={1}>
              {item.marque_nom} {item.modele_nom}
            </Text>
          </View>
          {getEtatBadge(item.etat)}
        </View>

        {/* Image du véhicule */}
        {(item.photo_url || item.photo_principale) && (
          <View style={styles.mobileCardImageContainer}>
            <Image
              source={{ uri: getImageUrl(item.photo_url || item.photo_principale) }}
              style={styles.mobileCardImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <View style={styles.imageIdBadge}>
              <Icon name="barcode" size={10} color="white" />
              <Text style={styles.imageIdText}>#{item.id}</Text>
            </View>
          </View>
        )}

        <View style={styles.mobileCardInfo}>
          <View style={styles.mobileInfoGrid}>
            <View style={styles.mobileInfoItem}>
              <Icon name="calendar" size={14} color="#f97316" />
              <Text style={styles.mobileInfoLabel}>Année</Text>
              <Text style={styles.mobileInfoValue}>{item.annee}</Text>
            </View>
            <View style={styles.mobileInfoItem}>
              <Icon name="cash" size={14} color="#f97316" />
              <Text style={styles.mobileInfoLabel}>Prix</Text>
              <Text style={[styles.mobileInfoValue, styles.priceValue]}>
                {formatPrix(item.prix, item.devise)}
              </Text>
            </View>
            <View style={styles.mobileInfoItem}>
              <Icon name="map-marker" size={14} color="#f97316" />
              <Text style={styles.mobileInfoLabel}>Pays</Text>
              <Text style={styles.mobileInfoValue}>
                {getPaysEmoji(item.pays)} {item.pays_display || item.pays}
              </Text>
            </View>
          </View>

          <View style={styles.mobileChassisInfo}>
            <Icon name="barcode" size={12} color="#64748b" />
            <Text style={styles.mobileChassisText} numberOfLines={1}>
              Châssis: {item.numero_chassis?.substring(0, 12)}...
            </Text>
          </View>
        </View>

        <View style={styles.mobileActionButtons}>
          <TouchableOpacity 
            onPress={() => onDelete(item)} 
            style={styles.mobileDeleteButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.mobileDeleteGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="trash-can-outline" size={16} color="white" />
              <Text style={styles.mobileDeleteText}>Supprimer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Composant pour la carte de statistiques
const StatCard = ({ icon, value, label, color, onPress, animate, index }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, delay: index * 100, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 40, delay: index * 100, useNativeDriver: true }),
      ]).start();
    }
  }, [animate]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], flex: 1 }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.statCard}>
        <LinearGradient
          colors={[color + '20', color + '10']}
          style={styles.statCardGradient}
        >
          <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant pour la recherche
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

export default function AdminVoitures() {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const [voitures, setVoitures] = useState([]);
  const [filteredVoitures, setFilteredVoitures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [voitureToDelete, setVoitureToDelete] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    reservees: 0,
    vendues: 0
  });
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  const itemsPerPage = 10;
  const isMobile = screenWidth < BREAKPOINTS.MOBILE;

  useFocusEffect(
    React.useCallback(() => {
      chargerVoitures();
      startAnimations();
      setTimeout(() => setAnimateStats(true), 300);
      return () => {};
    }, [])
  );

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
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

  const chargerVoitures = async () => {
    try {
      setLoading(true);
      const data = await VoitureService.getAllVoitures();
      
      let voituresList = [];
      if (Array.isArray(data)) {
        voituresList = data;
      } else if (data && data.results) {
        voituresList = data.results;
      }
      
      setVoitures(voituresList);
      setFilteredVoitures(voituresList);
      
      const disponibles = voituresList.filter(v => v.etat?.toLowerCase() === 'disponible').length;
      const reservees = voituresList.filter(v => v.etat?.toLowerCase() === 'réservée').length;
      const vendues = voituresList.filter(v => v.etat?.toLowerCase() === 'vendue').length;
      
      setStats({
        total: voituresList.length,
        disponibles,
        reservees,
        vendues
      });
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerVoitures();
  };

  useEffect(() => {
    const filtered = voitures.filter(voiture =>
      voiture.marque_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voiture.modele_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voiture.numero_chassis?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVoitures(filtered);
    setCurrentPage(1);
  }, [searchTerm, voitures]);

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'N/A';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    if (isNaN(prixNumber)) return 'N/A';
    const formatted = prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    switch(devise?.toUpperCase()) {
      case 'USD': return `$${formatted}`;
      case 'EUR': return `€${formatted}`;
      default: return `${formatted} FCFA`;
    }
  };

  const getPaysEmoji = (pays) => {
    const emojis = {
      'Burundi': '🇧🇮', 'Rwanda': '🇷🇼', 'Tanzanie': '🇹🇿',
      'Ouganda': '🇺🇬', 'Kenya': '🇰🇪', 'RDC': '🇨🇩',
      'France': '🇫🇷', 'Belgique': '🇧🇪', 'Allemagne': '🇩🇪',
      'Japon': '🇯🇵', 'USA': '🇺🇸', 'Chine': '🇨🇳'
    };
    return emojis[pays] || '🌍';
  };

  const getEtatBadge = (etat) => {
    const config = {
      'disponible': { bg: '#10b98120', text: '#10b981', label: 'Disponible', icon: 'check-circle' },
      'réservée': { bg: '#f59e0b20', text: '#f59e0b', label: 'Réservée', icon: 'clock-outline' },
      'vendue': { bg: '#6b728020', text: '#6b7280', label: 'Vendue', icon: 'sale' }
    };
    const style = config[etat?.toLowerCase()] || { bg: '#ef444420', text: '#ef4444', label: 'Indisponible', icon: 'close-circle' };
    return (
      <View style={[styles.badge, { backgroundColor: style.bg }]}>
        <Icon name={style.icon} size={10} color={style.text} />
        <Text style={[styles.badgeText, { color: style.text }]}>{style.label}</Text>
      </View>
    );
  };

  const handleDeleteClick = (voiture) => {
    setVoitureToDelete(voiture);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!voitureToDelete) return;
    
    try {
      await VoitureService.deleteVoiture(voitureToDelete.id);
      showMessage('success', `"${voitureToDelete.marque_nom} ${voitureToDelete.modele_nom}" supprimée`);
      await chargerVoitures();
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    } finally {
      setShowConfirmModal(false);
      setVoitureToDelete(null);
    }
  };

  const paginatedVoitures = filteredVoitures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredVoitures.length / itemsPerPage);

  const renderMobileItem = ({ item, index }) => (
    <VoitureCard
      item={item}
      index={index}
      onDelete={handleDeleteClick}
      formatPrix={formatPrix}
      getPaysEmoji={getPaysEmoji}
      getEtatBadge={getEtatBadge}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Chargement des véhicules...</Text>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <Animated.View style={[styles.decorCircle1, { opacity: headerAnim }]} />
      <Animated.View style={[styles.decorCircle2, { opacity: headerAnim }]} />

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

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <Animated.View style={[styles.confirmModal, { transform: [{ scale: fadeAnim }] }]}>
            <View style={styles.confirmModalIcon}>
              <Icon name="alert-octagon" size={48} color="#f97316" />
            </View>
            <Text style={styles.confirmModalTitle}>Supprimer le véhicule</Text>
            <Text style={styles.confirmModalText}>
              Êtes-vous sûr de vouloir supprimer
            </Text>
            <Text style={styles.confirmModalMarque}>
              {voitureToDelete?.marque_nom} {voitureToDelete?.modele_nom}
            </Text>
            <Text style={styles.confirmModalWarning}>
              Cette action est irréversible
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.confirmCancelButton}>
                <Text style={styles.confirmCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.confirmDeleteButton}>
                <Icon name="delete" size={18} color="white" />
                <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} tintColor="#f97316" />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
            <LinearGradient colors={['#f97316', '#ea580c']} style={styles.headerIcon}>
              <Icon name="car-multiple" size={28} color="white" />
            </LinearGradient>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Gestion des Véhicules</Text>
              <Text style={styles.headerSubtitle}>
                {filteredVoitures.length} véhicule{filteredVoitures.length > 1 ? 's' : ''}
              </Text>
            </View>
          </Animated.View>

          <View style={styles.statsContainer}>
            <StatCard icon="car" value={stats.total} label="Total" color="#f97316" onPress={() => {}} animate={animateStats} index={0} />
            <StatCard icon="check-circle" value={stats.disponibles} label="Disponibles" color="#10b981" onPress={() => {}} animate={animateStats} index={1} />
            <StatCard icon="clock-outline" value={stats.reservees} label="Réservées" color="#f59e0b" onPress={() => {}} animate={animateStats} index={2} />
          </View>

          <View style={styles.actionBar}>
            <SearchBar 
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
            />
            <TouchableOpacity 
              onPress={() => navigation.navigate('AjouterVoiture')} 
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                style={styles.addButtonGradient}
              >
                <Icon name="plus" size={20} color="white" />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <FlatList
            data={paginatedVoitures}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderMobileItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LinearGradient colors={['rgba(30,41,59,0.6)', 'rgba(15,23,42,0.8)']} style={styles.emptyCard}>
                  <Icon name="car-off" size={64} color="#475569" />
                  <Text style={styles.emptyTitle}>Aucun véhicule</Text>
                  <Text style={styles.emptyText}>
                    {searchTerm ? 'Aucun résultat pour cette recherche' : 'Commencez par ajouter votre premier véhicule'}
                  </Text>
                  {searchTerm === '' && (
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('AjouterVoiture')} 
                      style={styles.emptyAddButton}
                    >
                      <LinearGradient
                        colors={['#f97316', '#ea580c']}
                        style={styles.emptyAddGradient}
                      >
                        <Icon name="plus" size={16} color="white" />
                        <Text style={styles.emptyAddText}>Ajouter un véhicule</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </View>
            }
          />

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              >
                <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#475569' : '#f97316'} />
              </TouchableOpacity>
              <LinearGradient colors={['rgba(249,115,22,0.2)', 'rgba(249,115,22,0.1)']} style={styles.paginationBadge}>
                <Text style={styles.paginationText}>{currentPage}</Text>
              </LinearGradient>
              <Text style={styles.paginationSeparator}>/</Text>
              <Text style={styles.paginationTotal}>{totalPages}</Text>
              <TouchableOpacity
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
              >
                <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#475569' : '#f97316'} />
              </TouchableOpacity>
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
  decorCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(249,115,22,0.1)' },
  decorCircle2: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(249,115,22,0.05)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingCard: { borderRadius: 20, padding: 30, alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#94a3b8', fontSize: 14 },
  content: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  statCardGradient: { padding: 12, alignItems: 'center', gap: 8 },
  statIconContainer: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 11, color: '#94a3b8' },
  actionBar: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  searchContainer: { flex: 1 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: 'white', paddingVertical: 10 },
  clearButton: { padding: 4 },
  addButton: { borderRadius: 12, overflow: 'hidden' },
  addButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  addButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  mobileCard: { marginBottom: 12, borderRadius: 20, overflow: 'hidden' },
  mobileCardGradient: { padding: 16 },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mobileCardTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  mobileCardName: { fontSize: 16, fontWeight: 'bold', color: 'white', flex: 1 },
  mobileCardImageContainer: { position: 'relative', height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  mobileCardImage: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
  imageIdBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  imageIdText: { color: 'white', fontSize: 10, fontFamily: 'monospace' },
  mobileCardInfo: { marginBottom: 16 },
  mobileInfoGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  mobileInfoItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 12, gap: 6 },
  mobileInfoLabel: { fontSize: 10, color: '#94a3b8' },
  mobileInfoValue: { fontSize: 13, color: 'white', fontWeight: '500' },
  priceValue: { color: '#f97316', fontWeight: 'bold' },
  mobileChassisInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.4)', padding: 8, borderRadius: 10, gap: 6 },
  mobileChassisText: { fontSize: 10, color: '#64748b', fontFamily: 'monospace', flex: 1 },
  mobileActionButtons: { flexDirection: 'row', gap: 12 },
  mobileDeleteButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  mobileDeleteGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
  mobileDeleteText: { color: 'white', fontWeight: '600', fontSize: 13 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { paddingVertical: 40 },
  emptyCard: { borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#94a3b8', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center', marginBottom: 16 },
  emptyAddButton: { borderRadius: 12, overflow: 'hidden' },
  emptyAddGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  emptyAddText: { color: 'white', fontWeight: '600', fontSize: 13 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  paginationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(30,41,59,0.8)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
  paginationButtonDisabled: { backgroundColor: 'rgba(30,41,59,0.4)', borderColor: 'rgba(71,85,105,0.3)' },
  paginationBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  paginationText: { fontSize: 18, fontWeight: 'bold', color: '#f97316' },
  paginationSeparator: { color: '#475569', fontSize: 16 },
  paginationTotal: { color: '#94a3b8', fontSize: 16 },
  messageContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, zIndex: 100, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  messageSuccess: { backgroundColor: '#10b981' },
  messageError: { backgroundColor: '#ef4444' },
  messageText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  confirmModal: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, width: width - 40, maxWidth: 320, alignItems: 'center' },
  confirmModalIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(249,115,22,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmModalTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  confirmModalText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  confirmModalMarque: { fontSize: 16, fontWeight: 'bold', color: '#f97316', marginVertical: 6 },
  confirmModalWarning: { fontSize: 11, color: '#64748b', marginBottom: 20 },
  confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  confirmCancelButtonText: { color: '#e2e8f0', fontWeight: '500' },
  confirmDeleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#ef4444', gap: 6 },
  confirmDeleteButtonText: { color: 'white', fontWeight: 'bold' },
});