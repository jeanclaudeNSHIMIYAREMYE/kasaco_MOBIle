import React, { useState, useRef } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const Colors = {
  primary: '#ef4444',
  primaryDark: '#dc2626',
  secondary: '#1f2937',
  white: '#ffffff',
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
};

const Icons = {
  Email: ({ color, size }) => <Icon name="mail-outline" size={size || 20} color={color || Colors.gray[600]} />,
  ArrowRight: ({ color, size }) => <Icon name="arrow-forward-outline" size={size || 20} color={color || Colors.white} />,
  Lock: ({ color, size }) => <Icon name="lock-closed" size={size || 24} color={color || Colors.white} />,
  Success: ({ color, size }) => <Icon name="checkmark-circle" size={size || 20} color={color || Colors.success} />,
  Error: ({ color, size }) => <Icon name="alert-circle" size={size || 20} color={color || Colors.error} />,
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simuler l'envoi de l'email
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  const handleResend = () => {
    setIsSent(false);
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background avec gradient */}
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
        <View style={styles.blob1} />
        <View style={styles.blob2} />
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
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Bouton retour */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back-outline" size={24} color={Colors.white} />
            </TouchableOpacity>

            {/* Logo et titre */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Icons.Lock color={Colors.white} size={32} />
              </View>
              <Text style={styles.title}>KASACO</Text>
              <Text style={styles.subtitle}>Mot de passe oublié</Text>
            </View>

            {/* Carte principale */}
            <View style={styles.card}>
              {!isSent ? (
                <>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Réinitialisation</Text>
                    <Text style={styles.cardSubtitle}>
                      Entrez votre email pour recevoir un lien de réinitialisation
                    </Text>
                  </View>

                  {/* Message d'erreur */}
                  {error ? (
                    <View style={styles.errorMessage}>
                      <Icons.Error color={Colors.error} size={20} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Formulaire */}
                  <View style={styles.form}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Adresse email</Text>
                      <View style={[styles.inputContainer, error && styles.inputError]}>
                        <Icons.Email color={Colors.gray[500]} size={20} />
                        <TextInput
                          style={styles.input}
                          placeholder="exemple@email.com"
                          placeholderTextColor={Colors.gray[400]}
                          value={email}
                          onChangeText={(text) => {
                            setEmail(text);
                            setError('');
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                      onPress={handleSubmit}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color={Colors.white} size="small" />
                          <Text style={styles.submitButtonText}>Envoi en cours...</Text>
                        </View>
                      ) : (
                        <View style={styles.submitButtonContent}>
                          <Text style={styles.submitButtonText}>Envoyer</Text>
                          <Icons.ArrowRight color={Colors.white} size={20} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Message de succès
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Icons.Success color={Colors.success} size={60} />
                  </View>
                  <Text style={styles.successTitle}>Email envoyé !</Text>
                  <Text style={styles.successText}>
                    Un email de réinitialisation a été envoyé à {'\n'}
                    <Text style={styles.successEmail}>{email}</Text>
                  </Text>
                  <Text style={styles.successInstruction}>
                    Vérifiez votre boîte de réception et suivez les instructions.
                  </Text>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResend}
                  >
                    <Text style={styles.resendButtonText}>Envoyer à nouveau</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Lien vers la connexion */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Vous vous souvenez de votre mot de passe ?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Badges de sécurité */}
            <View style={styles.securityBadges}>
              <View style={styles.securityBadgeItem}>
                <Icons.Success color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Sécurisé</Text>
              </View>
              <View style={styles.securityBadgeItem}>
                <Icons.Lock color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Confidentiel</Text>
              </View>
              <View style={styles.securityBadgeItem}>
                <Icons.Email color={Colors.gray[400]} size={12} />
                <Text style={styles.securityBadgeItemText}>Vérifié</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 16,
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
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
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
    gap: 20,
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  successEmail: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  successInstruction: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  loginText: {
    color: Colors.gray[600],
    fontSize: 14,
  },
  loginLink: {
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