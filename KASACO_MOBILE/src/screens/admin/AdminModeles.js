// src/screens/admin/AdminModeles.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { ModeleService, MarqueService } from '../../services/api';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.54:8000/api';

// Composant pour chaque modèle en mode carte (mobile friendly)
const ModeleCard = ({ item, index, currentPage, onDelete, onEdit, marques }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(itemAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);

  // Récupérer le nom de la marque
  const getMarqueNom = () => {
    const marqueId = item.marque_id || item.marque;
    if (!marqueId) return 'Non assigné';
    const marque = marques.find(m => m.id === marqueId);
    return marque ? marque.nom : 'Inconnu';
  };

  const getMarqueColor = () => {
    const marqueId = item.marque_id || item.marque;
    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec489a', '#14b8a6', '#f43f5e'];
    const index = (marqueId || 0) % colors.length;
    return colors[index];
  };

  return (
    <Animated.View 
      style={[
        styles.modeleCard,
        {
          opacity: itemAnim,
          transform: [{ scale: itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1]
          }) }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.9)']}
        style={styles.modeleCardGradient}
      >
        <View style={styles.modeleCardContent}>
          <View style={styles.modeleCardLeft}>
            <View style={[styles.modeleNumberBadge, { backgroundColor: `${getMarqueColor()}20` }]}>
              <Text style={[styles.modeleNumberText, { color: getMarqueColor() }]}>
                {(currentPage - 1) * 10 + index + 1}
              </Text>
            </View>
            <View>
              <Text style={styles.modeleCardName}>{item.nom}</Text>
              <View style={styles.modeleCardMeta}>
                <Icon name="tag" size={12} color="#94a3b8" />
                <Text style={styles.modeleCardId}>ID: {item.id}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.modeleCardActions}>
            <TouchableOpacity 
              onPress={() => onEdit(item)} 
              style={styles.modeleActionButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.actionButtonGradient}
              >
                <Icon name="pencil" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => onDelete(item.id, item.nom)} 
              style={styles.modeleActionButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.actionButtonGradient}
              >
                <Icon name="delete-outline" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Marque et détails */}
        <View style={styles.modeleCardFooter}>
          <View style={[styles.marqueBadge, { backgroundColor: `${getMarqueColor()}20` }]}>
            <Icon name="car" size={12} color={getMarqueColor()} />
            <Text style={[styles.marqueBadgeText, { color: getMarqueColor() }]}>
              {getMarqueNom()}
            </Text>
          </View>
          {item.voitures_count > 0 && (
            <View style={styles.voituresCount}>
              <Icon name="car-multiple" size={12} color="#94a3b8" />
              <Text style={styles.voituresCountText}>{item.voitures_count} véhicules</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Composant principal
export default function AdminModeles() {
  const [modeles, setModeles] = useState([]);
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    marque: '',
    image: null
  });
  const [editingModele, setEditingModele] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [modeleToDelete, setModeleToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  const itemsPerPage = 10;

  useEffect(() => {
    chargerDonnees();
    startAnimations();
    Animated.spring(fabAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showMessageAnimation = () => {
    Animated.sequence([
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(messageAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger les marques
      const marquesData = await MarqueService.getAllMarques();
      let marquesList = [];
      if (Array.isArray(marquesData)) {
        marquesList = marquesData;
      } else if (marquesData && marquesData.results) {
        marquesList = marquesData.results;
      }
      setMarques(marquesList);
      console.log('📦 Marques chargées:', marquesList.length);

      // Charger les modèles
      const modelesData = await ModeleService.getAllModeles();
      let modelesList = [];
      if (Array.isArray(modelesData)) {
        modelesList = modelesData;
      } else if (modelesData && modelesData.results) {
        modelesList = modelesData.results;
      }
      
      setModeles(modelesList);
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', 'Erreur de chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerDonnees();
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    showMessageAnimation();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const pickImage = async () => {
    try {
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
        setImageUri(result.assets[0].uri);
        setFormData({ ...formData, image: result.assets[0] });
        setPreview(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetForm = () => {
    setFormData({ nom: '', marque: '', image: null });
    setPreview(null);
    setImageUri(null);
    setEditingModele(null);
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      showMessage('error', 'Le nom du modèle est requis');
      return false;
    }
    if (!formData.marque) {
      showMessage('error', 'Veuillez sélectionner une marque');
      return false;
    }
    if (formData.nom.trim().length < 2) {
      showMessage('error', 'Le nom doit contenir au moins 2 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('marque', parseInt(formData.marque));
      if (formData.image) {
        formDataToSend.append('image', {
          uri: formData.image.uri,
          type: 'image/jpeg',
          name: `modele_${Date.now()}.jpg`
        });
      }

      await ModeleService.createModele(formDataToSend);
      
      showMessage('success', 'Modèle ajouté avec succès !');
      setShowModal(false);
      resetForm();
      chargerDonnees();
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      const errorMsg = error.response?.data?.nom?.[0] || error.response?.data?.message || 'Erreur lors de l\'ajout';
      showMessage('error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm() || !editingModele) return;
    
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('marque', parseInt(formData.marque));
      if (formData.image && formData.image.uri !== editingModele.image_url) {
        formDataToSend.append('image', {
          uri: formData.image.uri,
          type: 'image/jpeg',
          name: `modele_${Date.now()}.jpg`
        });
      }

      await ModeleService.updateModele(editingModele.id, formDataToSend);
      
      showMessage('success', `Modèle "${formData.nom.trim()}" modifié !`);
      setShowEditModal(false);
      resetForm();
      chargerDonnees();
      
    } catch (error) {
      console.error("❌ Erreur:", error);
      const errorMsg = error.response?.data?.nom?.[0] || error.response?.data?.message || 'Erreur lors de la modification';
      showMessage('error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPress = (modele) => {
    setEditingModele(modele);
    setFormData({
      nom: modele.nom,
      marque: (modele.marque_id || modele.marque)?.toString() || '',
      image: null
    });
    setPreview(modele.image_url ? `${API_BASE_URL.replace('/api', '')}${modele.image_url}` : null);
    setImageUri(modele.image_url ? `${API_BASE_URL.replace('/api', '')}${modele.image_url}` : null);
    setShowEditModal(true);
  };

  const handleDeleteClick = (id, nomModele) => {
    setModeleToDelete({ id, nom: nomModele });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!modeleToDelete) return;
    
    try {
      await ModeleService.deleteModele(modeleToDelete.id);
      showMessage('success', `Modèle "${modeleToDelete.nom}" supprimé`);
      chargerDonnees();
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression');
    } finally {
      setShowConfirmModal(false);
      setModeleToDelete(null);
    }
  };

  const paginatedModeles = modeles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(modeles.length / itemsPerPage);

  const renderModeleItem = ({ item, index }) => (
    <ModeleCard
      item={item}
      index={index}
      currentPage={currentPage}
      onDelete={handleDeleteClick}
      onEdit={handleEditPress}
      marques={marques}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.loadingCard}
          >
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Chargement des modèles...</Text>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Fond avec dégradé moderne */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      {/* Éléments décoratifs animés */}
      <Animated.View style={[styles.decorCircle1, { opacity: headerAnim }]} />
      <Animated.View style={[styles.decorCircle2, { opacity: headerAnim }]} />
      <Animated.View style={[styles.decorCircle3, { opacity: headerAnim }]} />
      
      {/* Message de notification animé */}
      {message.text && (
        <Animated.View 
          style={[
            styles.messageContainer,
            message.type === 'success' ? styles.messageSuccess : styles.messageError,
            {
              transform: [{ translateY: messageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              }) }],
              opacity: messageAnim
            }
          ]}
        >
          <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={22} color="white" />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <Animated.View style={[styles.confirmModal, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.confirmModalIcon}>
              <Icon name="alert-octagon" size={48} color="#f97316" />
            </View>
            <Text style={styles.confirmModalTitle}>Supprimer le modèle</Text>
            <Text style={styles.confirmModalText}>
              Êtes-vous sûr de vouloir supprimer
            </Text>
            <Text style={styles.confirmModalMarque}>"{modeleToDelete?.nom}"</Text>
            <Text style={styles.confirmModalWarning}>
              Cette action est irréversible
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                onPress={() => setShowConfirmModal(false)} 
                style={styles.confirmCancelButton}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmDelete} 
                style={styles.confirmDeleteButton}
                activeOpacity={0.8}
              >
                <Icon name="delete" size={18} color="white" />
                <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Modal d'ajout */}
      <Modal visible={showModal} animationType="slide" transparent>
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>Nouveau modèle</Text>
                <TouchableOpacity 
                  onPress={() => { setShowModal(false); resetForm(); }} 
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
              </LinearGradient>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalField}>
                  <Text style={styles.inputLabel}>Nom du modèle *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Clio, Corolla, 208..."
                    placeholderTextColor="#94a3b8"
                    value={formData.nom}
                    onChangeText={(text) => handleInputChange('nom', text)}
                    autoFocus
                  />
                </View>
                
                <View style={styles.modalField}>
                  <Text style={styles.inputLabel}>Marque *</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.marqueScroll}
                  >
                    {marques.map((marque) => (
                      <TouchableOpacity
                        key={marque.id}
                        style={[
                          styles.marqueOption,
                          formData.marque === marque.id.toString() && styles.marqueOptionActive
                        ]}
                        onPress={() => handleInputChange('marque', marque.id.toString())}
                      >
                        <Text style={[
                          styles.marqueOptionText,
                          formData.marque === marque.id.toString() && styles.marqueOptionTextActive
                        ]}>
                          {marque.nom}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.modalField}>
                  <Text style={styles.inputLabel}>Image (optionnel)</Text>
                  <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.8}>
                    {preview ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: preview }} style={styles.previewImage} />
                        <View style={styles.imageOverlay}>
                          <Icon name="camera" size={24} color="white" />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Icon name="image-plus" size={40} color="#94a3b8" />
                        <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                        <Text style={styles.imagePlaceholderSubtext}>PNG, JPG, max 5MB</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={() => { setShowModal(false); resetForm(); }} 
                  style={styles.cancelButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSubmit} 
                  style={styles.saveButton}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f97316', '#ea580c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    {submitting ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Icon name="content-save" size={18} color="white" />
                        <Text style={styles.saveButtonText}>Enregistrer</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>

      {/* Modal d'édition */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeader}
              >
                <Text style={styles.modalTitle}>Modifier le modèle</Text>
                <TouchableOpacity 
                  onPress={() => { setShowEditModal(false); resetForm(); }} 
                  style={styles.modalCloseButton}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
              </LinearGradient>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalField}>
                  <Text style={styles.inputLabel}>Nom du modèle *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Clio, Corolla, 208..."
                    placeholderTextColor="#94a3b8"
                    value={formData.nom}
                    onChangeText={(text) => handleInputChange('nom', text)}
                    autoFocus
                  />
                </View>
                
                <View style={styles.modalField}>
                  <Text style={styles.inputLabel}>Marque *</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.marqueScroll}
                  >
                    {marques.map((marque) => (
                      <TouchableOpacity
                        key={marque.id}
                        style={[
                          styles.marqueOption,
                          formData.marque === marque.id.toString() && styles.marqueOptionActive
                        ]}
                        onPress={() => handleInputChange('marque', marque.id.toString())}
                      >
                        <Text style={[
                          styles.marqueOptionText,
                          formData.marque === marque.id.toString() && styles.marqueOptionTextActive
                        ]}>
                          {marque.nom}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.modalField}>
                  <Text style={styles.inputLabel}>Image (optionnel)</Text>
                  <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.8}>
                    {preview ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: preview }} style={styles.previewImage} />
                        <View style={styles.imageOverlay}>
                          <Icon name="camera" size={24} color="white" />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Icon name="image-plus" size={40} color="#94a3b8" />
                        <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                        <Text style={styles.imagePlaceholderSubtext}>PNG, JPG, max 5MB</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={() => { setShowEditModal(false); resetForm(); }} 
                  style={styles.cancelButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleEdit} 
                  style={styles.saveButton}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    {submitting ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Icon name="content-save" size={18} color="white" />
                        <Text style={styles.saveButtonText}>Modifier</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>

      {/* En-tête */}
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <Text style={styles.headerTitle}>Gestion des modèles</Text>
        <Text style={styles.headerSubtitle}>Gérez les modèles de vos véhicules</Text>
      </Animated.View>

      {/* Contenu principal */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#f97316']}
            tintColor="#f97316"
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['rgba(249, 115, 22, 0.2)', 'rgba(234, 88, 12, 0.1)']}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Icon name="car-multiple" size={28} color="#f97316" />
              </View>
              <View>
                <Text style={styles.statNumber}>{modeles.length}</Text>
                <Text style={styles.statLabel}>Modèles totaux</Text>
              </View>
            </LinearGradient>
            
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Icon name="tag" size={28} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.statNumber}>{marques.length}</Text>
                <Text style={styles.statLabel}>Marques associées</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Liste des modèles en mode carte */}
          {paginatedModeles.length > 0 ? (
            <FlatList
              data={paginatedModeles}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderModeleItem}
              scrollEnabled={false}
              contentContainerStyle={styles.modelesList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['rgba(30, 41, 59, 0.6)', 'rgba(15, 23, 42, 0.8)']}
                style={styles.emptyCard}
              >
                <Icon name="car-off" size={64} color="#475569" />
                <Text style={styles.emptyTitle}>Aucun modèle</Text>
                <Text style={styles.emptyText}>Commencez par ajouter votre premier modèle</Text>
                <TouchableOpacity 
                  onPress={() => setShowModal(true)} 
                  style={styles.emptyButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f97316', '#ea580c']}
                    style={styles.emptyButtonGradient}
                  >
                    <Icon name="plus" size={20} color="white" />
                    <Text style={styles.emptyButtonText}>Ajouter un modèle</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#475569' : '#f97316'} />
              </TouchableOpacity>
              
              <View style={styles.paginationInfo}>
                <LinearGradient
                  colors={['rgba(249, 115, 22, 0.2)', 'rgba(234, 88, 12, 0.1)']}
                  style={styles.paginationBadge}
                >
                  <Text style={styles.paginationText}>{currentPage}</Text>
                </LinearGradient>
                <Text style={styles.paginationSeparator}>/</Text>
                <Text style={styles.paginationTotal}>{totalPages}</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                activeOpacity={0.7}
              >
                <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#475569' : '#f97316'} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bouton flottant (FAB) */}
      <Animated.View 
        style={[
          styles.fab,
          {
            transform: [{ scale: fabAnim }],
            opacity: fabAnim
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => setShowModal(true)} 
          style={styles.fabButton}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Icon name="plus" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(249, 115, 22, 0.05)',
  },
  decorCircle3: {
    position: 'absolute',
    top: '50%',
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(249, 115, 22, 0.03)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 14,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  modelesList: {
    gap: 12,
  },
  modeleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modeleCardGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  modeleCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modeleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeleNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeleNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeleCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modeleCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  modeleCardId: {
    fontSize: 10,
    color: '#64748b',
  },
  modeleCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modeleActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  marqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  marqueBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  voituresCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voituresCountText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  emptyContainer: {
    paddingVertical: 40,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  paginationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  paginationButtonDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  paginationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationText: {
    color: '#f97316',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paginationSeparator: {
    color: '#475569',
    fontSize: 16,
  },
  paginationTotal: {
    color: '#94a3b8',
    fontSize: 16,
  },
  messageContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 100,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageSuccess: {
    backgroundColor: '#10b981',
  },
  messageError: {
    backgroundColor: '#ef4444',
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    width: width - 40,
    maxWidth: 450,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: 'white',
    backgroundColor: '#0f172a',
  },
  marqueScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  marqueOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#334155',
    marginRight: 10,
  },
  marqueOptionActive: {
    backgroundColor: '#f97316',
  },
  marqueOptionText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  marqueOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f97316',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4b5563',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },
  imagePlaceholderSubtext: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.5)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#e2e8f0',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmModal: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxWidth: 340,
    alignItems: 'center',
  },
  confirmModalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  confirmModalText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  confirmModalMarque: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
    marginVertical: 8,
  },
  confirmModalWarning: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  confirmCancelButtonText: {
    color: '#e2e8f0',
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    gap: 8,
  },
  confirmDeleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});