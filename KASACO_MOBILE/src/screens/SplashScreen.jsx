// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation des points de chargement
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

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

    // Animation de rotation continue du logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation des points de chargement (comme Facebook)
    const animateDot = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateDot(dot1Anim, 0);
    animateDot(dot2Anim, 200);
    animateDot(dot3Anim, 400);

    // Pas de redirection ici - l'AppNavigator gère l'état de chargement
    // Le SplashScreen s'affiche pendant 2 secondes via App.js
    
    return () => {
      // Nettoyage
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dot1Opacity = dot1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const dot2Opacity = dot2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const dot3Opacity = dot3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [1, 1.1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ef4444" translucent={false} />
      
      {/* Fond avec effets */}
      <View style={styles.background}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
        <View style={styles.gradientLeft} />
        <View style={styles.gradientRight} />
      </View>

      {/* Particules flottantes */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 2 + Math.random() * 4,
                height: 2 + Math.random() * 4,
                opacity: 0.1 + Math.random() * 0.3,
              },
            ]}
          />
        ))}
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
        {/* Logo animé avec pulsation */}
        <Animated.View 
          style={[
            styles.logoContainer,
            { transform: [{ rotate: spin }, { scale: pulseScale }] }
          ]}
        >
          <Icon name="car-sport-outline" size={80} color="#fff" />
        </Animated.View>

        {/* Nom de l'application avec effet de brillance */}
        <Text style={styles.appName}>KASACO</Text>

        {/* Slogan */}
        <Text style={styles.slogan}>Votre partenaire automobile</Text>

        {/* Indicateur de chargement style Facebook */}
        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.loaderDot, { opacity: dot1Opacity }]} />
          <Animated.View style={[styles.loaderDot, { opacity: dot2Opacity }]} />
          <Animated.View style={[styles.loaderDot, { opacity: dot3Opacity }]} />
        </View>
      </Animated.View>

      {/* Version */}
      <Text style={styles.version}>Version 1.1.0</Text>
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
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#ff6b6b',
    opacity: 0.4,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#c0392b',
    opacity: 0.4,
  },
  gradientLeft: {
    position: 'absolute',
    top: '30%',
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#ff8787',
    opacity: 0.3,
  },
  gradientRight: {
    position: 'absolute',
    bottom: '30%',
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#b91c1c',
    opacity: 0.3,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 50,
    fontWeight: '500',
  },
  loaderContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  version: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});