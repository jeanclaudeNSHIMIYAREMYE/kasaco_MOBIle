import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUserInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await api.get(`/utilisateurs/${userId}/`);
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await api.put(`/utilisateurs/${userId}/`, userInfo);
      
      await AsyncStorage.setItem('userFirstName', userInfo.first_name);
      await AsyncStorage.setItem('userLastName', userInfo.last_name);
      
      await updateUserInfo();
      setEditModalVisible(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      setPasswordModalVisible(false);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, onPress, danger = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={24} color={danger ? '#dc3545' : '#ef4444'} />
        <Text style={[styles.menuTitle, danger && styles.dangerText]}>{title}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={20} color="#999" />
    </TouchableOpacity>
  );

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Non renseigné'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* En-tête du profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person-circle-outline" size={100} color="#ef4444" />
        </View>
        <Text style={styles.userName}>
          {userInfo.first_name} {userInfo.last_name}
        </Text>
        <Text style={styles.userEmail}>{userInfo.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </Text>
        </View>
      </View>

      {/* Informations personnelles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <InfoRow label="Nom" value={userInfo.last_name} />
        <InfoRow label="Prénom" value={userInfo.first_name} />
        <InfoRow label="Email" value={userInfo.email} />
        <InfoRow label="Téléphone" value={userInfo.telephone} />
        <InfoRow label="Adresse" value={userInfo.adresse} />
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        <MenuItem 
          icon="create-outline" 
          title="Modifier le profil" 
          onPress={() => setEditModalVisible(true)}
        />
        <MenuItem 
          icon="lock-closed-outline" 
          title="Changer le mot de passe" 
          onPress={() => setPasswordModalVisible(true)}
        />
        <MenuItem 
          icon="time-outline" 
          title="Historique des réservations" 
          onPress={() => navigation.navigate('Reservations')}
        />
        <MenuItem 
          icon="heart-outline" 
          title="Mes favoris" 
          onPress={() => navigation.navigate('Favoris')}
        />
        <MenuItem 
          icon="log-out-outline" 
          title="Déconnexion" 
          danger
          onPress={handleLogout}
        />
      </View>

      {/* Modal d'édition du profil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={userInfo.last_name}
              onChangeText={(text) => setUserInfo({...userInfo, last_name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={userInfo.first_name}
              onChangeText={(text) => setUserInfo({...userInfo, first_name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={userInfo.email}
              onChangeText={(text) => setUserInfo({...userInfo, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              value={userInfo.telephone}
              onChangeText={(text) => setUserInfo({...userInfo, telephone: text})}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              value={userInfo.adresse}
              onChangeText={(text) => setUserInfo({...userInfo, adresse: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de changement de mot de passe */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Ancien mot de passe"
              value={passwords.old_password}
              onChangeText={(text) => setPasswords({...passwords, old_password: text})}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              value={passwords.new_password}
              onChangeText={(text) => setPasswords({...passwords, new_password: text})}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={passwords.confirm_password}
              onChangeText={(text) => setPasswords({...passwords, confirm_password: text})}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Changer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  roleBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  dangerText: {
    color: '#dc3545',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});