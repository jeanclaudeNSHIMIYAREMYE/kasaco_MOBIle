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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Import des images locales
const heroImage = require('../../assets/images/hero-car.jpg');
const testimonial1 = require('../../assets/images/testimonial-1.jpg');
const testimonial2 = require('../../assets/images/testimonial-2.jpg');
const garageImage = require('../../assets/images/garage.jpg');
const onlineSaleImage = require('../../assets/images/online-sale.jpg');
const localSaleImage = require('../../assets/images/local-sale.jpg');

// Couleurs
const Colors = {
  primary: '#ef4444',
  primaryDark: '#dc2626',
  secondary: '#1f2937',
  secondaryLight: '#374151',
  indigo: '#4f46e5',
  indigoDark: '#4338ca',
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
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  blue: '#3b82f6',
  blueDark: '#2563eb',
  green: '#10b981',
  greenDark: '#059669',
};

export default function PourquoiKasacoScreen() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState({});
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sectionAnims = useRef(features.map(() => new Animated.Value(0))).current;
  const statsAnims = useRef(stats.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animation d'entrée du hero
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
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
      ),
    ]).start();

    // Animation des sections au scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.id);
            Animated.spring(sectionAnims[index], {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }
        });
      },
      { threshold: 0.2 }
    );

    // Simuler l'observation (dans React Native, on utilise onLayout)
    sectionAnims.forEach((_, index) => {
      setTimeout(() => {
        Animated.spring(sectionAnims[index], {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, index * 200);
    });

    // Animation des stats
    statsAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const features = [
    {
      id: 1,
      icon: 'business',
      iconType: 'material',
      color: Colors.primary,
      bgColor: '#fee2e2',
      textColor: Colors.primary,
      title: 'Vente et importation des véhicules locales',
      description:
        'Nous proposons un large choix de véhicules locaux de qualité soigneusement inspectés et certifiés.',
      image: localSaleImage,
      delay: 0,
    },
    {
      id: 2,
      icon: 'globe-outline',
      iconType: 'ionicon',
      color: Colors.blue,
      bgColor: '#dbeafe',
      textColor: Colors.blue,
      title: 'Vente et importation des véhicules en ligne',
      description:
        'Achetez facilement votre véhicule en ligne avec livraison rapide et sécurisée partout au Burundi.',
      image: onlineSaleImage,
      delay: 200,
    },
    {
      id: 3,
      icon: 'car-outline',
      iconType: 'ionicon',
      color: Colors.green,
      bgColor: '#d1fae5',
      textColor: Colors.green,
      title: 'Garage',
      description:
        'Nos garages sont équipés pour l\'entretien, la réparation et le service après-vente de votre véhicule.',
      image: garageImage,
      delay: 400,
    },
  ];

  const stats = [
    { id: 1, value: '500+', label: 'Véhicules vendus', icon: 'trophy-outline' },
    { id: 2, value: '98%', label: 'Clients satisfaits', icon: 'happy-outline' },
    { id: 3, value: '10+', label: "Années d'expérience", icon: 'calendar-outline' },
    { id: 4, value: '24/7', label: 'Support client', icon: 'headset-outline' },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Jean Claude',
      initials: 'JD',
      image: testimonial1,
      rating: 5,
      text: 'Excellent service ! J\'ai trouvé la voiture de mes rêves en quelques jours. Je recommande vivement KASACO.',
    },
    {
      id: 2,
      name: 'Dismas Karinzi',
      initials: 'DK',
      image: testimonial2,
      rating: 5,
      text: 'Équipe professionnelle et à l\'écoute. La livraison a été rapide et le véhicule était en parfait état.',
    },
  ];

  const renderIcon = (feature) => {
    if (feature.iconType === 'material') {
      return <MaterialIcon name={feature.icon} size={32} color={feature.color} />;
    }
    return <Icon name={feature.icon} size={32} color={feature.color} />;
  };

  const renderStars = (rating) => {
    return [...Array(rating)].map((_, i) => (
      <Icon key={i} name="star" size={16} color="#fbbf24" />
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={heroImage}
            style={[
              styles.heroImage,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
            defaultSource={heroImage}
          />
          <View style={styles.heroOverlay} />
          
          <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
            <Text style={styles.heroTitle}>
              Pourquoi <Text style={styles.heroTitleAccent}>KASACO</Text> ?
            </Text>
            <Text style={styles.heroSubtitle}>
              Votre partenaire de confiance pour l'automobile au Burundi
            </Text>
            <View style={styles.heroDivider} />
          </Animated.View>
        </View>

        <View style={styles.contentContainer}>
          {/* Features Section */}
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                style={[
                  styles.featureCard,
                  {
                    opacity: sectionAnims[index],
                    transform: [
                      {
                        translateY: sectionAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.featureCardInner, { overflow: 'hidden' }]}>
                  {/* Image de fond subtile */}
                  <Image source={feature.image} style={styles.featureBackground} blurRadius={20} />
                  
                  {/* Décoration supérieure */}
                  <View style={[styles.featureTopBar, { backgroundColor: feature.color }]} />
                  
                  <View style={styles.featureContent}>
                    {/* Icône */}
                    <View style={styles.featureIconContainer}>
                      <View style={[styles.featureIconGlow, { backgroundColor: feature.bgColor }]} />
                      <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                        {renderIcon(feature)}
                      </View>
                    </View>

                    {/* Titre */}
                    <Text style={[styles.featureTitle, { color: feature.color }]}>
                      {feature.title}
                    </Text>

                    {/* Description */}
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>

                    {/* Lien "En savoir plus" */}
                    <TouchableOpacity style={styles.featureLink}>
                      <Text style={[styles.featureLinkText, { color: feature.color }]}>
                        En savoir plus
                      </Text>
                      <Icon
                        name="arrow-forward-outline"
                        size={16}
                        color={feature.color}
                        style={styles.featureLinkIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>
              KASACO en <Text style={styles.statsTitleAccent}>chiffres</Text>
            </Text>
            
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Animated.View
                  key={stat.id}
                  style={[
                    styles.statCard,
                    {
                      opacity: statsAnims[index],
                      transform: [
                        {
                          scale: statsAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.statIconContainer}>
                    <View style={styles.statIconGlow} />
                    <View style={styles.statIcon}>
                      <Icon name={stat.icon} size={24} color={Colors.primary} />
                    </View>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Testimonials Section */}
          <View style={styles.testimonialsSection}>
            <Text style={styles.testimonialsTitle}>Ce qu'ils disent de nous</Text>
            <Text style={styles.testimonialsSubtitle}>
              Découvrez les avis de nos clients satisfaits
            </Text>
            
            <View style={styles.testimonialsGrid}>
              {testimonials.map((testimonial, index) => (
                <Animated.View
                  key={testimonial.id}
                  style={[
                    styles.testimonialCard,
                    {
                      opacity: sectionAnims[index],
                      transform: [
                        {
                          translateY: sectionAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialImageContainer}>
                      <View style={styles.testimonialImageGlow} />
                      <Image
                        source={testimonial.image}
                        style={styles.testimonialImage}
                        defaultSource={testimonial.image}
                      />
                    </View>
                    <View style={styles.testimonialInfo}>
                      <Text style={styles.testimonialName}>{testimonial.name}</Text>
                      <View style={styles.testimonialRating}>
                        {renderStars(testimonial.rating)}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.testimonialText}>
                    "{testimonial.text}"
                  </Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaGradient} />
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>
                Prêt à trouver votre prochaine voiture ?
              </Text>
              <Text style={styles.ctaSubtitle}>
                Rejoignez des milliers de clients satisfaits
              </Text>
              
              <View style={styles.ctaButtons}>
                <TouchableOpacity
                  style={styles.ctaButtonPrimary}
                  onPress={() => navigation.navigate('Voitures')}
                >
                  <Icon name="search-outline" size={20} color={Colors.primary} />
                  <Text style={styles.ctaButtonPrimaryText}>Découvrir nos véhicules</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.ctaButtonSecondary}
                  onPress={() => navigation.navigate('Contact')}
                >
                  <Icon name="mail-outline" size={20} color={Colors.white} />
                  <Text style={styles.ctaButtonSecondaryText}>Nous contacter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Hero Section
  heroContainer: {
    height: 400,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 40,
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
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.gray[300],
    textAlign: 'center',
    marginBottom: 24,
  },
  heroDivider: {
    width: 96,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // Content Container
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Features Grid
  featuresGrid: {
    marginBottom: 40,
  },
  featureCard: {
    marginBottom: 24,
  },
  featureCardInner: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  featureBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  featureTopBar: {
    height: 4,
    width: '100%',
  },
  featureContent: {
    padding: 24,
  },
  featureIconContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.5,
    blurRadius: 10,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLinkText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  featureLinkIcon: {
    marginLeft: 4,
  },

  // Stats Section
  statsSection: {
    backgroundColor: Colors.gray[900],
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsTitleAccent: {
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  statCard: {
    width: (width - 80) / 2,
    alignItems: 'center',
  },
  statIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  statIconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    blurRadius: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[400],
    textAlign: 'center',
  },

  // Testimonials Section
  testimonialsSection: {
    marginBottom: 40,
  },
  testimonialsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  testimonialsSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  testimonialsGrid: {
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  testimonialImageGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239,68,68,0.3)',
    blurRadius: 8,
  },
  testimonialImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  testimonialRating: {
    flexDirection: 'row',
  },
  testimonialText: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // CTA Section
  ctaSection: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 20,
  },
  ctaGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to right, #dc2626, #4f46e5)',
  },
  ctaContent: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  ctaButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  ctaButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  ctaButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});