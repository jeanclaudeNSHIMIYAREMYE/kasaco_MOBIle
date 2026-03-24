// src/screens/admin/AdminUsers.js
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
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UtilisateurService } from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Composant pour la carte utilisateur (Mobile First)
const UserCard = ({ item, index, onRoleChange, onDelete, currentUserId }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const getRoleBadge = (user) => {
    if (user.is_superuser) {
      return (
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.roleBadge}>
          <Icon name="crown" size={12} color="white" />
          <Text style={styles.roleBadgeText}>Super Admin</Text>
        </LinearGradient>
      );
    } else if (user.role === 'admin') {
      return (
        <LinearGradient colors={['#10b981', '#059669']} style={styles.roleBadge}>
          <Icon name="shield-account" size={12} color="white" />
          <Text style={styles.roleBadgeText}>Admin</Text>
        </LinearGradient>
      );
    } else {
      return (
        <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.roleBadge}>
          <Icon name="account" size={12} color="white" />
          <Text style={styles.roleBadgeText}>Utilisateur</Text>
        </LinearGradient>
      );
    }
  };

  const isCurrentUser = item.id === currentUserId;
  const initials = item.username?.charAt(0).toUpperCase() || 'U';

  return (
    <Animated.View
      style={[
        styles.mobileCard,
        {
          opacity: cardAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={isCurrentUser ? ['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.05)'] : ['rgba(30,41,59,0.5)', 'rgba(30,41,59,0.3)']}
        style={styles.mobileCardGradient}
      >
        <View style={styles.mobileCardHeader}>
          <View style={styles.mobileUserAvatar}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.avatarGradient}
            >
              <Text style={styles.mobileUserAvatarText}>{initials}</Text>
            </LinearGradient>
            {isCurrentUser && (
              <View style={styles.currentUserIndicator}>
                <Icon name="star" size={12} color="#f59e0b" />
              </View>
            )}
          </View>
          <View style={styles.mobileUserInfo}>
            <View style={styles.mobileUserNameContainer}>
              <Text style={styles.mobileUserName}>{item.username}</Text>
              {isCurrentUser && (
                <View style={styles.currentUserBadge}>
                  <Text style={styles.currentUserBadgeText}>Vous</Text>
                </View>
              )}
            </View>
            <Text style={styles.mobileUserEmail} numberOfLines={1}>{item.email}</Text>
          </View>
          {getRoleBadge(item)}
        </View>

        <View style={styles.mobileCardInfo}>
          <View style={styles.mobileInfoItem}>
            <Icon name="calendar" size={16} color="#8b5cf6" />
            <Text style={styles.mobileInfoLabel}>Inscription</Text>
            <Text style={styles.mobileInfoValue}>
              {new Date(item.date_joined).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.mobileInfoItem}>
            <Icon name="identifier" size={16} color="#8b5cf6" />
            <Text style={styles.mobileInfoLabel}>ID</Text>
            <Text style={styles.mobileInfoValue}>#{item.id}</Text>
          </View>
        </View>

        <View style={styles.mobileActionButtons}>
          <TouchableOpacity
            onPress={() => onRoleChange(item.id, item.role)}
            disabled={isCurrentUser}
            style={[styles.mobileActionButton, isCurrentUser && styles.mobileActionButtonDisabled]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isCurrentUser ? ['#6b7280', '#4b5563'] : ['#f59e0b', '#d97706']}
              style={styles.mobileActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="swap-horizontal" size={18} color="white" />
              <Text style={styles.mobileActionText}>Changer rôle</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item)}
            disabled={isCurrentUser}
            style={[styles.mobileActionButton, isCurrentUser && styles.mobileActionButtonDisabled]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isCurrentUser ? ['#6b7280', '#4b5563'] : ['#ef4444', '#dc2626']}
              style={styles.mobileActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="delete" size={18} color="white" />
              <Text style={styles.mobileActionText}>Supprimer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Composant pour la carte de statistiques
const StatCard = ({ icon, value, label, color }) => (
  <LinearGradient
    colors={[color + '20', color + '10']}
    style={styles.statCard}
  >
    <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </LinearGradient>
);

export default function AdminUsers() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0
  });

  const usersPerPage = 10;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      fetchCurrentUser();
      fetchUsers();
      startAnimations();
      return () => {};
    }, [])
  );

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
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

  const fetchCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId ? parseInt(userId) : null);
    } catch (error) {
      console.error('Erreur chargement user ID:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UtilisateurService.getAllUtilisateurs();

      let usersList = [];
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data && data.results) {
        usersList = data.results;
      }

      setUsers(usersList);
      setFilteredUsers(usersList);
      
      // Calculer les statistiques
      const admins = usersList.filter(u => u.role === 'admin' || u.is_superuser).length;
      setStats({
        total: usersList.length,
        admins: admins,
        users: usersList.length - admins
      });
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', 'Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const handleRoleChange = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await UtilisateurService.updateUtilisateur(userId, { role: newRole });

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      setFilteredUsers(filteredUsers.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));

      // Mettre à jour les stats
      const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
      const admins = updatedUsers.filter(u => u.role === 'admin' || u.is_superuser).length;
      setStats({
        total: updatedUsers.length,
        admins: admins,
        users: updatedUsers.length - admins
      });

      showMessage('success', 'Rôle modifié avec succès');
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', 'Erreur lors de la modification du rôle');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await UtilisateurService.deleteUtilisateur(userToDelete.id);
      const newUsers = users.filter(u => u.id !== userToDelete.id);
      setUsers(newUsers);
      setFilteredUsers(newUsers);
      
      // Mettre à jour les stats
      const admins = newUsers.filter(u => u.role === 'admin' || u.is_superuser).length;
      setStats({
        total: newUsers.length,
        admins: admins,
        users: newUsers.length - admins
      });
      
      showMessage('success', 'Utilisateur supprimé avec succès');
    } catch (error) {
      console.error("❌ Erreur:", error);
      showMessage('error', 'Erreur lors de la suppression');
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const renderUserItem = ({ item, index }) => (
    <UserCard
      item={item}
      index={index}
      onRoleChange={handleRoleChange}
      onDelete={handleDeleteClick}
      currentUserId={currentUserId}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Fond dégradé */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Éléments décoratifs */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Message de notification */}
      {message.text && (
        <Animated.View style={[
          styles.messageContainer,
          message.type === 'success' ? styles.messageSuccess : styles.messageError,
          {
            transform: [{ translateY: messageAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }],
            opacity: messageAnim
          }
        ]}>
          <Icon name={message.type === 'success' ? 'check-circle' : 'alert-circle'} size={20} color="white" />
          <Text style={styles.messageText}>{message.text}</Text>
        </Animated.View>
      )}

      {/* Modal de confirmation suppression */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <Animated.View style={[styles.confirmModal, { transform: [{ scale: fadeAnim }] }]}>
            <View style={styles.confirmModalIcon}>
              <Icon name="alert-octagon" size={48} color="#ef4444" />
            </View>
            <Text style={styles.confirmModalTitle}>Confirmer la suppression</Text>
            <Text style={styles.confirmModalText}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur
            </Text>
            <Text style={styles.confirmModalUser}>"{userToDelete?.username}"</Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.confirmCancelButton}>
                <Text style={styles.confirmCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.confirmDeleteButton}>
                <Icon name="delete" size={18} color="white" />
                <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8b5cf6']} />
          }
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* En-tête */}
            <View style={styles.header}>
              <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.headerIcon}>
                <Icon name="account-group" size={28} color="white" />
              </LinearGradient>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
                <Text style={styles.headerSubtitle}>
                  {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Statistiques */}
            <View style={styles.statsContainer}>
              <StatCard icon="account-group" value={stats.total} label="Total" color="#8b5cf6" />
              <StatCard icon="shield-account" value={stats.admins} label="Admins" color="#10b981" />
              <StatCard icon="account" value={stats.users} label="Utilisateurs" color="#3b82f6" />
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Icon name="magnify" size={20} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un utilisateur..."
                  placeholderTextColor="#94a3b8"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
                {searchTerm !== '' && (
                  <TouchableOpacity onPress={() => setSearchTerm('')}>
                    <Icon name="close" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Liste des utilisateurs */}
            <FlatList
              data={paginatedUsers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUserItem}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="account-off" size={64} color="#475569" />
                  <Text style={styles.emptyTitle}>Aucun utilisateur</Text>
                  <Text style={styles.emptyText}>
                    {searchTerm ? 'Aucun résultat pour cette recherche' : 'Commencez par ajouter des utilisateurs'}
                  </Text>
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
                >
                  <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#475569' : '#8b5cf6'} />
                </TouchableOpacity>
                <Text style={styles.paginationText}>
                  {currentPage} / {totalPages}
                </Text>
                <TouchableOpacity
                  onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                >
                  <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#475569' : '#8b5cf6'} />
                </TouchableOpacity>
              </View>
            )}
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
  decorCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(139,92,246,0.1)' },
  decorCircle2: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(236,72,153,0.05)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingCard: { backgroundColor: 'rgba(30,41,59,0.9)', borderRadius: 20, padding: 30, alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#94a3b8', fontSize: 14 },
  content: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  statIconContainer: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  searchContainer: { marginBottom: 20 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: 'white', paddingVertical: 10 },
  mobileCard: { marginBottom: 14, borderRadius: 20, overflow: 'hidden' },
  mobileCardGradient: { padding: 16 },
  mobileCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  mobileUserAvatar: { position: 'relative', marginRight: 12 },
  avatarGradient: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  mobileUserAvatarText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  currentUserIndicator: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#f59e0b', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0f172a' },
  mobileUserInfo: { flex: 1 },
  mobileUserNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  mobileUserName: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  currentUserBadge: { backgroundColor: 'rgba(59,130,246,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  currentUserBadgeText: { fontSize: 9, color: '#3b82f6', fontWeight: '500' },
  mobileUserEmail: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
  roleBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
  mobileCardInfo: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  mobileInfoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(15,23,42,0.6)', padding: 10, borderRadius: 12 },
  mobileInfoLabel: { fontSize: 11, color: '#94a3b8', flex: 1 },
  mobileInfoValue: { fontSize: 12, color: 'white', fontWeight: '500' },
  mobileActionButtons: { flexDirection: 'row', gap: 12 },
  mobileActionButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  mobileActionButtonDisabled: { opacity: 0.5 },
  mobileActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  mobileActionText: { color: 'white', fontWeight: '600', fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#94a3b8', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 20 },
  paginationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(30,41,59,0.8)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
  paginationButtonDisabled: { backgroundColor: 'rgba(30,41,59,0.4)', borderColor: 'rgba(71,85,105,0.3)' },
  paginationText: { fontSize: 16, fontWeight: '600', color: 'white' },
  messageContainer: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, zIndex: 100, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  messageSuccess: { backgroundColor: '#10b981' },
  messageError: { backgroundColor: '#ef4444' },
  messageText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  confirmModal: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, width: width - 40, maxWidth: 320, alignItems: 'center' },
  confirmModalIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmModalTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  confirmModalText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  confirmModalUser: { fontSize: 16, fontWeight: 'bold', color: '#ef4444', marginVertical: 6 },
  confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  confirmCancelButtonText: { color: '#e2e8f0', fontWeight: '500' },
  confirmDeleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#ef4444', gap: 6 },
  confirmDeleteButtonText: { color: 'white', fontWeight: 'bold' },
});