import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="person-circle-outline" size={80} color="#ef4444" />
        <Text style={styles.welcome}>Bienvenue,</Text>
        <Text style={styles.userName}>{user?.first_name || 'Utilisateur'} {user?.last_name || ''}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="car-outline" size={24} color="#ef4444" />
          <Text style={styles.menuText}>Mes réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="heart-outline" size={24} color="#ef4444" />
          <Text style={styles.menuText}>Mes favoris</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings-outline" size={24} color="#ef4444" />
          <Text style={styles.menuText}>Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.menuText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  welcome: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});