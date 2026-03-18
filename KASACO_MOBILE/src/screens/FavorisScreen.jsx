import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

export default function FavorisScreen({ navigation }) {
  const { user } = useAuth();
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoris();
  }, []);

  const loadFavoris = async () => {
    try {
      // Simuler le chargement des favoris
      setTimeout(() => {
        const mockFavoris = [
          {
            id: 1,
            marque: 'TOYOTA',
            modele: 'RAV4',
            annee: 2023,
            prix: 45000,
            devise: 'USD',
            image: null,
          },
          {
            id: 2,
            marque: 'BMW',
            modele: 'X5',
            annee: 2024,
            prix: 75000,
            devise: 'USD',
            image: null,
          },
          {
            id: 3,
            marque: 'MZDA',
            modele: 'ATENZA',
            annee: 2022,
            prix: 35000,
            devise: 'USD',
            image: null,
          },
        ];
        setFavoris(mockFavoris);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      setLoading(false);
    }
  };

  const removeFavori = (id) => {
    Alert.alert(
      'Retirer des favoris',
      'Voulez-vous retirer ce véhicule de vos favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            setFavoris(favoris.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const formatPrix = (prix, devise) => {
    const formatted = prix.toLocaleString('fr-FR');
    switch(devise) {
      case 'USD': return `$${formatted}`;
      case 'EUR': return `€${formatted}`;
      default: return `${formatted} ${devise}`;
    }
  };

  const renderFavoriItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriCard}
      onPress={() => navigation.navigate('VoitureDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="car-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.carName}>
          {item.marque} {item.modele}
        </Text>
        <Text style={styles.carYear}>{item.annee}</Text>
        <Text style={styles.carPrice}>{formatPrix(item.prix, item.devise)}</Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavori(item.id)}
      >
        <Icon name="heart" size={24} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Aucun favori</Text>
      <Text style={styles.emptyText}>
        Vous n'avez pas encore ajouté de véhicules à vos favoris.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Explorer les véhicules</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes favoris</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Liste des favoris */}
      <FlatList
        data={favoris}
        renderItem={renderFavoriItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ef4444',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  favoriCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  carName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  removeButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});