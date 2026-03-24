// src/screens/admin/AdminMarques.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MarqueService } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Composant pour chaque ligne du tableau
const MarqueRow = ({ item, index, currentPage, onDelete }) => {
  const itemAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);

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
      <View style={[styles.tableCell, styles.tableCellCenter, { width: 70 }]}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>
            {(currentPage - 1) * 10 + index + 1}
          </Text>
        </View>
      </View>
      <View style={[styles.tableCell, { flex: 1 }]}>
        <Text style={styles.marqueName}>{item.nom}</Text>
      </View>
      <View style={[styles.tableCell, styles.tableCellCenter, { width: 80 }]}>
        <TouchableOpacity 
          onPress={() => onDelete(item)} 
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Icon name="delete-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Composant principal
export default function AdminMarques() {
  const navigation = useNavigation();
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nom, setNom] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [marqueToDelete, setMarqueToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMarques();
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

  const fetchMarques = async () => {
    try {
      setLoading(true);
      const data = await MarqueService.getAllMarques();
      
      let marquesData = [];
      if (data && data.results) {
        marquesData = data.results;
      } else if (Array.isArray(data)) {
        marquesData = data;
      }
      
      setMarques(marquesData);
    } catch (err) {
      console.error("❌ Erreur chargement marques:", err);
      showMessage('error', 'Impossible de charger les marques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarques();
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    showMessageAnimation();
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (text) => {
    setNom(text);
    if (formErrors.nom) {
      setFormErrors({ ...formErrors, nom: null });
    }
  };

  const resetForm = () => {
    setNom('');
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!nom.trim()) {
      errors.nom = "Le nom de la marque est requis";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nom', nom.trim());

      await MarqueService.createMarque(formData);
      
      showMessage('success', 'Marque ajoutée avec succès !');
      await fetchMarques();
      setShowModal(false);
      resetForm();
      
    } catch (err) {
      console.error("❌ Erreur:", err);
      const errorMsg = err.response?.data?.nom?.[0] || err.response?.data?.message || 'Erreur lors de l\'ajout';
      showMessage('error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (marque) => {
    setMarqueToDelete(marque);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!marqueToDelete) return;
    
    try {
      await MarqueService.deleteMarque(marqueToDelete.id);
      showMessage('success', `Marque "${marqueToDelete.nom}" supprimée`);
      await fetchMarques();
    } catch (err) {
      showMessage('error', 'Impossible de supprimer cette marque');
    } finally {
      setShowConfirmModal(false);
      setMarqueToDelete(null);
    }
  };

  const paginatedMarques = marques.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(marques.length / itemsPerPage);

  const renderMarqueItem = ({ item, index }) => (
    <MarqueRow
      item={item}
      index={index}
      currentPage={currentPage}
      onDelete={handleDeleteClick}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Chargement des marques...</Text>
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
            <Text style={styles.confirmModalTitle}>Supprimer la marque</Text>
            <Text style={styles.confirmModalText}>
              Êtes-vous sûr de vouloir supprimer
            </Text>
            <Text style={styles.confirmModalMarque}>"{marqueToDelete?.nom}"</Text>
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
              <Text style={styles.modalTitle}>Nouvelle marque</Text>
              <TouchableOpacity 
                onPress={() => { setShowModal(false); resetForm(); }} 
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.modalBody}>
              <View style={styles.modalField}>
                <Text style={styles.inputLabel}>Nom de la marque</Text>
                <TextInput
                  style={[styles.input, formErrors.nom && styles.inputError]}
                  placeholder="Ex: Toyota, Renault, BMW..."
                  placeholderTextColor="#94a3b8"
                  value={nom}
                  onChangeText={handleInputChange}
                />
                {formErrors.nom && (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={14} color="#f97316" />
                    <Text style={styles.errorText}>{formErrors.nom}</Text>
                  </View>
                )}
              </View>
            </View>
            
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
                <Text style={styles.statNumber}>{marques.length}</Text>
                <Text style={styles.statLabel}>Marques totales</Text>
              </View>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Icon name="tag" size={24} color="#f97316" />
              </View>
              <View>
                <Text style={styles.statNumber}>{paginatedMarques.length}</Text>
                <Text style={styles.statLabel}>Page actuelle</Text>
              </View>
            </View>
          </View>

          {/* Tableau des marques */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.tableCellCenter, { width: 70 }]}>
                <Text style={styles.tableHeaderText}>#</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text style={styles.tableHeaderText}>Nom de la marque</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableCellCenter, { width: 80 }]}>
                <Text style={styles.tableHeaderText}>Action</Text>
              </View>
            </View>

            <FlatList
              data={paginatedMarques}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMarqueItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="tag-off" size={64} color="#475569" />
                  <Text style={styles.emptyTitle}>Aucune marque</Text>
                  <Text style={styles.emptyText}>Commencez par ajouter votre première marque</Text>
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
                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>{currentPage}</Text>
                  <Text style={styles.paginationSeparator}>/</Text>
                  <Text style={styles.paginationText}>{totalPages}</Text>
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
    backdropFilter: 'blur(10px)',
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
    gap: 15,
    marginTop: 20,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  tableContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249, 115, 22, 0.3)',
  },
  tableHeaderCell: {
    justifyContent: 'center',
  },
  tableHeaderText: {
    color: '#f97316',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '600',
  },
  marqueName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  paginationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paginationSeparator: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '600',
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
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 85, 105, 0.5)',
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
  inputError: {
    borderColor: '#f97316',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    color: '#f97316',
    fontSize: 12,
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