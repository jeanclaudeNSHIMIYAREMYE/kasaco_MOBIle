// src/screens/VoitureDetail.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Linking,
  Alert,
  Share,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.54:8000/api';

// Image par défaut
const defaultCarImage = { uri: 'https://via.placeholder.com/800x600?text=KASACO' };

export default function VoitureDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id: voitureId } = route.params || {};

  const [voiture, setVoiture] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (voitureId) {
      fetchVoiture();
    }
    setTimeout(() => setAnimateCard(true), 100);
    startAnimations();
  }, [voitureId]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
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

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/media')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return `${API_BASE_URL.replace('/api', '')}/media/${imagePath}`;
  };

  const fetchVoiture = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement voiture ID:", voitureId);

      const response = await fetch(`${API_BASE_URL}/voituresuser/${voitureId}/`);
      
      if (!response.ok) {
        throw new Error("Voiture non trouvée");
      }

      const data = await response.json();
      console.log("✅ Voiture reçue:", data);
      setVoiture(data);

      // Construire le tableau d'images
      const allImages = [];
      if (data.photo_url) {
        allImages.push(getFullImageUrl(data.photo_url));
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach(img => {
          if (img.image_url) {
            allImages.push(getFullImageUrl(img.image_url));
          }
        });
      }
      if (allImages.length === 0) {
        allImages.push(defaultCarImage.uri);
      }
      setImages(allImages);

    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.message || "Impossible de charger les détails de la voiture");
      Alert.alert('Erreur', 'Impossible de charger les détails de la voiture');
    } finally {
      setLoading(false);
    }
  };

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'N/A';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    if (isNaN(prixNumber)) return 'N/A';
    const formatted = prixNumber.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    switch (devise?.toUpperCase()) {
      case 'USD': return `$${formatted}`;
      case 'EUR': return `€${formatted}`;
      default: return `${formatted} FCFA`;
    }
  };

  const getEtatBadge = (etat) => {
    switch (etat?.toLowerCase()) {
      case 'disponible':
        return (
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.statusBadge}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>Disponible</Text>
          </LinearGradient>
        );
      case 'réservée':
        return (
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={styles.statusBadge}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusBadgeText}>Réservée</Text>
          </LinearGradient>
        );
      default:
        return (
          <LinearGradient
            colors={['#6b7280', '#4b5563']}
            style={styles.statusBadge}
          >
            <Text style={styles.statusBadgeText}>{etat || 'Indisponible'}</Text>
          </LinearGradient>
        );
    }
  };

  const getWhatsAppLink = () => {
    if (!voiture) return '';
    const message = `Bonjour, je suis intéressé par ${voiture.marque_nom || ''} ${voiture.modele_nom || ''} (ID: A2E${voiture.id}) au prix de ${formatPrix(voiture.prix, voiture.devise)}. Pourriez-vous me donner plus d'informations ?`;
    return `https://wa.me/25769080278?text=${encodeURIComponent(message)}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${voiture?.marque_nom} ${voiture?.modele_nom}`,
        message: `Découvrez cette magnifique voiture sur KASACO: ${voiture?.marque_nom} ${voiture?.modele_nom}`,
        url: `https://kasaco.com/voiture/${voitureId}`,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleWhatsApp = () => {
    const url = getWhatsAppLink();
    Linking.openURL(url).catch(() => 
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp')
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Chargement des informations...</Text>
        </View>
      </View>
    );
  }

  if (error || !voiture) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-circle" size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Oups !</Text>
          <Text style={styles.errorMessage}>{error || "Voiture non trouvée"}</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Éléments décoratifs */}
      <View style={styles.decorTopRight} />
      <View style={styles.decorBottomLeft} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          
          {/* Fil d'Ariane */}
          <View style={styles.breadcrumb}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.breadcrumbLink}>Accueil</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marques')}>
              <Text style={styles.breadcrumbLink}>Marques</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Modeles', { marqueId: voiture.marque_id })}>
              <Text style={styles.breadcrumbLink}>{voiture.marque_nom}</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <Text style={styles.breadcrumbCurrent}>{voiture.modele_nom}</Text>
          </View>

          {/* Bouton retour mobile */}
          <TouchableOpacity onPress={handleGoBack} style={styles.backButtonMobile}>
            <Icon name="arrow-left" size={20} color="white" />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>

          {/* En-tête avec actions */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>
                {voiture.marque_nom} {voiture.modele_nom}
              </Text>
              <View style={styles.headerDetails}>
                <View style={styles.detailChip}>
                  <Icon name="calendar" size={14} color="#9ca3af" />
                  <Text style={styles.detailChipText}>{voiture.annee}</Text>
                </View>
                <View style={styles.detailChip}>
                  <Icon name="speedometer" size={14} color="#9ca3af" />
                  <Text style={styles.detailChipText}>{voiture.kilometrage?.toLocaleString()} km</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              {getEtatBadge(voiture.etat)}
              <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                <Icon name="share-variant" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Carte principale */}
          <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
            {/* Section Image */}
            <View style={styles.imageSection}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: images[currentIndex] || defaultCarImage.uri }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
                <View style={styles.imageOverlay} />
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>A2E{voiture.id}</Text>
                </View>

                {images.length > 1 && (
                  <>
                    <TouchableOpacity onPress={prevImage} style={[styles.navButton, styles.navButtonLeft]}>
                      <Icon name="chevron-left" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextImage} style={[styles.navButton, styles.navButtonRight]}>
                      <Icon name="chevron-right" size={24} color="white" />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Miniatures */}
              {images.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailsContainer}>
                  {images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentIndex(index)}
                      style={[
                        styles.thumbnail,
                        currentIndex === index && styles.thumbnailActive
                      ]}
                    >
                      <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Informations */}
            <View style={styles.infoSection}>
              {/* Prix et actions - BOUTON RESERVER SUPPRIMÉ */}
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.priceCard}
              >
                <View style={styles.priceHeader}>
                  <Text style={styles.priceLabel}>Prix</Text>
                  <Text style={styles.priceValue}>{formatPrix(voiture.prix, voiture.devise)}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={handleWhatsApp} style={styles.whatsappButton}>
                    <LinearGradient
                      colors={['#25D366', '#128C7E']}
                      style={styles.actionGradient}
                    >
                      <Icon name="whatsapp" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Contacter sur WhatsApp</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Caractéristiques */}
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.infoCard}
              >
                <Text style={styles.infoCardTitle}>Caractéristiques</Text>
                <View style={styles.featuresGrid}>
                  <View style={styles.featureItem}>
                    <Icon name="car-shift-pattern" size={20} color="#f97316" />
                    <Text style={styles.featureLabel}>Transmission</Text>
                    <Text style={styles.featureValue}>{voiture.transmission || 'N/A'}</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Icon name="engine" size={20} color="#f97316" />
                    <Text style={styles.featureLabel}>Cylindrée</Text>
                    <Text style={styles.featureValue}>{voiture.cylindree_cc || 'N/A'} CC</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Icon name="palette" size={20} color="#f97316" />
                    <Text style={styles.featureLabel}>Couleur</Text>
                    <View style={styles.colorContainer}>
                      <View style={[styles.colorDot, { backgroundColor: voiture.couleur?.toLowerCase() || '#000' }]} />
                      <Text style={styles.featureValue}>{voiture.couleur || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.featureItem}>
                    <Icon name="speedometer" size={20} color="#f97316" />
                    <Text style={styles.featureLabel}>Kilométrage</Text>
                    <Text style={styles.featureValue}>{voiture.kilometrage?.toLocaleString() || 'N/A'} km</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Identification */}
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.infoCard}
              >
                <Text style={styles.infoCardTitle}>Identification</Text>
                <View style={styles.idInfo}>
                  <Text style={styles.idLabel}>Numéro de châssis</Text>
                  <View style={styles.idValueContainer}>
                    <Text style={styles.idValue} numberOfLines={1}>
                      {voiture.numero_chassis || 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.idLabel}>Numéro moteur</Text>
                  <View style={styles.idValueContainer}>
                    <Text style={styles.idValue} numberOfLines={1}>
                      {voiture.numero_moteur || 'N/A'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 30,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 4,
  },
  breadcrumbLink: {
    fontSize: 12,
    color: '#9ca3af',
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: '#6b7280',
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  backButtonMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailChipText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageSection: {
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  idBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  idBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLeft: {
    left: 12,
  },
  navButtonRight: {
    right: 12,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#ef4444',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    padding: 20,
    gap: 20,
  },
  priceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  whatsappButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureItem: {
    width: '45%',
    gap: 4,
  },
  featureLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  idInfo: {
    gap: 12,
  },
  idLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  idValueContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 8,
  },
  idValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#e5e7eb',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});