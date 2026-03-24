// src/screens/admin/AjouterVoiture.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { VoitureService, MarqueService, ModeleService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.140:8000/api';

// Breakpoints pour responsive
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

// Options pour les pays
const paysOptions = [
  { value: "Burundi", label: "🇧🇮 Burundi" },
  { value: "Rwanda", label: "🇷🇼 Rwanda" },
  { value: "Tanzanie", label: "🇹🇿 Tanzanie" },
  { value: "Ouganda", label: "🇺🇬 Ouganda" },
  { value: "Kenya", label: "🇰🇪 Kenya" },
  { value: "RDC", label: "🇨🇩 RDC" },
  { value: "France", label: "🇫🇷 France" },
  { value: "Belgique", label: "🇧🇪 Belgique" },
  { value: "Allemagne", label: "🇩🇪 Allemagne" },
  { value: "Japon", label: "🇯🇵 Japon" },
  { value: "USA", label: "🇺🇸 USA" },
  { value: "Chine", label: "🇨🇳 Chine" },
  { value: "Italie", label: "🇮🇹 Italie" },
  { value: "Espagne", label: "🇪🇸 Espagne" },
  { value: "Suède", label: "🇸🇪 Suède" },
  { value: "Royaume-Uni", label: "🇬🇧 Royaume-Uni" },
];

// Options de transmission
const transmissionOptions = [
  { value: "Manuelle", label: "Manuelle" },
  { value: "Automatique", label: "Automatique" },
];

// Options de devise
const deviseOptions = [
  { value: "BIF", label: "BIF" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

// Options d'état
const etatOptions = [
  { value: "Disponible", label: "Disponible", color: "#10b981", icon: "check-circle" },
  { value: "Réservée", label: "Réservée", color: "#f59e0b", icon: "clock" },
  { value: "Vendue", label: "Vendue", color: "#6b7280", icon: "sale" },
];

// Composant pour les champs de formulaire
const FormField = ({ label, required, children }) => (
  <View style={styles.formField}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.required}>*</Text>}
    </Text>
    {children}
  </View>
);

// Composant pour les options sélectionnables
const SelectableOptions = ({ options, selectedValue, onSelect, emptyText = "Aucune option disponible" }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
    {options.length > 0 ? (
      options.map((option) => (
        <TouchableOpacity
          key={option.id || option.value}
          style={[
            styles.optionButton,
            selectedValue === (option.id?.toString() || option.value) && styles.optionButtonActive
          ]}
          onPress={() => onSelect(option.id?.toString() || option.value)}
        >
          <Text style={[
            styles.optionText,
            selectedValue === (option.id?.toString() || option.value) && styles.optionTextActive
          ]}>
            {option.nom || option.label}
          </Text>
        </TouchableOpacity>
      ))
    ) : (
      <View style={styles.noOptionsContainer}>
        <Text style={styles.noOptionsText}>{emptyText}</Text>
      </View>
    )}
  </ScrollView>
);

// Composant pour les cartes d'images
const ImageCard = ({ uri, onRemove }) => (
  <View style={styles.imagePreviewItem}>
    <Image source={{ uri }} style={styles.imagePreviewSmall} />
    <TouchableOpacity style={styles.removeImageButton} onPress={onRemove}>
      <Icon name="close-circle" size={24} color="#ef4444" />
    </TouchableOpacity>
  </View>
);

export default function AjouterVoiture() {
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  
  // États pour les données
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [loadingModeles, setLoadingModeles] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // État du formulaire
  const [voitureData, setVoitureData] = useState({
    marque: '',
    modele: '',
    numero_chassis: '',
    numero_moteur: '',
    annee: new Date().getFullYear().toString(),
    transmission: '',
    kilometrage: '',
    couleur: '',
    cylindree_cc: '',
    prix: '',
    devise: 'BIF',
    pays: 'Burundi',
    etat: 'Disponible',
    photo: null
  });
  
  // États pour les images
  const [photoPreview, setPhotoPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  
  // Déterminer le type d'affichage
  const isMobile = screenWidth < BREAKPOINTS.MOBILE;
  
  useEffect(() => {
    chargerMarques();
    startAnimations();
  }, []);
  
  useEffect(() => {
    if (voitureData.marque) {
      chargerModeles(voitureData.marque);
    } else {
      setModeles([]);
    }
  }, [voitureData.marque]);
  
  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
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
  
  const showMessage = (type, text) => {
    setMessage({ type, text });
    showMessageAnimation();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };
  
  const chargerMarques = async () => {
    try {
      const data = await MarqueService.getAllMarques();
      let marquesList = [];
      if (Array.isArray(data)) {
        marquesList = data;
      } else if (data && data.results) {
        marquesList = data.results;
      }
      setMarques(marquesList);
    } catch (error) {
      console.error("❌ Erreur chargement marques:", error);
      showMessage('error', 'Erreur de chargement des marques');
    }
  };
  
  const chargerModeles = async (marqueId) => {
    try {
      setLoadingModeles(true);
      const data = await ModeleService.getModelesByMarque(marqueId);
      
      let modelesList = [];
      if (Array.isArray(data)) {
        modelesList = data;
      } else if (data && data.results) {
        modelesList = data.results;
      }
      
      setModeles(modelesList);
    } catch (error) {
      console.error("❌ Erreur chargement modèles:", error);
      setModeles([]);
      showMessage('error', 'Erreur de chargement des modèles');
    } finally {
      setLoadingModeles(false);
    }
  };
  
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      const fileName = file.fileName || `photo_${Date.now()}.jpg`;
      const fileType = file.mimeType || 'image/jpeg';
      
      if (!fileType.startsWith('image/')) {
        Alert.alert('Format invalide', 'Veuillez sélectionner une image valide (JPEG, PNG)');
        return;
      }
      
      setPhotoPreview(file.uri);
      setVoitureData({ 
        ...voitureData, 
        photo: {
          uri: file.uri,
          type: fileType,
          name: fileName
        }
      });
    }
  };
  
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const newImages = [...images];
      const newPreviews = [...imagePreviews];
      
      result.assets.forEach(asset => {
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        const fileType = asset.mimeType || 'image/jpeg';
        
        if (fileType.startsWith('image/')) {
          newImages.push({
            uri: asset.uri,
            type: fileType,
            name: fileName
          });
          newPreviews.push(asset.uri);
        }
      });
      
      setImages(newImages);
      setImagePreviews(newPreviews);
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };
  
  const formatPrixAffichage = (prix) => {
    if (!prix) return '';
    const parts = prix.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts[1] ? `${integerPart}.${parts[1].substring(0, 2)}` : integerPart;
  };
  
  const handleInputChange = (field, value) => {
    if (field === 'prix') {
      let rawValue = value.replace(/[^0-9.]/g, "");
      const parts = rawValue.split(".");
      if (parts.length > 2) {
        rawValue = parts[0] + "." + parts.slice(1).join("");
      }
      setVoitureData({ ...voitureData, prix: rawValue });
    } else {
      setVoitureData({ ...voitureData, [field]: value });
    }
  };
  
  const validateForm = () => {
    const required = ['marque', 'modele', 'numero_chassis', 'numero_moteur', 'annee', 'transmission', 'kilometrage', 'couleur', 'cylindree_cc', 'prix', 'pays'];
    
    for (const field of required) {
      if (!voitureData[field]) {
        showMessage('error', 'Veuillez remplir tous les champs obligatoires');
        return false;
      }
    }
    
    if (parseInt(voitureData.annee) < 1900 || parseInt(voitureData.annee) > new Date().getFullYear() + 1) {
      showMessage('error', 'Année invalide');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      Object.keys(voitureData).forEach(key => {
        if (voitureData[key] !== null && voitureData[key] !== '') {
          if (key === 'prix') {
            const cleanPrix = voitureData.prix.replace(/[^\d.]/g, '');
            formData.append(key, cleanPrix);
          } else if (key === 'photo' && voitureData[key]) {
            const photo = voitureData[key];
            formData.append('photo', {
              uri: photo.uri,
              type: photo.type || 'image/jpeg',
              name: photo.name || `voiture_${Date.now()}.jpg`
            });
          } else {
            formData.append(key, voitureData[key]);
          }
        }
      });
      
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${Date.now()}_${index}.jpg`
        });
      });
      
      await VoitureService.createVoiture(formData);
      
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', error.response?.data?.message || error.message || 'Erreur lors de l\'ajout');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.background} />
      
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      
      {message.text && (
        <Animated.View style={[
          styles.messageContainer,
          message.type === 'success' ? styles.messageSuccess : styles.messageError,
          {
            transform: [{ translateY: messageAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }],
            opacity: messageAnim
          }
        ]}>
          <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={22} color="white" />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}
      
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <Animated.View style={[styles.successModal, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={['#10b981', '#059669']} style={styles.successModalGradient}>
              <Icon name="check-circle" size={64} color="white" />
              <Text style={styles.successModalTitle}>Succès !</Text>
              <Text style={styles.successModalText}>Voiture ajoutée avec succès</Text>
              <Text style={styles.successModalSubtext}>Redirection en cours...</Text>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Modal>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            {/* En-tête */}
            
            
            <View style={[styles.formCard, isMobile && styles.formCardMobile]}>
              
              {/* Section 1 - Informations du véhicule */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient colors={['#f97316', '#ea580c']} style={styles.sectionNumber}>
                    <Text style={styles.sectionNumberText}>1</Text>
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Informations du véhicule</Text>
                </View>
                
                <View style={[styles.formGrid, isMobile && styles.formGridMobile]}>
                  
                  <FormField label="Marque" required>
                    <SelectableOptions
                      options={marques}
                      selectedValue={voitureData.marque}
                      onSelect={(value) => handleInputChange('marque', value)}
                      emptyText="Aucune marque disponible"
                    />
                  </FormField>
                  
                  <FormField label="Modèle" required>
                    {loadingModeles ? (
                      <ActivityIndicator size="small" color="#f97316" style={styles.loader} />
                    ) : (
                      <SelectableOptions
                        options={modeles}
                        selectedValue={voitureData.modele}
                        onSelect={(value) => handleInputChange('modele', value)}
                        emptyText={voitureData.marque ? "Aucun modèle disponible" : "Sélectionnez d'abord une marque"}
                      />
                    )}
                  </FormField>
                  
                  <FormField label="Numéro châssis" required>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: VF1ABCDEFGH123456"
                      placeholderTextColor="#94a3b8"
                      value={voitureData.numero_chassis}
                      onChangeText={(text) => handleInputChange('numero_chassis', text.toUpperCase())}
                    />
                  </FormField>
                  
                  <FormField label="Numéro moteur" required>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 123456789"
                      placeholderTextColor="#94a3b8"
                      value={voitureData.numero_moteur}
                      onChangeText={(text) => handleInputChange('numero_moteur', text)}
                    />
                  </FormField>
                  
                  <FormField label="Année" required>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 2020"
                      placeholderTextColor="#94a3b8"
                      value={voitureData.annee}
                      onChangeText={(text) => handleInputChange('annee', text.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </FormField>
                  
                  <FormField label="Transmission" required>
                    <SelectableOptions
                      options={transmissionOptions}
                      selectedValue={voitureData.transmission}
                      onSelect={(value) => handleInputChange('transmission', value)}
                    />
                  </FormField>
                  
                  <FormField label="Kilométrage (km)" required>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 50000"
                      placeholderTextColor="#94a3b8"
                      value={voitureData.kilometrage}
                      onChangeText={(text) => handleInputChange('kilometrage', text.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                    />
                  </FormField>
                  
                  <FormField label="Couleur" required>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Rouge, Bleu, Noir..."
                      placeholderTextColor="#94a3b8"
                      value={voitureData.couleur}
                      onChangeText={(text) => handleInputChange('couleur', text)}
                    />
                  </FormField>
                  
                  <FormField label="Cylindrée (CC)" required>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 1600"
                      placeholderTextColor="#94a3b8"
                      value={voitureData.cylindree_cc}
                      onChangeText={(text) => handleInputChange('cylindree_cc', text.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                    />
                  </FormField>
                  
                  <FormField label="Prix" required>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      placeholder="Ex: 15000000"
                      placeholderTextColor="#94a3b8"
                      value={formatPrixAffichage(voitureData.prix)}
                      onChangeText={(text) => handleInputChange('prix', text)}
                      keyboardType="numeric"
                    />
                  </FormField>
                  
                  <FormField label="Devise">
                    <SelectableOptions
                      options={deviseOptions}
                      selectedValue={voitureData.devise}
                      onSelect={(value) => handleInputChange('devise', value)}
                    />
                  </FormField>
                  
                  <FormField label="Pays" required>
                    <SelectableOptions
                      options={paysOptions}
                      selectedValue={voitureData.pays}
                      onSelect={(value) => handleInputChange('pays', value)}
                    />
                  </FormField>
                  
                  <FormField label="État">
                    <SelectableOptions
                      options={etatOptions}
                      selectedValue={voitureData.etat}
                      onSelect={(value) => handleInputChange('etat', value)}
                    />
                  </FormField>
                </View>
              </View>
              
              {/* Section 2 - Images */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient colors={['#f97316', '#ea580c']} style={styles.sectionNumber}>
                    <Text style={styles.sectionNumberText}>2</Text>
                  </LinearGradient>
                  <Text style={styles.sectionTitle}>Images</Text>
                </View>
                
                <View style={styles.formGrid}>
                  
                  <FormField label="Photo principale">
                    <TouchableOpacity onPress={pickPhoto} style={styles.imagePicker} activeOpacity={0.8}>
                      {photoPreview ? (
                        <View style={styles.imagePreviewContainer}>
                          <Image source={{ uri: photoPreview }} style={styles.previewImage} />
                          <View style={styles.imageOverlay}>
                            <Icon name="camera" size={24} color="white" />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <Icon name="camera-plus" size={48} color="#94a3b8" />
                          <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
                          <Text style={styles.imagePlaceholderSubtext}>JPEG, PNG, max 5MB</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </FormField>
                  
                  <FormField label="Images supplémentaires">
                    <TouchableOpacity onPress={pickImages} style={styles.imagePicker} activeOpacity={0.8}>
                      <View style={styles.imagePlaceholder}>
                        <Icon name="image-multiple" size={48} color="#94a3b8" />
                        <Text style={styles.imagePlaceholderText}>Ajouter des images</Text>
                        <Text style={styles.imagePlaceholderSubtext}>Jusqu'à 5 photos</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {imagePreviews.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                        {imagePreviews.map((preview, index) => (
                          <ImageCard key={index} uri={preview} onPress={() => removeImage(index)} />
                        ))}
                      </ScrollView>
                    )}
                  </FormField>
                </View>
                
                <View style={styles.infoBox}>
                  <Icon name="information" size={18} color="#f97316" />
                  <Text style={styles.infoBoxText}>
                    Les images seront optimisées automatiquement
                  </Text>
                </View>
              </View>
              
              {/* Boutons d'action */}
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton} activeOpacity={0.8}>
                  <Icon name="close" size={20} color="#e2e8f0" />
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={styles.submitButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f97316', '#ea580c']}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Icon name="check" size={20} color="white" />
                        <Text style={styles.submitButtonText}>Publier le véhicule</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.infoText}>
                <Text style={styles.required}>*</Text> Champs obligatoires
              </Text>
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
  decorCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(249,115,22,0.1)' },
  decorCircle2: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(249,115,22,0.05)' },
  decorCircle3: { position: 'absolute', top: '50%', left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(249,115,22,0.03)' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingBottom: 40, flexGrow: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  formCard: { backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)' },
  formCardMobile: { padding: 16 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  sectionNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sectionNumberText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  formGridMobile: { flexDirection: 'column', gap: 16 },
  formField: { flex: 1, minWidth: 200, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#e2e8f0', marginBottom: 8 },
  required: { color: '#f97316' },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 14, fontSize: 15, color: 'white', backgroundColor: '#0f172a' },
  priceInput: { fontWeight: 'bold', color: '#f97316' },
  optionsScroll: { flexDirection: 'row', marginBottom: 4 },
  optionButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: '#334155', marginRight: 10 },
  optionButtonActive: { backgroundColor: '#f97316' },
  optionText: { color: '#e2e8f0', fontSize: 14 },
  optionTextActive: { color: 'white', fontWeight: 'bold' },
  noOptionsContainer: { padding: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12 },
  noOptionsText: { color: '#f97316', fontSize: 12, textAlign: 'center' },
  loader: { marginVertical: 10 },
  imagePicker: { alignItems: 'center', justifyContent: 'center' },
  imagePreviewContainer: { position: 'relative' },
  previewImage: { width: 160, height: 120, borderRadius: 12 },
  imageOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#f97316', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  imagePlaceholder: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#4b5563', borderStyle: 'dashed' },
  imagePlaceholderText: { fontSize: 13, color: '#94a3b8', marginTop: 12 },
  imagePlaceholderSubtext: { fontSize: 11, color: '#64748b', marginTop: 4 },
  imagePreviewScroll: { flexDirection: 'row', marginTop: 12 },
  imagePreviewItem: { position: 'relative', marginRight: 12 },
  imagePreviewSmall: { width: 80, height: 80, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.1)', padding: 12, borderRadius: 12, gap: 8, marginTop: 16 },
  infoBoxText: { fontSize: 12, color: '#f97316', flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 16 },
  cancelButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#334155', gap: 8 },
  cancelButtonText: { color: '#e2e8f0', fontWeight: '500', fontSize: 14 },
  submitButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  infoText: { textAlign: 'center', fontSize: 11, color: '#64748b', marginTop: 8 },
  messageContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, zIndex: 100, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  messageSuccess: { backgroundColor: '#10b981' },
  messageError: { backgroundColor: '#ef4444' },
  messageText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successModal: { borderRadius: 24, overflow: 'hidden', width: width - 80, maxWidth: 320 },
  successModalGradient: { alignItems: 'center', padding: 32, gap: 12 },
  successModalTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  successModalText: { fontSize: 16, color: 'white', textAlign: 'center' },
  successModalSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
});