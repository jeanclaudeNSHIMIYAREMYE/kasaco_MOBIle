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
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { ModeleService, MarqueService } from '../../services/api';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.54:8000/api';

// Composant pour chaque ligne du tableau
const ModeleRow = ({ item, index, currentPage, onDelete, marques }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);

  // Récupérer le nom de la marque - supporte marque_id ou marque
  const getMarqueNom = () => {
    const marqueId = item.marque_id || item.marque;
    if (!marqueId) return 'Non assigné';
    const marque = marques.find(m => m.id === marqueId);
    return marque ? marque.nom : 'Inconnu';
  };

  return (
    <Animated.View 
      style={[
        styles.tableRow,
        {
          opacity: itemAnim,
          transform: [{ translateX: itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0]
          }) }]
        }
      ]}
    >
      {/* Numéro */}
      <View style={[styles.tableCell, styles.tableCellCenter, { width: 60 }]}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            {(currentPage - 1) * 10 + index + 1}
          </Text>
        </View>
      </View>
      
      {/* ID du modèle */}
      <View style={[styles.tableCell, styles.tableCellCenter, { width: 65 }]}>
        <Text style={styles.idText}>#{item.id}</Text>
      </View>
      
      {/* Nom du modèle */}
      <View style={[styles.tableCell, { flex: 1.2 }]}>
        <View style={styles.modeleInfo}>
          <Icon name="car-side" size={16} color="#f97316" />
          <Text style={styles.modeleName} numberOfLines={1}>{item.nom}</Text>
        </View>
      </View>
      
      {/* Nom de la marque */}
      <View style={[styles.tableCell, { width: 120 }]}>
        <View style={styles.marqueBadge}>
          <Icon name="tag" size={12} color="#f97316" />
          <Text style={styles.marqueBadgeText} numberOfLines={1}>
            {getMarqueNom()}
          </Text>
        </View>
      </View>
      
      {/* Action - Supprimer */}
      <View style={[styles.tableCell, styles.tableCellCenter, { width: 70 }]}>
        <TouchableOpacity 
          onPress={() => onDelete(item.id, item.nom)} 
          style={styles.deleteButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            style={styles.deleteButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="trash-can-outline" size={18} color="white" />
            <Text style={styles.deleteButtonText}>Suppr</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    marque: '',
    image: null
  });
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
      
      // Afficher les données pour déboguer
      console.log('📦 Modèles chargés:', modelesList.length);
      if (modelesList.length > 0) {
        console.log('📦 Premier modèle:', JSON.stringify(modelesList[0]));
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
    <ModeleRow
      item={item}
      index={index}
      currentPage={currentPage}
      onDelete={handleDeleteClick}
      marques={marques}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Chargement des modèles...</Text>
          </View>
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
      
      {/* Éléments décoratifs */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      
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
        </BlurView>
      </Modal>

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
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="car" size={24} color="#f97316" />
              </View>
              <View>
                <Text style={styles.statNumber}>{modeles.length}</Text>
                <Text style={styles.statLabel}></Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="tag" size={24} color="#f97316" />
              </View>
              <View>
                <Text style={styles.statNumber}>{marques.length}</Text>
                <Text style={styles.statLabel}></Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="page-next" size={24} color="#f97316" />
              </View>
              <View>
                <Text style={styles.statNumber}>{currentPage}/{totalPages || 1}</Text>
                <Text style={styles.statLabel}></Text>
              </View>
            </View>
          </View>

          {/* Tableau des modèles */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.tableCellCenter, { width: 60 }]}>
                <Text style={styles.tableHeaderText}>#</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableCellCenter, { width: 65 }]}>
                <Text style={styles.tableHeaderText}>ID</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.2 }]}>
                <Text style={styles.tableHeaderText}>Nom du modèle</Text>
              </View>
              <View style={[styles.tableHeaderCell, { width: 120 }]}>
                <Text style={styles.tableHeaderText}>Marque</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableCellCenter, { width: 70 }]}>
                <Text style={styles.tableHeaderText}>Action</Text>
              </View>
            </View>

            <FlatList
              data={paginatedModeles}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderModeleItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="car-off" size={64} color="#475569" />
                  <Text style={styles.emptyTitle}>Aucun modèle</Text>
                  <Text style={styles.emptyText}>Commencez par ajouter votre premier modèle</Text>
                  <TouchableOpacity 
                    onPress={() => setShowModal(true)} 
                    style={styles.emptyAddButton}
                  >
                    <LinearGradient
                      colors={['#f97316', '#ea580c']}
                      style={styles.emptyAddGradient}
                    >
                      <Icon name="plus" size={18} color="white" />
                      <Text style={styles.emptyAddText}>Ajouter un modèle</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              }
            />

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
                
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={pageNum}
                      onPress={() => setCurrentPage(pageNum)}
                      style={[
                        styles.paginationNumber,
                        currentPage === pageNum && styles.paginationNumberActive
                      ]}
                    >
                      <Text style={[
                        styles.paginationNumberText,
                        currentPage === pageNum && styles.paginationNumberTextActive
                      ]}>
                        {pageNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                
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
          </View>
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
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  tableContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249, 115, 22, 0.3)',
  },
  tableHeaderCell: {
    justifyContent: 'center',
  },
  tableHeaderText: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 85, 105, 0.3)',
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellCenter: {
    alignItems: 'center',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '600',
  },
  idText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  modeleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeleName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  marqueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  marqueBadgeText: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyAddButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  emptyAddText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  paginationNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  paginationNumberActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  paginationNumberText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationNumberTextActive: {
    color: 'white',
    fontWeight: 'bold',
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
    paddingVertical: 16,
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
    maxWidth: 320,
    alignItems: 'center',
  },
  confirmModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  confirmModalText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  confirmModalMarque: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
    marginVertical: 6,
  },
  confirmModalWarning: {
    fontSize: 11,
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
    paddingVertical: 10,
    borderRadius: 10,
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
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    gap: 6,
  },
  confirmDeleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});