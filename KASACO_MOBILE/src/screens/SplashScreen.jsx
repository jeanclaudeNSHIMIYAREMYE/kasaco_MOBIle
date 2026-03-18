import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animation d'entrée
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

    // Animation de rotation continue
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Redirection après 3 secondes
    const timer = setTimeout(() => {
      // La navigation se fera automatiquement via AppNavigator
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ef4444" />
      
      {/* Fond avec gradient */}
      <View style={styles.background}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>

      {/* Contenu principal */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          },
        ]}
      >
        {/* Logo animé */}
        <Animated.View style={[styles.logoContainer, { transform: [{ rotate: spin }] }]}>
          <Icon name="car-sport-outline" size={80} color="#fff" />
        </Animated.View>

        {/* Nom de l'application */}
        <Text style={styles.appName}>KASACO</Text>

        {/* Slogan */}
        <Text style={styles.slogan}>Votre partenaire automobile</Text>

        {/* Indicateur de chargement */}
        <View style={styles.loaderContainer}>
          <View style={styles.loaderDot} />
          <View style={[styles.loaderDot, styles.loaderDotDelay1]} />
          <View style={[styles.loaderDot, styles.loaderDotDelay2]} />
        </View>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ef4444',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#ff6b6b',
    opacity: 0.3,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#c0392b',
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  slogan: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
  },
  loaderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loaderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  loaderDotDelay1: {
    opacity: 0.8,
  },
  loaderDotDelay2: {
    opacity: 1,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});