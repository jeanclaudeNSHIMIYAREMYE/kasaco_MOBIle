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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

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
};

// Composants d'icônes
const Icons = {
  User: ({ color, size }) => <Icon name="person-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Email: ({ color, size }) => <Icon name="mail-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Password: ({ color, size }) => <Icon name="lock-closed-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Eye: ({ color, size }) => <Icon name="eye-outline" size={size || 20} color={color || Colors.gray[600]} />,
  EyeOff: ({ color, size }) => <Icon name="eye-off-outline" size={size || 20} color={color || Colors.gray[600]} />,
  Check: ({ color, size }) => <Icon name="checkmark-outline" size={size || 20} color={color || Colors.white} />,
  Error: ({ color, size }) => <Icon name="alert-circle" size={size || 20} color={color || Colors.error} />,
  Success: ({ color, size }) => <Icon name="checkmark-circle" size={size || 20} color={color || Colors.success} />,
  Shield: ({ color, size }) => <Icon name="shield-checkmark-outline" size={size || 24} color={color || Colors.white} />,
  ArrowRight: ({ color, size }) => <Icon name="arrow-forward-outline" size={size || 20} color={color || Colors.white} />,
  Facebook: ({ color, size }) => <Icon name="logo-facebook" size={size || 20} color={color || '#1877f2'} />,
  Twitter: ({ color, size }) => <Icon name="logo-twitter" size={size || 20} color={color || '#1da1f2'} />,
  Instagram: ({ color, size }) => <Icon name="logo-instagram" size={size || 20} color={color || '#e4405f'} />,
};

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;
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

  // Animation de la force du mot de passe
  useEffect(() => {
    Animated.timing(strengthAnim, {
      toValue: passwordStrength / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [passwordStrength]);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Dashboard');
    }
  }, [isAuthenticated, navigation]);

  // Vérifier la force du mot de passe
  useEffect(() => {
    let strength = 0;
    const password = formData.password;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 12.5;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 12.5;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError('Veuillez remplir tous les champs');
      return false;
    }

    if (formData.username.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    if (formData.password !== formData.password2) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (passwordStrength < 75) {
      setError("Le mot de passe n'est pas assez sécurisé");
      return false;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
      });
      
      if (result?.access) {
        setSuccess('Compte créé avec succès ! Redirection...');
        setTimeout(() => {
          navigation.replace('Dashboard');
        }, 1500);
      } else {
        setError(result?.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return Colors.error;
    if (passwordStrength < 75) return Colors.warning;
    return Colors.success;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Faible';
    if (passwordStrength < 75) return 'Moyen';
    return 'Fort';
  };

  // Animation de rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Largeur de la barre de force
  const strengthWidth = strengthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Particules animées
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
                <Icons.Shield color={Colors.white} size={32} />
              </Animated.View>
              <Text style={styles.title}>KASACO</Text>
              <Text style={styles.subtitle}>Rejoignez notre communauté</Text>
            </View>

            {/* Carte d'inscription */}
            <View style={styles.card}>
              
              {/* Badge de sécurité */}
              <View style={styles.securityBadge}>
                <Icons.Success color={Colors.white} size={12} />
                <Text style={styles.securityBadgeText}>Inscription sécurisée</Text>
              </View>

              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Créer un compte</Text>
                <Text style={styles.cardSubtitle}>Remplissez le formulaire ci-dessous</Text>
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
                {/* Nom d'utilisateur */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    <Icons.User color={Colors.gray[500]} size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="JohnDoe"
                      placeholderTextColor={Colors.gray[400]}
                      value={formData.username}
                      onChangeText={(text) => handleChange('username', text)}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Email */}
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

                {/* Mot de passe */}
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
                  
                  {/* Indicateur de force du mot de passe */}
                  {formData.password ? (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthHeader}>
                        <Text style={styles.strengthLabel}>Force du mot de passe</Text>
                        <Text style={[styles.strengthValue, { color: getPasswordStrengthColor() }]}>
                          {getPasswordStrengthText()}
                        </Text>
                      </View>
                      <View style={styles.strengthBar}>
                        <Animated.View
                          style={[
                            styles.strengthBarFill,
                            {
                              width: strengthWidth,
                              backgroundColor: getPasswordStrengthColor(),
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.strengthCriteria}>
                        <View style={styles.criteriaItem}>
                          <View style={[styles.criteriaDot, formData.password.length >= 8 && styles.criteriaDotValid]} />
                          <Text style={styles.criteriaText}>8+ caractères</Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <View style={[styles.criteriaDot, /[a-z]/.test(formData.password) && styles.criteriaDotValid]} />
                          <Text style={styles.criteriaText}>minuscule</Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <View style={[styles.criteriaDot, /[A-Z]/.test(formData.password) && styles.criteriaDotValid]} />
                          <Text style={styles.criteriaText}>majuscule</Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <View style={[styles.criteriaDot, /[0-9]/.test(formData.password) && styles.criteriaDotValid]} />
                          <Text style={styles.criteriaText}>chiffre</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* Confirmer mot de passe */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    <Icons.Password color={Colors.gray[500]} size={20} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.gray[400]}
                      value={formData.password2}
                      onChangeText={(text) => handleChange('password2', text)}
                      secureTextEntry={!showConfirmPassword}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showConfirmPassword ? (
                        <Icons.Eye color={Colors.gray[500]} size={20} />
                      ) : (
                        <Icons.EyeOff color={Colors.gray[500]} size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {formData.password2 && formData.password !== formData.password2 ? (
                    <Text style={styles.passwordMismatch}>Les mots de passe ne correspondent pas</Text>
                  ) : null}
                </View>

                {/* Conditions d'utilisation */}
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                    {acceptTerms ? <Icons.Check color={Colors.white} size={12} /> : null}
                  </View>
                  <Text style={styles.termsText}>
                    J'accepte les{' '}
                    <Text style={styles.termsLink} onPress={() => Alert.alert('Conditions', 'Conditions d\'utilisation')}>
                      conditions d'utilisation
                    </Text>
                    {' '}et la{' '}
                    <Text style={styles.termsLink} onPress={() => Alert.alert('Confidentialité', 'Politique de confidentialité')}>
                      politique de confidentialité
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Bouton d'inscription */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color={Colors.white} size="small" />
                      <Text style={styles.submitButtonText}>Inscription en cours...</Text>
                    </View>
                  ) : (
                    <View style={styles.submitButtonContent}>
                      <Text style={styles.submitButtonText}>Créer mon compte</Text>
                      <Icons.ArrowRight color={Colors.white} size={20} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Séparateur */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Inscription avec réseaux sociaux */}
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

              {/* Lien de connexion */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Déjà un compte ?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Badges de sécurité */}
            <View style={styles.securityBadges}>
              <View style={styles.securityBadgeItem}>
                <Icons.Success color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Données cryptées</Text>
              </View>
              <View style={styles.securityBadgeItem}>
                <Icons.Shield color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Connexion sécurisée</Text>
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
    backgroundImage: 'linear-gradient(to bottom right, #111827, #312e81, #111827)',
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
    backgroundColor: Colors.indigo,
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
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.indigo,
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
  strengthContainer: {
    marginTop: 8,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  strengthLabel: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBar: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthCriteria: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  criteriaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  criteriaDotValid: {
    backgroundColor: Colors.success,
  },
  criteriaText: {
    fontSize: 10,
    color: Colors.gray[500],
  },
  passwordMismatch: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.indigo,
    borderColor: Colors.indigo,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.indigo,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.indigo,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: Colors.indigo,
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
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  loginText: {
    color: Colors.gray[600],
    fontSize: 14,
  },
  loginLink: {
    color: Colors.indigo,
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