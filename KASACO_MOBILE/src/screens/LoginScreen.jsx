// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  // SafeAreaView est retiré
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
// Ajout de l'import pour SafeAreaView depuis la nouvelle librairie
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.user?.role;
      
      if (role === 'admin' || role === 'superadmin') {
        navigation.replace('DashboardAdmin');
      } else {
        navigation.replace('Dashboard');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.background} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.logoGradient}>
              <Icon name="car" size={48} color="white" />
            </LinearGradient>
            <Text style={styles.appName}>KASACO</Text>
            <Text style={styles.tagline}>Location de véhicules de luxe</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Connexion</Text>
            
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

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.loginButton} activeOpacity={0.8}>
              <LinearGradient colors={['#ef4444', '#8b5cf6']} style={styles.loginGradient}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>Se connecter</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Les styles restent identiques
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoGradient: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: 'bold', color: 'white', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  formContainer: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 24, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: 'white', paddingVertical: 14 },
  eyeIcon: { padding: 8 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#f97316', fontSize: 14 },
  loginButton: { borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  loginGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#94a3b8', fontSize: 14 },
  registerLink: { color: '#f97316', fontSize: 14, fontWeight: 'bold' },
});