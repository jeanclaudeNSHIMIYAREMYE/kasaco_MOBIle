// src/screens/admin/ReserverVoiture.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { VoitureService, ReservationService } from '../../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Composant pour la carte de détail
const DetailCard = ({ label, value, icon, color }) => (
  <View style={styles.detailCard}>
    <View style={[styles.detailIconContainer, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Composant pour la section de confiance
const TrustBadge = ({ icon, text }) => (
  <View style={styles.trustBadge}>
    <Text style={styles.trustIcon}>{icon}</Text>
    <Text style={styles.trustText}>{text}</Text>
  </View>
);

export default function ReserverVoiture() {
  const navigation = useNavigation();
  const route = useRoute();
  const { voitureId } = route.params || {};

  const [voiture, setVoiture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [animateCard, setAnimateCard] = useState(false);
  const [user, setUser] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    chargerUser();
    if (voitureId) {
      chargerVoiture();
    } else {
      showMessage('error', 'Aucune voiture sélectionnée');
      setTimeout(() => navigation.goBack(), 2000);
    }
    setTimeout(() => setAnimateCard(true), 100);
    startAnimations();
  }, [voitureId]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const showMessageAnimation = () => {
    Animated.sequence([
      Animated.timing(messageAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(messageAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const animateButton = (toValue) => {
    Animated.spring(buttonAnim, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    showMessageAnimation();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const chargerUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userFirstName = await AsyncStorage.getItem('userFirstName');
      const userLastName = await AsyncStorage.getItem('userLastName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      setUser({
        id: userId,
        username: `${userFirstName} ${userLastName}`.trim() || 'Administrateur',
        email: userEmail || 'admin@kasaco.com'
      });
    } catch (error) {
      console.error('Erreur chargement user:', error);
    }
  };

  const chargerVoiture = async () => {
    try {
      setLoading(true);
      const data = await VoitureService.getVoitureById(voitureId);
      setVoiture(data);
      if (data.etat !== 'Disponible') {
        showMessage('error', 'Cette voiture n\'est plus disponible');
      }
    } catch (error) {
      showMessage('error', 'Impossible de charger les détails de la voiture');
    } finally {
      setLoading(false);
    }
  };

  const formatPrix = (prix, devise = 'BIF') => {
    if (!prix && prix !== 0) return 'N/A';
    const prixNumber = typeof prix === 'string' ? parseFloat(prix) : prix;
    if (isNaN(prixNumber)) return 'N/A';
    const formatted = prixNumber.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    switch (devise?.toUpperCase()) {
      case 'USD': return `$${formatted}`;
      case 'EUR': return `€${formatted}`;
      default: return `${formatted} FCFA`;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      showMessage('error', 'Vous devez être connecté');
      return;
    }
    if (!voiture) {
      showMessage('error', 'Informations non disponibles');
      return;
    }
    if (voiture.etat !== 'Disponible') {
      showMessage('error', 'Cette voiture n\'est plus disponible');
      return;
    }

    animateButton(0.95);
    setSubmitting(true);

    try {
      const reservationData = {
        voiture: parseInt(voitureId),
        utilisateur: parseInt(user.id)
      };
      await ReservationService.createReservation(reservationData);
      showMessage('success', 'Réservation effectuée avec succès !');
      setVoiture(prev => ({ ...prev, etat: 'Réservée' }));
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      let errorMessage = 'Erreur lors de la réservation';
      if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors.join(', ');
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      showMessage('error', errorMessage);
    } finally {
      animateButton(1);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement des informations...</Text>
      </SafeAreaView>
    );
  }

  if (!voiture) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.background} />
        <View style={styles.notFoundContainer}>
          <Icon name="car-off" size={64} color="#64748b" />
          <Text style={styles.notFoundText}>Voiture non trouvée</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backNotFoundButton}>
            <Text style={styles.backNotFoundText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isAvailable = voiture.etat === 'Disponible';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.background} />
      <View style={styles.decorCircle1} /><View style={styles.decorCircle2} />

      {message.text && (
        <Animated.View style={[styles.messageContainer, message.type === 'success' ? styles.messageSuccess : styles.messageError, {
          transform: [{ translateY: messageAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }],
          opacity: messageAnim
        }]}>
          <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={20} color="white" />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            
            {/* Badge */}
            <View style={styles.badgeContainer}>
              <LinearGradient colors={isAvailable ? ['#3b82f6', '#2563eb'] : ['#94a3b8', '#64748b']} style={styles.badge}>
                <Icon name={isAvailable ? "star" : "close"} size={12} color="white" />
                <Text style={styles.badgeText}>
                  {isAvailable ? 'Réservation disponible' : 'Indisponible'}
                </Text>
              </LinearGradient>
            </View>

            {/* Icône */}
            <View style={styles.headerIcon}>
              <LinearGradient colors={isAvailable ? ['#3b82f6', '#2563eb'] : ['#94a3b8', '#64748b']} style={styles.iconContainer}>
                <Icon name={isAvailable ? "calendar-check" : "car-off"} size={32} color="white" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Réserver ce véhicule</Text>
            <Text style={styles.subtitle}>Confirmez votre réservation en un clic</Text>

            {/* Carte voiture */}
            <LinearGradient colors={['#eff6ff', '#e0e7ff']} style={styles.voitureCard}>
              <Text style={styles.voitureName}>{voiture.marque_nom} {voiture.modele_nom}</Text>
              <View style={styles.voitureDetailsGrid}>
                <DetailCard label="Année" value={voiture.annee} icon="calendar" color="#3b82f6" />
                <DetailCard label="Prix" value={formatPrix(voiture.prix, voiture.devise)} icon="cash" color="#10b981" />
                <DetailCard label="État" value={voiture.etat} icon={isAvailable ? "check-circle" : "clock"} color={isAvailable ? "#10b981" : "#f59e0b"} />
              </View>
              <View style={styles.chassisContainer}>
                <Icon name="barcode" size={12} color="#94a3b8" />
                <Text style={styles.chassisText}>Châssis: {voiture.numero_chassis}</Text>
                <Icon name="engine" size={12} color="#94a3b8" style={styles.motorIcon} />
                <Text style={styles.chassisText}>Moteur: {voiture.numero_moteur}</Text>
              </View>
            </LinearGradient>

            {/* Carte utilisateur */}
            <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.userAvatarGradient}>
                  <Text style={styles.userAvatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
                </LinearGradient>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.username || 'Chargement...'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'Email non disponible'}</Text>
              </View>
              <View style={styles.userVerified}>
                <Icon name="check-decagram" size={20} color="#10b981" />
              </View>
            </LinearGradient>

            {/* Message d'information */}
            <LinearGradient colors={['#eff6ff', '#e0e7ff']} style={styles.infoCard}>
              <Icon name="information" size={18} color="#3b82f6" />
              <Text style={styles.infoText}>
                Vous allez réserver <Text style={styles.infoBold}>{voiture.marque_nom} {voiture.modele_nom}</Text>
              </Text>
            </LinearGradient>

            {/* Bouton de réservation animé */}
            <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting || !isAvailable}
                style={styles.submitButton}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={isAvailable ? ['#3b82f6', '#2563eb'] : ['#94a3b8', '#64748b']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {submitting ? (
                    <>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={styles.submitText}>Traitement en cours...</Text>
                    </>
                  ) : !isAvailable ? (
                    <>
                      <Icon name="close" size={20} color="white" />
                      <Text style={styles.submitText}>Véhicule indisponible</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={20} color="white" />
                      <Text style={styles.submitText}>Confirmer la réservation</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Bouton retour */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={16} color="#64748b" />
              <Text style={styles.backText}>Retour à la liste</Text>
            </TouchableOpacity>

            {/* Message de confiance */}
            <View style={styles.trustSection}>
              <TrustBadge icon="🔒" text="Paiement sécurisé" />
              <TrustBadge icon="🚘" text="Véhicules vérifiés" />
              <TrustBadge icon="📞" text="Support 24/7" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  keyboardView: { flex: 1 },
  decorCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59,130,246,0.1)' },
  decorCircle2: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(139,92,246,0.05)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingText: { marginTop: 16, color: '#94a3b8', fontSize: 14 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30 },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  badgeContainer: { position: 'absolute', top: -12, left: 0, right: 0, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, gap: 6 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  headerIcon: { alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 12, textAlign: 'center', color: '#64748b', marginBottom: 24 },
  voitureCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  voitureName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1f2937', marginBottom: 20 },
  voitureDetailsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  detailCard: { flex: 1, alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 10, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  detailIconContainer: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 10, color: '#64748b' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  chassisContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 4 },
  chassisText: { fontSize: 10, color: '#94a3b8' },
  motorIcon: { marginLeft: 8 },
  userCard: { borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  userAvatarGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  userEmail: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  userVerified: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center' },
  infoCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 24, gap: 10, justifyContent: 'center' },
  infoText: { fontSize: 13, color: '#3b82f6', textAlign: 'center', flex: 1 },
  infoBold: { fontWeight: 'bold' },
  submitButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  backText: { fontSize: 14, color: '#64748b' },
  trustSection: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 20, marginTop: 12 },
  trustBadge: { alignItems: 'center' },
  trustIcon: { fontSize: 18, marginBottom: 4 },
  trustText: { fontSize: 10, color: '#94a3b8' },
  notFoundContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  notFoundText: { fontSize: 16, color: '#64748b', marginTop: 16, marginBottom: 20 },
  backNotFoundButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backNotFoundText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  messageContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, zIndex: 100, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  messageSuccess: { backgroundColor: '#10b981' },
  messageError: { backgroundColor: '#ef4444' },
  messageText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
});