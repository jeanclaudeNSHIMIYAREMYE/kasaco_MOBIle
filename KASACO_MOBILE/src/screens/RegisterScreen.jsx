// src/screens/RegisterScreen.js
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
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Erreur', "Le nom d'utilisateur doit contenir au moins 3 caractères");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        username,
        email,
        password,
        password2: confirmPassword,
      });
      
      if (result?.access) {
        Alert.alert(
          'Succès',
          'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'Se connecter',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result?.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.background} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.logoGradient}>
              <Icon name="car" size={48} color="white" />
            </LinearGradient>
            <Text style={styles.appName}>KASACO</Text>
            <Text style={styles.tagline}>Rejoignez notre communauté</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Inscription</Text>
            
            {/* Nom d'utilisateur */}
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Email */}
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

            {/* Mot de passe */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Confirmer mot de passe */}
            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Icon name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Indicateur de sécurité */}
            <View style={styles.securityHint}>
              <Icon name="shield-check-outline" size={14} color="#94a3b8" />
              <Text style={styles.securityHintText}>Mot de passe sécurisé : 8+ caractères</Text>
            </View>

            {/* Bouton d'inscription */}
            <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.registerButton} activeOpacity={0.8}>
              <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.registerGradient}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.registerButtonText}>S'inscrire</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Lien vers connexion */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Déjà un compte ? </Text>
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
    marginBottom: 24, 
    textAlign: 'center' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 12, 
    marginBottom: 16, 
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
  eyeIcon: { 
    padding: 8 
  },
  securityHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    gap: 8,
  },
  securityHintText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  registerButton: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 24 
  },
  registerGradient: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14 
  },
  registerButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  loginContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center' 
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