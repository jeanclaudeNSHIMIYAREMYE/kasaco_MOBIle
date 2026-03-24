// src/screens/Modeles.js
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
  RefreshControl,
  StyleSheet,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Supprimé: import Navigation from '../components/Navigation';

const { width, height } = Dimensions.get('window');
const GRID_ITEMS_PER_ROW = 3;
const GRID_ITEM_WIDTH = (width - 48) / GRID_ITEMS_PER_ROW;

const API_BASE_URL = 'http://192.168.1.54:8000/api';

// Composant pour la carte en mode grille
const GridCard = ({ modele, index, onPress, animateItems }) => {
  const scaleAnim = useRef(new Animated.Value(animateItems ? 1 : 0.95)).current;
  const opacityAnim = useRef(new Animated.Value(animateItems ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(animateItems ? 0 : 20)).current;

  useEffect(() => {
    if (animateItems) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateItems]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/media')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/media/${imagePath}`;
  };

  return (
    <Animated.View
      style={[
        styles.gridCard,
        {
          width: GRID_ITEM_WIDTH,
          marginHorizontal: 4,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.gridCardInner}>
        <View style={styles.gridImageContainer}>
          {(modele.photo_url || modele.image_url) ? (
            <Image
              source={{ uri: getImageUrl(modele.photo_url || modele.image_url) }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gridImagePlaceholder}>
              <Icon name="car" size={32} color="#9ca3af" />
            </View>
          )}
          {modele.nb_voitures > 0 && (
            <View style={styles.gridBadge}>
              <Text style={styles.gridBadgeText}>{modele.nb_voitures}</Text>
            </View>
          )}
        </View>
        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={1}>{modele.nom}</Text>
          <Text style={styles.gridCount}>
            {modele.nb_voitures || 0} voiture{modele.nb_voitures > 1 ? 's' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant pour la ligne en mode liste
const ListItem = ({ modele, index, onPress, animateItems }) => {
  const opacityAnim = useRef(new Animated.Value(animateItems ? 1 : 0)).current;
  const translateXAnim = useRef(new Animated.Value(animateItems ? 0 : -20)).current;

  useEffect(() => {
    if (animateItems) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateXAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateItems]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/media')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/media/${imagePath}`;
  };

  return (
    <Animated.View
      style={[
        styles.listItem,
        {
          opacity: opacityAnim,
          transform: [{ translateX: translateXAnim }],
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.listItemInner}>
        <View style={styles.listLeft}>
          <View style={styles.listImageContainer}>
            {(modele.photo_url || modele.image_url) ? (
              <Image
                source={{ uri: getImageUrl(modele.photo_url || modele.image_url) }}
                style={styles.listImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.listImagePlaceholder}>
                <Icon name="car" size={20} color="#9ca3af" />
              </View>
            )}
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.listName}>{modele.nom}</Text>
          </View>
        </View>
        <View style={styles.listRight}>
          <Text style={[
            styles.listCount,
            modele.nb_voitures > 0 ? styles.listCountAvailable : styles.listCountEmpty
          ]}>
            {modele.nb_voitures || 0} véhicule{modele.nb_voitures > 1 ? 's' : ''}
          </Text>
          <Icon name="chevron-right" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant pour la section groupée par lettre
const SectionGroup = ({ letter, modeles, index, viewMode, onPressModele, animateItems }) => {
  const fadeAnim = useRef(new Animated.Value(animateItems ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(animateItems ? 0 : 20)).current;

  useEffect(() => {
    if (animateItems) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateItems]);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={['#ef4444', '#8b5cf6']}
          style={styles.sectionLetterContainer}
        >
          <Text style={styles.sectionLetter}>{letter}</Text>
        </LinearGradient>
        <Text style={styles.sectionTitle}>Modèles commençant par {letter}</Text>
      </View>

      {viewMode === 'grid' ? (
        <View style={styles.gridContainer}>
          {modeles.map((modele, idx) => (
            <GridCard
              key={modele.id}
              modele={modele}
              index={idx}
              onPress={() => onPressModele(modele.id, modele.nom)}
              animateItems={animateItems}
            />
          ))}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {modeles.map((modele, idx) => (
            <ListItem
              key={modele.id}
              modele={modele}
              index={idx}
              onPress={() => onPressModele(modele.id, modele.nom)}
              animateItems={animateItems}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

export default function Modeles() {
  const navigation = useNavigation();
  const route = useRoute();
  const { marqueId, marqueName } = route.params || {};

  const [marque, setMarque] = useState(null);
  const [modeles, setModeles] = useState([]);
  const [groupedModeles, setGroupedModeles] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [animateItems, setAnimateItems] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (marqueId) {
      fetchData();
    } else {
      setError('ID de marque manquant');
      setLoading(false);
    }
    startAnimations();
  }, [marqueId]);

  useEffect(() => {
    filterModeles();
  }, [searchTerm, modeles]);

  useEffect(() => {
    setTimeout(() => setAnimateItems(true), 100);
  }, [groupedModeles]);

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
      setError(null);
      console.log("🔄 Chargement des données pour marque ID:", marqueId);

      // Récupérer les modèles de la marque
      const modelesResponse = await fetch(`${API_BASE_URL}/modelesuser/?marque=${marqueId}`);
      let modelesData = [];

      if (modelesResponse.ok) {
        const data = await modelesResponse.json();
        if (Array.isArray(data)) {
          modelesData = data;
        } else if (data && data.results) {
          modelesData = data.results;
        }
      }

      setModeles(modelesData);

      // Récupérer les infos de la marque
      if (marqueName) {
        setMarque({ nom: marqueName, id: marqueId });
      } else {
        const marqueResponse = await fetch(`${API_BASE_URL}/marquesuser/${marqueId}/`);
        if (marqueResponse.ok) {
          const marqueData = await marqueResponse.json();
          setMarque(marqueData);
        }
      }

      // Grouper les modèles par première lettre
      groupModelesByLetter(modelesData);

    } catch (err) {
      console.error("❌ Erreur:", err);
      setError("Impossible de charger les modèles");
      Alert.alert('Erreur', 'Impossible de charger les modèles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupModelesByLetter = (modelesData) => {
    const grouped = {};
    modelesData.forEach((modele) => {
      if (modele.nom) {
        const firstLetter = modele.nom.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
          grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(modele);
      }
    });

    const sortedGrouped = {};
    Object.keys(grouped)
      .sort()
      .forEach((letter) => {
        sortedGrouped[letter] = grouped[letter].sort((a, b) =>
          a.nom.localeCompare(b.nom)
        );
      });

    setGroupedModeles(sortedGrouped);
  };

  const filterModeles = () => {
    if (!searchTerm) {
      groupModelesByLetter(modeles);
    } else {
      const filteredModeles = modeles.filter(modele =>
        modele.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      groupModelesByLetter(filteredModeles);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleModelePress = (modeleId, modeleName) => {
    // Navigation vers RechercheModele au lieu de Search
    navigation.navigate('RechercheModele', { modeleId, modeleName });
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const filteredGrouped = groupedModeles;
  const hasModeles = Object.keys(filteredGrouped).length > 0;
  const totalModeles = Object.values(filteredGrouped).flat().length;

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Chargement des modèles...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-circle" size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Oups !</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity onPress={handleGoBack} style={styles.retryButton}>
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
      {/* Bannière de la marque */}
      <LinearGradient
        colors={['#ef4444', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          {marque?.logo_url && (
            <View style={styles.bannerLogoContainer}>
              <Image
                source={{ uri: getImageUrl(marque.logo_url) }}
                style={styles.bannerLogo}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={styles.bannerTitle}>
            {marque?.nom || "Modèles disponibles"}
          </Text>
        </View>
      </LinearGradient>

      {/* Barre d'outils */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#374151" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.toolbarRight}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={18} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Rechercher un modèle..."
              placeholderTextColor="#9ca3af"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm !== '' && (
              <TouchableOpacity onPress={clearSearch}>
                <Icon name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            >
              <Icon name="view-grid" size={20} color={viewMode === 'grid' ? 'white' : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            >
              <Icon name="view-list" size={20} color={viewMode === 'list' ? 'white' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Résultats de recherche */}
      {searchTerm !== '' && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsText}>
            {hasModeles ? `${totalModeles} résultat(s) pour "${searchTerm}"` : `Aucun résultat pour "${searchTerm}"`}
          </Text>
        </View>
      )}

      {/* Liste des modèles */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {hasModeles ? (
            Object.entries(filteredGrouped).map(([letter, modelesList], index) => (
              <SectionGroup
                key={letter}
                letter={letter}
                modeles={modelesList}
                index={index}
                viewMode={viewMode}
                onPressModele={handleModelePress}
                animateItems={animateItems}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="car-off" size={64} color="#9ca3af" />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchTerm ? "Aucun résultat" : "Aucun modèle disponible"}
                </Text>
                <Text style={styles.emptyMessage}>
                  {searchTerm
                    ? `Aucun modèle ne correspond à "${searchTerm}"`
                    : "Cette marque ne propose pas encore de modèles"}
                </Text>
                {searchTerm ? (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                    <Text style={styles.clearSearchButtonText}>Effacer la recherche</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleGoBack} style={styles.backToMarquesButton}>
                    <Icon name="arrow-left" size={18} color="white" />
                    <Text style={styles.backToMarquesText}>Retour aux marques</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingWrapper: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '90%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
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
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  banner: {
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bannerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bannerLogoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bannerLogo: {
    width: '100%',
    height: '100%',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 40,
    width: 200,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    paddingVertical: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#ef4444',
  },
  searchResults: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  searchResultsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionLetterContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridCard: {
    marginBottom: 12,
  },
  gridCardInner: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gridImageContainer: {
    height: 100,
    position: 'relative',
    backgroundColor: '#f3f4f6',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridContent: {
    padding: 12,
    alignItems: 'center',
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  gridCount: {
    fontSize: 10,
    color: '#6b7280',
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  listItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  listCountAvailable: {
    color: '#10b981',
  },
  listCountEmpty: {
    color: '#9ca3af',
  },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearSearchButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  clearSearchButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  backToMarquesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  backToMarquesText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});