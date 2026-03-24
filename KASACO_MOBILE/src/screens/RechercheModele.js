// src/screens/RechercheModele.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
  Animated,
  Modal,
  RefreshControl,
  StyleSheet,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Supprimé: import Navigation from '../components/Navigation';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.54:8000/api';

// Composant de carte voiture
const VoitureCard = ({ voiture, index, onPress, animateResults }) => {
  const scaleAnim = useRef(new Animated.Value(animateResults ? 1 : 0.95)).current;
  const opacityAnim = useRef(new Animated.Value(animateResults ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(animateResults ? 0 : 30)).current;

  useEffect(() => {
    if (animateResults) {
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
    }
  }, [animateResults]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/media')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/media/${imagePath}`;
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

  return (
    <Animated.View
      style={[
        styles.voitureCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.voitureCardInner}>
        <View style={styles.voitureImageContainer}>
          {voiture.photo_url ? (
            <Image
              source={{ uri: getImageUrl(voiture.photo_url) }}
              style={styles.voitureImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.voitureImagePlaceholder}>
              <Icon name="car" size={40} color="#6b7280" />
            </View>
          )}
          <View style={styles.voitureBadge}>
            <Text style={styles.voitureBadgeText}>Disponible</Text>
          </View>
        </View>

        <View style={styles.voitureInfo}>
          <Text style={styles.voitureName} numberOfLines={1}>
            {voiture.marque_nom} {voiture.modele_nom}
          </Text>
          <View style={styles.voitureDetails}>
            <Text style={styles.voitureDetailText}>{voiture.annee}</Text>
            <Text style={styles.voitureDetailText}>•</Text>
            <Text style={styles.voitureDetailText}>{voiture.transmission}</Text>
          </View>
          <View style={styles.voiturePriceRow}>
            <Text style={styles.voiturePrice}>
              {formatPrix(voiture.prix, voiture.devise)}
            </Text>
            <Icon name="arrow-right" size={18} color="#f97316" />
          </View>
          {voiture.kilometrage && (
            <Text style={styles.voitureKm}>
              {voiture.kilometrage.toLocaleString()} km
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de filtre actif
const ActiveFilter = ({ label, value, onRemove }) => (
  <View style={styles.activeFilter}>
    <Text style={styles.activeFilterText}>
      {label}: <Text style={styles.activeFilterValue}>{value}</Text>
    </Text>
    <TouchableOpacity onPress={onRemove} style={styles.activeFilterRemove}>
      <Icon name="close" size={12} color="white" />
    </TouchableOpacity>
  </View>
);

export default function RechercheModele() {
  const navigation = useNavigation();
  const route = useRoute();
  const { modeleId, modeleName } = route.params || {};

  const [modele, setModele] = useState(null);
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const [filters, setFilters] = useState({
    annee_min: '',
    annee_max: '',
    prix_min: '',
    prix_max: '',
    transmission: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (modeleId) {
      fetchData();
    } else {
      setError("Aucun modèle spécifié");
      setLoading(false);
    }
    startAnimations();
  }, [modeleId, filters]);

  useEffect(() => {
    setTimeout(() => setAnimateResults(true), 100);
  }, [voitures]);

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/media')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/media/${imagePath}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setAnimateResults(false);
      console.log("🔄 Chargement pour modèle ID:", modeleId);

      // Récupérer les infos du modèle
      const modelesResponse = await fetch(`${API_BASE_URL}/modelesuser/${modeleId}/`);
      
      if (!modelesResponse.ok) {
        throw new Error("Modèle non trouvé");
      }

      const modeleData = await modelesResponse.json();
      console.log("✅ Modèle trouvé:", modeleData);
      setModele(modeleData);

      // Construire l'URL avec les filtres
      let url = `${API_BASE_URL}/voituresuser/?modele=${modeleId}`;
      if (filters.annee_min) url += `&annee_min=${filters.annee_min}`;
      if (filters.annee_max) url += `&annee_max=${filters.annee_max}`;
      if (filters.prix_min) url += `&prix_min=${filters.prix_min}`;
      if (filters.prix_max) url += `&prix_max=${filters.prix_max}`;
      if (filters.transmission) url += `&transmission=${filters.transmission}`;

      // Récupérer les voitures
      const voituresResponse = await fetch(url);
      let voituresData = [];

      if (voituresResponse.ok) {
        const data = await voituresResponse.json();
        if (Array.isArray(data)) {
          voituresData = data;
        } else if (data && data.results) {
          voituresData = data.results;
        }
      }

      setVoitures(voituresData);

    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.message || "Impossible de charger les données");
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setShowFilters(false);
    fetchData();
  };

  const resetFilters = () => {
    setFilters({
      annee_min: '',
      annee_max: '',
      prix_min: '',
      prix_max: '',
      transmission: '',
    });
    fetchData();
  };

  const removeFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: '' }));
    setTimeout(() => fetchData(), 100);
  };

  const handleGoBack = () => {
    if (modele?.marque_id) {
      navigation.navigate('Modeles', { marqueId: modele.marque_id });
    } else {
      navigation.goBack();
    }
  };

  const handleVoiturePress = (voitureId) => {
    navigation.navigate('VoitureDetail', { id: voitureId });
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

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      </View>
    );
  }

  if (error || !modele) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-circle" size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Oups !</Text>
          <Text style={styles.errorMessage}>{error || "Modèle non trouvé"}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Marques')} style={styles.retryButton}>
            <LinearGradient
              colors={['#ef4444', '#8b5cf6']}
              style={styles.retryGradient}
            >
              <Icon name="arrow-left" size={18} color="white" />
              <Text style={styles.retryText}>Retour aux marques</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Éléments décoratifs */}
      <View style={styles.decorTopRight} />
      <View style={styles.decorBottomLeft} />

      {/* En-tête du modèle */}
      <LinearGradient
        colors={['#ef4444', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="white" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          {modele.marque_logo && (
            <View style={styles.marqueLogoContainer}>
              <Image
                source={{ uri: getImageUrl(modele.marque_logo) }}
                style={styles.marqueLogo}
                resizeMode="contain"
              />
            </View>
          )}
          <View>
            <Text style={styles.modeleName}>
              {modele.marque_nom} {modele.nom}
            </Text>
            <Text style={styles.modeleCount}>
              {voitures.length} véhicule{voitures.length > 1 ? 's' : ''} disponible{voitures.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* Barre de filtres */}
        <View style={styles.filtersBar}>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          >
            <Icon name="filter-variant" size={18} color="white" />
            <Text style={styles.filterButtonText}>Filtres avancés</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Filtres actifs */}
          {activeFiltersCount > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
              {filters.annee_min && (
                <ActiveFilter
                  label="Année min"
                  value={filters.annee_min}
                  onRemove={() => removeFilter('annee_min')}
                />
              )}
              {filters.annee_max && (
                <ActiveFilter
                  label="Année max"
                  value={filters.annee_max}
                  onRemove={() => removeFilter('annee_max')}
                />
              )}
              {filters.prix_min && (
                <ActiveFilter
                  label="Prix min"
                  value={`${parseInt(filters.prix_min).toLocaleString()} FCFA`}
                  onRemove={() => removeFilter('prix_min')}
                />
              )}
              {filters.prix_max && (
                <ActiveFilter
                  label="Prix max"
                  value={`${parseInt(filters.prix_max).toLocaleString()} FCFA`}
                  onRemove={() => removeFilter('prix_max')}
                />
              )}
              {filters.transmission && (
                <ActiveFilter
                  label="Transmission"
                  value={filters.transmission}
                  onRemove={() => removeFilter('transmission')}
                />
              )}
            </ScrollView>
          )}
        </View>

        {/* Modal des filtres */}
        <Modal visible={showFilters} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtres avancés</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.filterLabel}>Année</Text>
                <View style={styles.filterRow}>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Année min"
                    placeholderTextColor="#9ca3af"
                    value={filters.annee_min}
                    onChangeText={(text) => handleFilterChange('annee_min', text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.filterSeparator}>-</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Année max"
                    placeholderTextColor="#9ca3af"
                    value={filters.annee_max}
                    onChangeText={(text) => handleFilterChange('annee_max', text)}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.filterLabel}>Prix (FCFA)</Text>
                <View style={styles.filterRow}>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Prix min"
                    placeholderTextColor="#9ca3af"
                    value={filters.prix_min}
                    onChangeText={(text) => handleFilterChange('prix_min', text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.filterSeparator}>-</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Prix max"
                    placeholderTextColor="#9ca3af"
                    value={filters.prix_max}
                    onChangeText={(text) => handleFilterChange('prix_max', text)}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.filterLabel}>Transmission</Text>
                <View style={styles.transmissionOptions}>
                  <TouchableOpacity
                    style={[styles.transmissionOption, filters.transmission === 'Manuelle' && styles.transmissionOptionActive]}
                    onPress={() => handleFilterChange('transmission', 'Manuelle')}
                  >
                    <Text style={[styles.transmissionOptionText, filters.transmission === 'Manuelle' && styles.transmissionOptionTextActive]}>
                      Manuelle
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.transmissionOption, filters.transmission === 'Automatique' && styles.transmissionOptionActive]}
                    onPress={() => handleFilterChange('transmission', 'Automatique')}
                  >
                    <Text style={[styles.transmissionOptionText, filters.transmission === 'Automatique' && styles.transmissionOptionTextActive]}>
                      Automatique
                    </Text>
                  </TouchableOpacity>
                  {filters.transmission !== '' && (
                    <TouchableOpacity
                      style={styles.transmissionClear}
                      onPress={() => handleFilterChange('transmission', '')}
                    >
                      <Text style={styles.transmissionClearText}>Effacer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                  <Icon name="refresh" size={18} color="#6b7280" />
                  <Text style={styles.resetButtonText}>Réinitialiser</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
                  <LinearGradient
                    colors={['#ef4444', '#f97316']}
                    style={styles.applyGradient}
                  >
                    <Icon name="check" size={18} color="white" />
                    <Text style={styles.applyButtonText}>Appliquer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Liste des voitures */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />
          }
        >
          {voitures.length > 0 ? (
            <>
              <View style={styles.voituresGrid}>
                {voitures.map((voiture, index) => (
                  <VoitureCard
                    key={voiture.id}
                    voiture={voiture}
                    index={index}
                    onPress={() => handleVoiturePress(voiture.id)}
                    animateResults={animateResults}
                  />
                ))}
              </View>
              <Text style={styles.resultCount}>
                {voitures.length} résultat{voitures.length > 1 ? 's' : ''} trouvé{voitures.length > 1 ? 's' : ''}
              </Text>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="car-search" size={64} color="#6b7280" />
                </View>
                <Text style={styles.emptyTitle}>Aucun résultat</Text>
                <Text style={styles.emptyMessage}>
                  Aucune voiture ne correspond à vos critères de recherche
                </Text>
                <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
                  <LinearGradient
                    colors={['#ef4444', '#8b5cf6']}
                    style={styles.emptyButtonGradient}
                  >
                    <Icon name="refresh" size={18} color="white" />
                    <Text style={styles.emptyButtonText}>Réinitialiser les filtres</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  decorTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139,92,246,0.05)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  loadingWrapper: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#94a3b8',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  errorCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '90%',
    maxWidth: 300,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  marqueLogoContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
  },
  marqueLogo: {
    width: '100%',
    height: '100%',
  },
  modeleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modeleCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filtersBar: {
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
  },
  filterBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeFiltersScroll: {
    flexDirection: 'row',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
  },
  activeFilterValue: {
    fontWeight: 'bold',
  },
  activeFilterRemove: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 2,
  },
  scrollView: {
    flex: 1,
  },
  voituresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  voitureCard: {
    width: '48%',
    marginBottom: 16,
  },
  voitureCardInner: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  voitureImageContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#1f2937',
  },
  voitureImage: {
    width: '100%',
    height: '100%',
  },
  voitureImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voitureBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voitureBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  voitureInfo: {
    padding: 12,
  },
  voitureName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  voitureDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  voitureDetailText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  voiturePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  voiturePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f97316',
  },
  voitureKm: {
    fontSize: 10,
    color: '#6b7280',
  },
  resultCount: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginVertical: 20,
  },
  emptyContainer: {
    paddingVertical: 60,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: 8,
    marginTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
  filterSeparator: {
    color: '#9ca3af',
    fontSize: 16,
  },
  transmissionOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  transmissionOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
  },
  transmissionOptionActive: {
    backgroundColor: '#ef4444',
  },
  transmissionOptionText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  transmissionOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  transmissionClear: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  transmissionClearText: {
    color: '#ef4444',
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});