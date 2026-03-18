import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';

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
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// Composants d'icônes
const Icons = {
  Email: ({ color, size }) => <Icon name="mail-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Password: ({ color, size }) => <Icon name="lock-closed-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Eye: ({ color, size }) => <Icon name="eye-outline" size={size || 20} color={color || Colors.gray[600]} />,
  EyeOff: ({ color, size }) => <Icon name="eye-off-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Error: ({ color, size }) => <Icon name="alert-circle" size={size || 20} color={color || Colors.error} />,
  Success: ({ color, size }) => <Icon name="checkmark-circle" size={size || 20} color={color || Colors.success} />,
  Lock: ({ color, size }) => <Icon name="lock-closed" size={size || 24} color={color || Colors.white} />,
  User: ({ color, size }) => <Icon name="person-outline" size={size || 20} color={color || Colors.gray[600]} />,
  ArrowRight: ({ color, size }) => <Icon name="arrow-forward-outline" size={size || 20} color={color || Colors.white} />,
  Facebook: ({ color, size }) => <Icon name="logo-facebook" size={size || 20} color={color || '#1877f2'} />,
  Twitter: ({ color, size }) => <Icon name="logo-twitter" size={size || 20} color={color || '#1da1f2'} />,
  Instagram: ({ color, size }) => <Icon name="logo-instagram" size={size || 20} color={color || '#e4405f'} />,
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isAuthenticated } = useAuth();

  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
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
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de rotation pour le logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Animations de flottement pour les particules
    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + i * 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + i * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  // Gestionnaires d'événements
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result?.access) {
        setSuccess('Connexion réussie ! Redirection...');
        setTimeout(() => {
          navigation.replace('Dashboard');
        }, 1500);
      } else {
        setError(result?.error || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@kasaco.com',
      password: 'Demo123!',
    });
  };

  // Animations
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Rendu des particules
  const renderParticles = () => {
    return [...Array(20)].map((_, i) => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = 2 + Math.random() * 4;
      
      const translateY = floatAnims[i].interpolate({
        inputRange: [0, 1],
        outputRange: [0, -30 + Math.random() * 60],
      });
      
      const translateX = floatAnims[i].interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20 + Math.random() * 40],
      });

      return (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              top: `${top}%`,
              left: `${left}%`,
              width: size,
              height: size,
              opacity: 0.3,
              transform: [
                { translateY },
                { translateX },
              ],
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background avec gradient */}
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
        
        {/* Éléments décoratifs animés */}
        <Animated.View style={[styles.blob1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.blob2, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.blob3, { transform: [{ rotate: spin }] }]} />
        
        {/* Particules */}
        {renderParticles()}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            {/* Logo et titre */}
            <View style={styles.header}>
              <Animated.View style={[styles.logoContainer, { transform: [{ rotate: spin }] }]}>
                <Icons.Lock color={Colors.white} size={32} />
              </Animated.View>
              <Text style={styles.title}>KASACO</Text>
              <Text style={styles.subtitle}>Votre partenaire automobile de confiance</Text>
            </View>

            {/* Carte de connexion */}
            <View style={styles.card}>
              
              {/* Badge de sécurité */}
              <View style={styles.securityBadge}>
                <Icons.Success color={Colors.white} size={12} />
                <Text style={styles.securityBadgeText}>Connexion sécurisée</Text>
              </View>

              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Bienvenue</Text>
                <Text style={styles.cardSubtitle}>Connectez-vous à votre espace</Text>
              </View>

              {/* Message de succès */}
              {success ? (
                <View style={styles.successMessage}>
                  <Icons.Success color={Colors.success} size={20} />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              {/* Message d'erreur */}
              {error ? (
                <View style={styles.errorMessage}>
                  <Icons.Error color={Colors.error} size={20} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Formulaire */}
              <View style={styles.form}>
                {/* Champ Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Adresse email</Text>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    <Icons.Email color={Colors.gray[500]} size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="exemple@email.com"
                      placeholderTextColor={Colors.gray[400]}
                      value={formData.email}
                      onChangeText={(text) => handleChange('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Champ Mot de passe */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mot de passe</Text>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    <Icons.Password color={Colors.gray[500]} size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.gray[400]}
                      value={formData.password}
                      onChangeText={(text) => handleChange('password', text)}
                      secureTextEntry={!showPassword}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <Icons.Eye color={Colors.gray[500]} size={20} />
                      ) : (
                        <Icons.EyeOff color={Colors.gray[500]} size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Options supplémentaires */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Icons.Success color={Colors.white} size={12} />}
                    </View>
                    <Text style={styles.checkboxLabel}>Se souvenir de moi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton de connexion */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color={Colors.white} size="small" />
                      <Text style={styles.submitButtonText}>Connexion en cours...</Text>
                    </View>
                  ) : (
                    <View style={styles.submitButtonContent}>
                      <Text style={styles.submitButtonText}>Se connecter</Text>
                      <Icons.ArrowRight color={Colors.white} size={20} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Bouton démo */}
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleDemoLogin}
                >
                  <Text style={styles.demoButtonText}>Utiliser un compte démo</Text>
                </TouchableOpacity>
              </View>

              {/* Séparateur */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Connexion avec réseaux sociaux */}
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icons.Facebook size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icons.Twitter size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icons.Instagram size={24} />
                </TouchableOpacity>
              </View>

              {/* Lien d'inscription */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Pas encore de compte ?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.signupLink}>Créer un compte</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Badges de sécurité */}
            <View style={styles.securityBadges}>
              <View style={styles.securityBadgeItem}>
                <Icons.Success color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>SSL Sécurisé</Text>
              </View>
              <View style={styles.securityBadgeItem}>
                <Icons.Lock color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Données cryptées</Text>
              </View>
              <View style={styles.securityBadgeItem}>
                <Icons.User color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Support 24/7</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[900],
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gray[900],
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to bottom right, #111827, #7f1d1d, #111827)',
  },
  blob1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    transform: [{ scale: 1 }],
  },
  blob2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4f46e5',
    opacity: 0.2,
    transform: [{ scale: 1 }],
  },
  blob3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#8b5cf6',
    opacity: 0.2,
    transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  particle: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  securityBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  securityBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  successText: {
    color: Colors.success,
    fontSize: 14,
    flex: 1,
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: Colors.gray[900],
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  forgotPassword: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  demoButton: {
    marginTop: 8,
    padding: 8,
  },
  demoButtonText: {
    color: Colors.gray[500],
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.gray[500],
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  signupText: {
    color: Colors.gray[600],
    fontSize: 14,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  securityBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  securityBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityBadgeItemText: {
    color: Colors.gray[400],
    fontSize: 10,
  },
});