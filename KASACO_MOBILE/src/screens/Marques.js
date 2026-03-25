// src/screens/Marques.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  FlatList,
  StatusBar,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

// Couleurs
const Colors = {
  primary: '#ef4444',
  primaryDark: '#dc2626',
  secondary: '#1f2937',
  secondaryLight: '#374151',
  white: '#ffffff',
  black: '#000000',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Fonction pour obtenir l'URL complète de l'image
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseURL = 'http://192.168.1.54:8000';
  if (path.startsWith('/media')) return `${baseURL}${path}`;
  return `${baseURL}/media/${path}`;
};

// Composant de carte marque optimisé (petite carte attirante)
const MarqueCard = ({ marque, index, onPress, animateItems }) => {
  const scaleAnim = useRef(new Animated.Value(animateItems ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(animateItems ? 1 : 0)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (animateItems) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateItems]);

  return (
    <Animated.View
      style={[
        styles.marqueCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']}
          style={styles.marqueCardInner}
        >
          <View style={styles.marqueLogoContainer}>
            {!imageError && marque.logo ? (
              <Image
                source={{ uri: getImageUrl(marque.logo) }}
                style={styles.marqueLogo}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <LinearGradient
                colors={[Colors.primary, '#f97316']}
                style={styles.marqueFallback}
              >
                <Text style={styles.marqueFallbackText}>
                  {marque.nom?.charAt(0).toUpperCase() || '?'}
                </Text>
              </LinearGradient>
            )}
          </View>
          <Text style={styles.marqueNom} numberOfLines={1}>{marque.nom}</Text>
          <View style={styles.marqueStats}>
            <Icon name="car" size={12} color="#f97316" />
            <Text style={styles.marqueCount}>
              {marque.nb_modeles || 0} modèles
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de chargement
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.loadingCard}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Chargement des marques...</Text>
    </LinearGradient>
  </View>
);

// Composant d'erreur
const ErrorMessage = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <LinearGradient
      colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']}
      style={styles.errorCard}
    >
      <Icon name="alert-circle" size={48} color={Colors.primary} />
      <Text style={styles.errorTitle}>Oups !</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <LinearGradient
          colors={[Colors.primary, '#f97316']}
          style={styles.retryGradient}
        >
          <Icon name="refresh" size={18} color="white" />
          <Text style={styles.retryText}>Réessayer</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  </View>
);

export default function Marques() {
  const navigation = useNavigation();
  const [marques, setMarques] = useState([]);
  const [filteredMarques, setFilteredMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [animateItems, setAnimateItems] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchMarques();
    startAnimations();
  }, []);

  useEffect(() => {
    filterMarques();
  }, [searchTerm, marques]);

  useEffect(() => {
    setTimeout(() => setAnimateItems(true), 100);
  }, [filteredMarques]);

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

  const fetchMarques = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Chargement des marques...");

      const response = await api.get('/marquesuser/');
      let marquesData = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          marquesData = response.data;
        } else if (response.data.results) {
          marquesData = response.data.results;
        } else if (response.data.data) {
          marquesData = response.data.data;
        }
      }

      setMarques(marquesData);
      setFilteredMarques(marquesData);
      console.log(`✅ ${marquesData.length} marques chargées`);

    } catch (err) {
      console.error("❌ Erreur chargement marques:", err);
      setError("Impossible de charger les marques");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterMarques = () => {
    if (!searchTerm.trim()) {
      setFilteredMarques(marques);
    } else {
      const filtered = marques.filter(marque =>
        marque.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMarques(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarques();
  };

  const handleMarquePress = (marqueId, marqueName) => {
    navigation.navigate('Modeles', { marqueId, marqueName });
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const renderMarqueItem = ({ item, index }) => {
    if (viewMode === 'grid') {
      return (
        <MarqueCard
          marque={item}
          index={index}
          onPress={() => handleMarquePress(item.id, item.nom)}
          animateItems={animateItems}
        />
      );
    } else {
      return (
        <Animated.View
          style={[
            styles.marqueListItem,
            {
              opacity: animateItems ? 1 : 0,
              transform: [{ translateX: animateItems ? 0 : -20 }],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => handleMarquePress(item.id, item.nom)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']}
              style={styles.marqueListItemInner}
            >
              <View style={styles.marqueListLogoContainer}>
                {item.logo ? (
                  <Image
                    source={{ uri: getImageUrl(item.logo) }}
                    style={styles.marqueListLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <LinearGradient
                    colors={[Colors.primary, '#f97316']}
                    style={styles.marqueListFallback}
                  >
                    <Text style={styles.marqueListFallbackText}>
                      {item.nom?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.marqueListInfo}>
                <Text style={styles.marqueListName}>{item.nom}</Text>
                <View style={styles.marqueListStats}>
                  <Icon name="car" size={10} color="#f97316" />
                  <Text style={styles.marqueListCount}>
                    {item.nb_modeles || 0} modèles disponibles
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#f97316" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={[Colors.primary, '#f97316']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nos Marques</Text>
            <Text style={styles.headerSubtitle}>
              Découvrez notre sélection de marques premium
            </Text>
          </View>
        </LinearGradient>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={[Colors.primary, '#f97316']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nos Marques</Text>
            <Text style={styles.headerSubtitle}>
              Découvrez notre sélection de marques premium
            </Text>
          </View>
        </LinearGradient>
        <ErrorMessage message={error} onRetry={fetchMarques} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={[Colors.primary, '#f97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nos Marques</Text>
          <Text style={styles.headerSubtitle}>
            {filteredMarques.length} marque{filteredMarques.length > 1 ? 's' : ''} disponibles
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Barre de recherche et filtres */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={Colors.gray[400]} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Rechercher une marque..."
            placeholderTextColor={Colors.gray[400]}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm !== '' && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="close" size={18} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
          >
            <Icon name="view-grid" size={20} color={viewMode === 'grid' ? Colors.white : Colors.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
          >
            <Icon name="view-list" size={20} color={viewMode === 'list' ? Colors.white : Colors.gray[600]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Résultats de recherche */}
      {searchTerm !== '' && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsText}>
            {filteredMarques.length} résultat{filteredMarques.length > 1 ? 's' : ''} trouvé{filteredMarques.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Liste des marques */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {filteredMarques.length > 0 ? (
            <FlatList
              data={filteredMarques}
              renderItem={renderMarqueItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode}
              scrollEnabled={false}
              contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']}
                style={styles.emptyCard}
              >
                <Icon name="car-search" size={64} color={Colors.gray[400]} />
                <Text style={styles.emptyTitle}>Aucune marque trouvée</Text>
                <Text style={styles.emptyMessage}>
                  {searchTerm
                    ? `Aucune marque ne correspond à "${searchTerm}"`
                    : "Aucune marque disponible pour le moment"}
                </Text>
                {searchTerm && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Effacer la recherche</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[900],
  },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: Colors.gray[800],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[700],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    paddingVertical: 0,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[700],
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
    backgroundColor: Colors.primary,
  },
  searchResults: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.gray[800],
  },
  searchResultsText: {
    fontSize: 12,
    color: Colors.gray[400],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  gridContainer: {
    justifyContent: 'space-between',
  },
  listContainer: {
    gap: 8,
  },
  marqueCard: {
    width: (width - 48) / 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  marqueCardInner: {
    backgroundColor: 'rgba(30,41,59,0.9)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  marqueLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  marqueLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  marqueFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marqueFallbackText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  marqueNom: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  marqueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  marqueCount: {
    fontSize: 11,
    color: '#f97316',
  },
  marqueListItem: {
    marginBottom: 8,
  },
  marqueListItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.9)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  marqueListLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  marqueListLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  marqueListFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marqueListFallbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  marqueListInfo: {
    flex: 1,
  },
  marqueListName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  marqueListStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marqueListCount: {
    fontSize: 11,
    color: Colors.gray[400],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[900],
  },
  loadingCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray[400],
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(30,41,59,0.9)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '90%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.gray[400],
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
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: 'rgba(30,41,59,0.9)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
    marginBottom: 24,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.gray[700],
    borderRadius: 12,
  },
  clearButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});