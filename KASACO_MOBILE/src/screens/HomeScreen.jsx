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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// IMPORT CORRIGÉ - Chemin correct vers api.js dans le dossier services
import api, {
  AuthService,
  VoitureService,
  MarqueService,
  StatistiqueService
} from '../services/api';

const { width, height } = Dimensions.get('window');

// Import des images locales
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
  return `${baseURL}${path}`;
};

// Composants d'icônes
const Icons = {
  ArrowRight: ({ color, size }) => <Icon name="arrow-forward-outline" size={size || 20} color={color || Colors.white} />,
  Star: ({ color, size }) => <Icon name="star" size={size || 16} color={color || '#fbbf24'} />,
  Check: ({ color, size }) => <Icon name="checkmark-outline" size={size || 20} color={color || Colors.white} />,
  Car: ({ color, size }) => <Icon name="car-outline" size={size || 24} color={color || Colors.primary} />,
  Shield: ({ color, size }) => <Icon name="shield-checkmark-outline" size={size || 24} color={color || Colors.white} />,
  Clock: ({ color, size }) => <Icon name="time-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Heart: ({ color, size }) => <Icon name="heart-outline" size={size || 20} color={color || Colors.primary} />,
  Lightning: ({ color, size }) => <Icon name="flash-outline" size={size || 16} color={color || Colors.white} />,
  Location: ({ color, size }) => <Icon name="location-outline" size={size || 16} color={color || Colors.gray[600]} />,
};

// Fonction de formatage des prix
const formatPrix = (prix, devise = 'BIF') => {
  if (!prix && prix !== 0) return 'Prix non disponible';
  const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
  if (isNaN(prixNumber)) return 'Prix non disponible';
  const formatted = prixNumber.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  switch(devise?.toUpperCase()) {
    case 'USD': return `$${formatted}`;
    case 'EUR': return `€${formatted}`;
    case 'BIF': default: return `${formatted} BIF`;
  }
};

// Composant de chargement
const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

// Composant d'erreur
const ErrorMessage = ({ message }) => (
  <View style={styles.errorContainer}>
    <View style={styles.errorBadge}>
      <Icon name="alert-circle" size={20} color={Colors.primary} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  </View>
);

// Carte de statistique
const StatCard = ({ value, label, delay, isVisible }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// Composant Particules
const Particles = () => {
  const [particles] = useState(() => 
    [...Array(15)].map(() => ({
      id: Math.random().toString(),
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
    }))
  );

  const animatedValues = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 200,
            useNativeDriver: true,
          }),
        ])
      );
    });
    
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={styles.particlesContainer} pointerEvents="none">
      {particles.map((particle, index) => {
        const translateY = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        });
        
        const translateX = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: particle.size,
                height: particle.size,
                opacity: 0.3,
                transform: [
                  { translateY },
                  { translateX },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [marques, setMarques] = useState([]);
  const [voituresPopulaires, setVoituresPopulaires] = useState([]);
  const [loading, setLoading] = useState({ marques: true, voitures: true, stats: true });
  const [error, setError] = useState({ marques: null, voitures: null, stats: null });
  const [showItems, setShowItems] = useState({ hero: false, marques: false, populaires: false, avantages: false });
  const [stats, setStats] = useState({ clients: 1500, voitures: 320, annees: 10 });
  const [hoveredCar, setHoveredCar] = useState(null);

  // Vérification que navigation est disponible
  useEffect(() => {
    if (!navigation) {
      console.error('❌ Navigation non disponible dans HomeScreen');
    } else {
      console.log('✅ Navigation disponible dans HomeScreen');
    }
  }, [navigation]);

  // Animations globales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const slides = [
    { id: 1, image: home1, title: "L'élégance sur route", subtitle: "Découvrez notre sélection de véhicules d'exception" },
    { id: 2, image: home2, title: "Performance et style", subtitle: "Des voitures qui allient puissance et design" },
    { id: 3, image: home3, title: "L'avenir de l'automobile", subtitle: "Innovation et technologie au service de votre confort" },
  ];

  const durations = [9000, 4000, 4000];

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setShowItems(prev => ({ ...prev, hero: true })), 500);
  }, []);

  // Effet parallax
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      parallaxAnim.setValue(value * 0.5);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  // Slider automatique
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, durations[currentSlide]);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Chargement des données API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les marques
        setLoading(prev => ({ ...prev, marques: true }));
        try {
          const marquesData = await MarqueService.getPublicMarques();
          console.log('✅ Marques reçues:', marquesData);
          
          let marquesArray = [];
          if (Array.isArray(marquesData)) {
            marquesArray = marquesData;
          } else if (marquesData.results) {
            marquesArray = marquesData.results;
          } else if (marquesData.data) {
            marquesArray = marquesData.data;
          }
          
          setMarques(marquesArray.slice(0, 15));
          setError(prev => ({ ...prev, marques: null }));
        } catch (err) {
          console.error('❌ Erreur chargement marques:', err);
          setError(prev => ({ ...prev, marques: "Impossible de charger les marques" }));
        } finally {
          setLoading(prev => ({ ...prev, marques: false }));
        }

        // Charger les voitures populaires
        setLoading(prev => ({ ...prev, voitures: true }));
        try {
          const voituresData = await VoitureService.getPublicVoitures();
          console.log('✅ Voitures reçues:', voituresData);
          
          let voituresArray = [];
          if (Array.isArray(voituresData)) {
            voituresArray = voituresData;
          } else if (voituresData.results) {
            voituresArray = voituresData.results;
          } else if (voituresData.data) {
            voituresArray = voituresData.data;
          }
          
          // Prendre les 8 premières comme populaires
          setVoituresPopulaires(voituresArray.slice(0, 8));
          setError(prev => ({ ...prev, voitures: null }));
        } catch (err) {
          console.error('❌ Erreur chargement voitures:', err);
          setError(prev => ({ ...prev, voitures: "Impossible de charger les voitures" }));
        } finally {
          setLoading(prev => ({ ...prev, voitures: false }));
        }

        // Charger les statistiques
        setLoading(prev => ({ ...prev, stats: true }));
        try {
          const userRole = await AsyncStorage.getItem('userRole');
          
          if (userRole === 'admin' || userRole === 'superadmin') {
            const statsData = await StatistiqueService.getStatistiques();
            console.log('📊 Statistiques reçues:', statsData);
            
            if (statsData) {
              setStats({
                clients: statsData.total_clients || 1500,
                voitures: statsData.total_voitures || 320,
                annees: statsData.annees_experience || 10,
              });
            }
          } else {
            console.log('ℹ️ Utilisateur non admin, utilisation des stats par défaut');
            setStats({
              clients: 1524,
              voitures: 328,
              annees: 12,
            });
          }
          setError(prev => ({ ...prev, stats: null }));
        } catch (err) {
          if (err.status === 401 || err.response?.status === 401) {
            console.log('ℹ️ Stats non disponibles - utilisation des valeurs par défaut');
            setStats({
              clients: 1524,
              voitures: 328,
              annees: 12,
            });
          } else {
            console.error('❌ Erreur chargement stats:', err);
          }
        } finally {
          setLoading(prev => ({ ...prev, stats: false }));
        }

        setShowItems(prev => ({ 
          ...prev, 
          marques: true, 
          populaires: true, 
          avantages: true 
        }));

      } catch (error) {
        console.error('❌ Erreur globale:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      }
    };

    fetchData();
  }, []);

  const handleMarquePress = (marqueId) => {
    if (navigation) {
      navigation.navigate('Modeles', { marqueId });
    } else {
      console.error('❌ Navigation non disponible');
      Alert.alert('Erreur', 'Navigation non disponible');
    }
  };

  const handleVoiturePress = (voitureId) => {
    if (navigation) {
      navigation.navigate('VoitureDetail', { id: voitureId });
    } else {
      console.error('❌ Navigation non disponible');
      Alert.alert('Erreur', 'Navigation non disponible');
    }
  };

  const handleExplorePress = () => {
    if (navigation) {
      navigation.navigate('Marques');
    } else {
      console.error('❌ Navigation non disponible');
      Alert.alert('Erreur', 'Navigation non disponible');
    }
  };

  const renderMarqueItem = ({ item, index }) => {
    const opacity = showItems.marques ? 1 : 0;
    const translateY = showItems.marques ? 0 : 50;

    return (
      <Animated.View style={[
        styles.marqueCardContainer,
        {
          opacity,
          transform: [{ translateY }],
        }
      ]}>
        <TouchableOpacity
          style={styles.marqueCard}
          onPress={() => handleMarquePress(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.marqueLogoContainer}>
            {item.logo ? (
              <Image 
                source={{ uri: getImageUrl(item.logo) }} 
                style={styles.marqueLogo}
                onError={(e) => console.log('Erreur chargement logo:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.marqueFallback}>
                <Text style={styles.marqueFallbackText}>{item.nom?.charAt(0) || '?'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.marqueNom} numberOfLines={1}>{item.nom}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderVoitureItem = ({ item, index }) => {
    const opacity = showItems.populaires ? 1 : 0;
    const translateY = showItems.populaires ? 0 : 50;
    const scale = hoveredCar === item.id ? 1.05 : 1;

    const marqueNom = item.marque_nom || item.marque?.nom || '';
    const modeleNom = item.modele_nom || item.modele?.nom || '';

    return (
      <Animated.View style={[
        styles.voitureCardContainer,
        {
          opacity,
          transform: [{ translateY }],
        }
      ]}>
        <TouchableOpacity
          style={styles.voitureCard}
          onPress={() => handleVoiturePress(item.id)}
          onPressIn={() => setHoveredCar(item.id)}
          onPressOut={() => setHoveredCar(null)}
          activeOpacity={0.9}
        >
          {/* Badges */}
          <View style={styles.voitureBadges}>
            <View style={styles.popularBadge}>
              <Icons.Star size={12} />
              <Text style={styles.badgeText}>Populaire</Text>
            </View>
            {index < 2 && (
              <View style={styles.newBadge}>
                <Icons.Lightning size={12} />
                <Text style={styles.badgeText}>Nouveau</Text>
              </View>
            )}
          </View>

          {/* Image */}
          <View style={styles.voitureImageContainer}>
            <Image
              source={
                item.photo_principale 
                  ? { uri: getImageUrl(item.photo_principale) }
                  : item.photos && item.photos.length > 0
                  ? { uri: getImageUrl(item.photos[0]) }
                  : { uri: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop' }
              }
              style={[styles.voitureImage, { transform: [{ scale }] }]}
              onError={(e) => console.log('Erreur chargement image voiture:', e.nativeEvent.error)}
            />
            <View style={styles.voitureImageOverlay} />
          </View>

          {/* Infos */}
          <View style={styles.voitureInfo}>
            <View style={styles.voitureHeader}>
              <Text style={styles.voitureTitre}>
                {marqueNom} {modeleNom}
              </Text>
              <Text style={styles.voitureAnnee}>{item.annee || ''}</Text>
            </View>

            <View style={styles.voitureDetails}>
              <View style={styles.voitureDetailItem}>
                <Icons.Clock size={14} color={Colors.gray[600]} />
                <Text style={styles.voitureDetailText}>{item.transmission || 'Manuelle'}</Text>
              </View>
              <View style={styles.voitureDetailItem}>
                <Icons.Location size={14} color={Colors.gray[600]} />
                <Text style={styles.voitureDetailText}>{item.pays || 'Burundi'}</Text>
              </View>
            </View>

            <View style={styles.voitureSeparator} />

            <View style={styles.voitureFooter}>
              <View>
                <Text style={styles.prixLabel}>Prix</Text>
                <Text style={styles.voiturePrix}>
                  {formatPrix(item.prix, item.devise)}
                </Text>
              </View>
              
              <View style={styles.voitureAction}>
                <Text style={styles.voitureActionText}>Détails</Text>
                <View style={styles.voitureActionIcon}>
                  <Icons.ArrowRight size={16} color={Colors.white} />
                </View>
              </View>
            </View>

            <Text style={styles.voitureRef}>Réf: {item.reference || `KSC-${item.id}`}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <Animated.View style={[
            styles.heroBackground,
            {
              transform: [{
                translateY: parallaxAnim.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0, -50],
                  extrapolate: 'clamp',
                }),
              }],
            },
          ]}>
            {slides.map((slide, index) => (
              <Animated.View
                key={slide.id}
                style={[
                  styles.heroSlide,
                  { opacity: currentSlide === index ? 1 : 0 },
                ]}
              >
                <Image source={slide.image} style={styles.heroImage} />
              </Animated.View>
            ))}
            
            <View style={styles.heroOverlay} />
          </Animated.View>

          <Particles />

          <Animated.View style={[
            styles.heroContent,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}>
            <Animated.View style={[styles.heroBadge, showItems.hero && styles.heroBadgeVisible]}>
              <Icons.Shield size={16} color={Colors.white} />
              <Text style={styles.heroBadgeText}>Concessionnaire agréé depuis 2014</Text>
            </Animated.View>

            <Animated.View style={[styles.heroTitleContainer, showItems.hero && styles.heroTitleVisible]}>
              <Text style={styles.heroTitleLine}>Roulez vers</Text>
              <Text style={styles.heroTitleGradient}>l'avenir avec KASACO</Text>
            </Animated.View>

            <Animated.Text style={[styles.heroDescription, showItems.hero && styles.heroDescriptionVisible]}>
              Découvrez notre sélection exceptionnelle de véhicules neufs et d'occasion.
            </Animated.Text>

            <Animated.View style={[styles.heroButtonContainer, showItems.hero && styles.heroButtonVisible]}>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={handleExplorePress}
                activeOpacity={0.8}
              >
                <Text style={styles.heroButtonText}>Explorer nos marques</Text>
                <View style={styles.heroButtonIcon}>
                  <Icons.ArrowRight size={20} color={Colors.white} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.statsContainer}>
              <StatCard value={`${stats.clients}+`} label="Clients satisfaits" delay={1000} isVisible={showItems.hero} />
              <StatCard value={stats.voitures} label="Véhicules disponibles" delay={1200} isVisible={showItems.hero} />
              <StatCard value={`${stats.annees}+`} label="Années d'expérience" delay={1400} isVisible={showItems.hero} />
            </View>
          </Animated.View>

          <View style={styles.scrollIndicator}>
            <View style={styles.scrollIndicatorDot} />
            <Text style={styles.scrollIndicatorText}>Découvrir</Text>
          </View>
        </View>

        {/* SECTION MARQUES */}
        <View style={[styles.section, showItems.marques && styles.sectionVisible]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nos marques partenaires</Text>
            <Text style={styles.sectionSubtitle}>
              Découvrez les plus grandes marques automobiles
            </Text>
          </View>

          {loading.marques ? (
            <LoadingSpinner />
          ) : error.marques ? (
            <ErrorMessage message={error.marques} />
          ) : (
            <FlatList
              data={marques}
              renderItem={renderMarqueItem}
              keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.marquesList}
              ListEmptyComponent={<Text style={styles.emptyText}>Aucune marque disponible</Text>}
            />
          )}
        </View>

        {/* SECTION VOITURES POPULAIRES */}
        <View style={[styles.populairesSection, showItems.populaires && styles.sectionVisible]}>
          <View style={styles.populairesDecorator1} />
          <View style={styles.populairesDecorator2} />
          <View style={styles.populairesDecorator3} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.populairesTitle]}>
              Voitures les plus <Text style={styles.populairesTitleAccent}>populaires</Text>
            </Text>
            <Text style={[styles.sectionSubtitle, styles.populairesSubtitle]}>
              Découvrez les véhicules les plus appréciés de notre catalogue
            </Text>
          </View>

          {loading.voitures ? (
            <LoadingSpinner />
          ) : error.voitures ? (
            <ErrorMessage message={error.voitures} />
          ) : (
            <FlatList
              data={voituresPopulaires}
              renderItem={renderVoitureItem}
              keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.voituresList}
              ListEmptyComponent={<Text style={styles.emptyText}>Aucune voiture disponible</Text>}
            />
          )}

          <View style={styles.viewMoreContainer}>
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleExplorePress}
              activeOpacity={0.8}
            >
              <Text style={styles.viewMoreButtonText}>Voir tous les véhicules</Text>
              <Icons.ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION AVANTAGES */}
        <View style={[styles.avantagesSection, showItems.avantages && styles.sectionVisible]}>
          <View style={styles.avantagesDecorator1} />
          <View style={styles.avantagesDecorator2} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Pourquoi choisir <Text style={styles.avantagesTitleAccent}>KASACO</Text> ?
            </Text>
            <Text style={styles.sectionSubtitle}>
              Des services premium pour une expérience d'achat exceptionnelle
            </Text>
          </View>

          <View style={styles.avantagesGrid}>
            <View style={[styles.avantageCard, { transform: [{ scale: showItems.avantages ? 1 : 0.9 }] }]}>
              <View style={[styles.avantageIcon, { backgroundColor: '#fee2e2' }]}>
                <Icons.Shield color={Colors.primary} size={32} />
              </View>
              <Text style={styles.avantageTitle}>Garantie prolongée</Text>
              <Text style={styles.avantageText}>
                Tous nos véhicules bénéficient d'une garantie complète
              </Text>
            </View>

            <View style={[styles.avantageCard, { transform: [{ scale: showItems.avantages ? 1 : 0.9 }] }]}>
              <View style={[styles.avantageIcon, { backgroundColor: '#dbeafe' }]}>
                <Icons.Clock color="#3b82f6" size={32} />
              </View>
              <Text style={styles.avantageTitle}>Service rapide</Text>
              <Text style={styles.avantageText}>
                Traitement express en 24h et livraison rapide
              </Text>
            </View>

            <View style={[styles.avantageCard, { transform: [{ scale: showItems.avantages ? 1 : 0.9 }] }]}>
              <View style={[styles.avantageIcon, { backgroundColor: '#dcfce7' }]}>
                <Icons.Check color="#10b981" size={32} />
              </View>
              <Text style={styles.avantageTitle}>Véhicules certifiés</Text>
              <Text style={styles.avantageText}>
                Inspection rigoureuse par nos experts avant chaque vente
              </Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.primary,
    fontSize: 14,
  },
  
  heroContainer: {
    height: height * 0.85,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSlide: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  heroContent: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    opacity: 0,
    transform: [{ translateY: 20 }],
  },
  heroBadgeVisible: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  heroBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  heroTitleContainer: {
    marginBottom: 16,
    opacity: 0,
    transform: [{ translateX: -30 }],
  },
  heroTitleVisible: {
    opacity: 1,
    transform: [{ translateX: 0 }],
  },
  heroTitleLine: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  heroTitleGradient: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  heroDescription: {
    fontSize: 16,
    color: Colors.gray[300],
    marginBottom: 24,
    lineHeight: 24,
    opacity: 0,
    transform: [{ translateY: 20 }],
  },
  heroDescriptionVisible: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  heroButtonContainer: {
    marginBottom: 24,
    opacity: 0,
    transform: [{ scale: 0.8 }],
  },
  heroButtonVisible: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  heroButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray[400],
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 20,
    left: width / 2 - 15,
    alignItems: 'center',
  },
  scrollIndicatorDot: {
    width: 4,
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 2,
    marginBottom: 4,
  },
  scrollIndicatorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  
  section: {
    paddingVertical: 40,
    backgroundColor: Colors.white,
    opacity: 0,
    transform: [{ translateY: 30 }],
  },
  sectionVisible: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  sectionHeader: {
    paddingHorizontal: 20,
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
    color: Colors.gray[600],
  },
  
  marquesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  marqueCardContainer: {
    marginRight: 8,
  },
  marqueCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marqueLogoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  marqueLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  marqueFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marqueFallbackText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  marqueNom: {
    fontSize: 11,
    textAlign: 'center',
    color: Colors.gray[700],
    fontWeight: '500',
  },
  
  populairesSection: {
    paddingVertical: 60,
    backgroundColor: Colors.gray[900],
    position: 'relative',
    overflow: 'hidden',
  },
  populairesDecorator1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.2,
  },
  populairesDecorator2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4f46e5',
    opacity: 0.2,
  },
  populairesDecorator3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#a855f7',
    opacity: 0.1,
    transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  populairesTitle: {
    color: Colors.white,
  },
  populairesTitleAccent: {
    color: Colors.primary,
  },
  populairesSubtitle: {
    color: Colors.gray[400],
  },
  voituresList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  voitureCardContainer: {
    width: width * 0.8,
    marginRight: 16,
  },
  voitureCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  voitureBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
    left: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    zIndex: 10,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  voitureImageContainer: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  voitureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  voitureImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  voitureInfo: {
    padding: 16,
  },
  voitureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voitureTitre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[800],
    flex: 1,
  },
  voitureAnnee: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  voitureDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  voitureDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voitureDetailText: {
    fontSize: 12,
    color: Colors.gray[600],
  },
  voitureSeparator: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginBottom: 12,
  },
  voitureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prixLabel: {
    fontSize: 10,
    color: Colors.gray[500],
    marginBottom: 2,
  },
  voiturePrix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  voitureAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voitureActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  voitureActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voitureRef: {
    fontSize: 10,
    color: Colors.gray[400],
    fontFamily: 'monospace',
  },
  viewMoreContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewMoreButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  avantagesSection: {
    paddingVertical: 60,
    backgroundColor: Colors.white,
    position: 'relative',
    overflow: 'hidden',
  },
  avantagesDecorator1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fee2e2',
    opacity: 0.5,
  },
  avantagesDecorator2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#dbeafe',
    opacity: 0.5,
  },
  avantagesTitleAccent: {
    color: Colors.primary,
  },
  avantagesGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  avantageCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  avantageIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avantageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  avantageText: {
    fontSize: 12,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyText: {
    color: Colors.gray[400],
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});