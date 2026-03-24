// src/screens/UserHome.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Images locales
const home1 = require('../../assets/images/home1.jpg');
const home2 = require('../../assets/images/home2.jpeg');
const home3 = require('../../assets/images/home3.jpeg');

// Couleurs
const Colors = {
  primary: '#ef4444',
  primaryDark: '#dc2626',
  secondary: '#1f2937',
  secondaryLight: '#374151',
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
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
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
  },
};

// Composant de carte marque
const MarqueCard = ({ marque, index, onPress, show }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (show) {
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
          duration: 500,
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
  }, [show]);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  return (
    <Animated.View
      style={[
        styles.marqueCard,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        }
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.marqueCardInner}>
        <View style={styles.marqueLogoContainer}>
          {marque.logo_url ? (
            <Image
              source={{ uri: getFullImageUrl(marque.logo_url) }}
              style={styles.marqueLogo}
              resizeMode="contain"
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.indigo[500]]}
              style={styles.marqueLogoFallback}
            >
              <Text style={styles.marqueLogoFallbackText}>
                {marque.nom?.charAt(0).toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          )}
        </View>
        <Text style={styles.marqueName} numberOfLines={1}>
          {marque.nom}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de carte voiture populaire
const VoitureCard = ({ voiture, index, onPress, show }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (show) {
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
          duration: 500,
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
  }, [show]);

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'N/A';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    if (isNaN(prixNumber)) return 'N/A';
    const formatted = prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${formatted} ${devise}`;
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
          <Image
            source={{ uri: getFullImageUrl(voiture.photo_url) || 'https://via.placeholder.com/300x200' }}
            style={styles.voitureImage}
            resizeMode="cover"
          />
          <View style={styles.voitureBadge}>
            <Icon name="star" size={12} color={Colors.white} />
          </View>
        </View>
        <View style={styles.voitureInfo}>
          <Text style={styles.voitureName} numberOfLines={1}>
            {voiture.marque_nom} {voiture.modele_nom}
          </Text>
          <Text style={styles.voitureDetails}>
            {voiture.annee} • {voiture.transmission || 'Automatique'}
          </Text>
          <View style={styles.voiturePriceRow}>
            <Text style={styles.voiturePrice}>
              {formatPrix(voiture.prix, voiture.devise)}
            </Text>
            <Icon name="arrow-right" size={16} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de slide du carrousel
const SlideItem = ({ item, isActive }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  return (
    <View style={styles.slideContainer}>
      <Animated.Image
        source={item.image}
        style={[styles.slideImage, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="cover"
      />
      <View style={styles.slideOverlay} />
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );
};

export default function UserHome() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [marques, setMarques] = useState([]);
  const [voituresPopulaires, setVoituresPopulaires] = useState([]);
  const [loading, setLoading] = useState({ marques: true, voitures: true });
  const [showItems, setShowItems] = useState({
    marques: false,
    populaires: false,
    marquesList: {},
    voituresList: {}
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const slides = [
    { id: 1, image: home1, title: "L'élégance sur route", subtitle: "Découvrez notre sélection de véhicules d'exception" },
    { id: 2, image: home2, title: "Performance et style", subtitle: "Des voitures qui allient puissance et design" },
    { id: 3, image: home3, title: "L'avenir de l'automobile", subtitle: "Innovation et technologie au service de votre confort" },
  ];

  const API_BASE_URL = 'http://192.168.1.140:8000/api';

  useEffect(() => {
    fetchData();
    startAnimations();
    
    // Carrousel automatique
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading.marques && !loading.voitures) {
      setShowItems(prev => ({ ...prev, marques: true, populaires: true }));
      
      const marquesList = {};
      marques.forEach(marque => {
        marquesList[`marque-${marque.id}`] = true;
      });
      const voituresList = {};
      voituresPopulaires.forEach(voiture => {
        voituresList[`voiture-${voiture.id}`] = true;
      });
      
      setShowItems(prev => ({ ...prev, marquesList, voituresList }));
    }
  }, [loading.marques, loading.voitures, marques, voituresPopulaires]);

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

  const fetchData = async () => {
    try {
      // Simuler le chargement des données
      // Dans une vraie application, utilisez les services API
      setMarques([]);
      setVoituresPopulaires([]);
      setLoading({ marques: false, voitures: false });
    } catch (error) {
      console.error("Erreur chargement:", error);
      setLoading({ marques: false, voitures: false });
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  const LoadingSpinner = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  if (loading.marques && loading.voitures) {
    return (
      <Navigation>
        <View style={styles.fullLoadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ================= HERO SECTION ================= */}
        <View style={styles.heroContainer}>
          <FlatList
            data={slides}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentSlide(index);
            }}
            renderItem={({ item, index }) => (
              <SlideItem item={item} isActive={index === currentSlide} />
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          
          {/* Indicateurs */}
          <View style={styles.paginationContainer}>
            {slides.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentSlide(index)}
                style={[
                  styles.paginationDot,
                  currentSlide === index && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
          
          {/* Contenu Hero */}
          <Animated.View style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.heroTitle}>
              Roulez vers l'avenir avec{' '}
              <Text style={styles.heroTitleAccent}>KASACO</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              L'innovation au bout de vos roues.
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('Modeles')}
            >
              <Text style={styles.heroButtonText}>Découvrir nos voitures</Text>
              <Icon name="arrow-right" size={18} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ================= MARQUES ================= */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: showItems.marques ? 1 : 0,
              transform: [{ translateY: showItems.marques ? 0 : 10 }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nos marques partenaires</Text>
            <Text style={styles.sectionSubtitle}>
              Découvrez les plus grandes marques automobiles
            </Text>
          </View>

          {loading.marques ? (
            <LoadingSpinner />
          ) : marques.length > 0 ? (
            <FlatList
              data={marques}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.marquesList}
              renderItem={({ item, index }) => (
                <MarqueCard
                  marque={item}
                  index={index}
                  show={showItems.marquesList?.[`marque-${item.id}`]}
                  onPress={() => navigation.navigate('Modeles', { marqueId: item.id })}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucune marque disponible</Text>
              }
            />
          ) : (
            <Text style={styles.emptyText}>Aucune marque disponible</Text>
          )}
        </Animated.View>

        {/* ================= VOITURES POPULAIRES ================= */}
        <Animated.View
          style={[
            styles.sectionPopular,
            {
              opacity: showItems.populaires ? 1 : 0,
              transform: [{ translateY: showItems.populaires ? 0 : 10 }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voitures les plus populaires</Text>
          </View>

          {loading.voitures ? (
            <LoadingSpinner />
          ) : voituresPopulaires.length > 0 ? (
            <FlatList
              data={voituresPopulaires}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.voituresList}
              renderItem={({ item, index }) => (
                <VoitureCard
                  voiture={item}
                  index={index}
                  show={showItems.voituresList?.[`voiture-${item.id}`]}
                  onPress={() => navigation.navigate('VoitureDetail', { id: item.id })}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucune voiture disponible</Text>
              }
            />
          ) : (
            <Text style={styles.emptyText}>Aucune voiture disponible</Text>
          )}
        </Animated.View>
      </ScrollView>
    </Navigation>
  );
}

const styles = StyleSheet.create({
  fullLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Colors.gray[500],
    fontSize: 14,
  },
  heroContainer: {
    height: 500,
    position: 'relative',
  },
  slideContainer: {
    width: width,
    height: 500,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  slideContent: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 16,
    color: Colors.gray[300],
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 120,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.gray[200],
    marginBottom: 24,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  sectionPopular: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[50],
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  marquesList: {
    paddingHorizontal: 8,
  },
  marqueCard: {
    width: 80,
    marginHorizontal: 4,
  },
  marqueCardInner: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  marqueLogoContainer: {
    width: 48,
    height: 48,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marqueLogo: {
    width: 40,
    height: 40,
  },
  marqueLogoFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marqueLogoFallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  marqueName: {
    fontSize: 11,
    color: Colors.gray[700],
    textAlign: 'center',
  },
  voituresList: {
    paddingHorizontal: 8,
  },
  voitureCard: {
    width: 280,
    marginHorizontal: 8,
  },
  voitureCardInner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voitureImageContainer: {
    position: 'relative',
    height: 160,
  },
  voitureImage: {
    width: '100%',
    height: '100%',
  },
  voitureBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 4,
  },
  voitureInfo: {
    padding: 12,
  },
  voitureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  voitureDetails: {
    fontSize: 12,
    color: Colors.gray[500],
    marginBottom: 8,
  },
  voiturePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiturePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.green,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray[500],
    paddingVertical: 32,
  },
});