// src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    // Simulation de l'envoi d'email
    try {
      // Ici vous ferez l'appel API réel
      // await api.post('/auth/forgot-password/', { email });
      
      setTimeout(() => {
        setLoading(false);
        setIsSent(true);
      }, 1500);
      
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleResend = () => {
    setIsSent(false);
    setEmail('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.background} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.logoGradient}>
              <Icon name="lock-reset" size={48} color="white" />
            </LinearGradient>
            <Text style={styles.appName}>KASACO</Text>
            <Text style={styles.tagline}>Réinitialisation du mot de passe</Text>
          </View>

          <View style={styles.formContainer}>
            {!isSent ? (
              <>
                <Text style={styles.title}>Mot de passe oublié</Text>
                <Text style={styles.description}>
                  Entrez votre adresse email pour recevoir un lien de réinitialisation
                </Text>
                
                <View style={styles.inputContainer}>
                  <Icon name="email-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitButton} activeOpacity={0.8}>
                  <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.submitGradient}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Envoyer</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Icon name="email-check-outline" size={60} color="#10b981" />
                  </View>
                  <Text style={styles.successTitle}>Email envoyé !</Text>
                  <Text style={styles.successText}>
                    Un email de réinitialisation a été envoyé à
                  </Text>
                  <Text style={styles.successEmail}>{email}</Text>
                  <Text style={styles.successInstruction}>
                    Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                  </Text>
                </View>

                <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                  <Text style={styles.resendButtonText}>Renvoyer l'email</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Vous vous souvenez de votre mot de passe ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f172a' 
  },
  background: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  keyboardView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 40 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoGradient: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  appName: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: 'white', 
    letterSpacing: 1 
  },
  tagline: { 
    fontSize: 14, 
    color: '#94a3b8', 
    marginTop: 4 
  },
  formContainer: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 12, 
    marginBottom: 24, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: 'white', 
    paddingVertical: 14 
  },
  submitButton: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 24 
  },
  submitGradient: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14 
  },
  submitButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  successEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
    textAlign: 'center',
    marginBottom: 12,
  },
  successInstruction: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 12,
    marginBottom: 24,
  },
  resendButtonText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  loginText: { 
    color: '#94a3b8', 
    fontSize: 14 
  },
  loginLink: { 
    color: '#f97316', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
});