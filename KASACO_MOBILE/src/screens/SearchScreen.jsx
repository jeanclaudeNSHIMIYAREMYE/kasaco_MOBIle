import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'Toyota RAV4',
    'BMW X5',
    'Mercedes GLC',
    'Honda CR-V',
  ]);
  const [filters, setFilters] = useState({
    marque: '',
    prixMin: '',
    prixMax: '',
    annee: '',
    transmission: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Simuler une recherche
  useEffect(() => {
    if (searchQuery.length > 2) {
      setLoading(true);
      // Simulation d'appel API
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            marque: 'TOYOTA',
            modele: 'RAV4',
            annee: 2023,
            prix: 45000,
            devise: 'USD',
            transmission: 'Automatique',
            image: null,
          },
          {
            id: 2,
            marque: 'BMW',
            modele: 'X5',
            annee: 2024,
            prix: 75000,
            devise: 'USD',
            transmission: 'Automatique',
            image: null,
          },
          {
            id: 3,
            marque: 'MZDA',
            modele: 'ATENZA',
            annee: 2022,
            prix: 35000,
            devise: 'USD',
            transmission: 'Manuelle',
            image: null,
          },
          {
            id: 4,
            marque: 'HONDA',
            modele: 'CR-V',
            annee: 2023,
            prix: 42000,
            devise: 'USD',
            transmission: 'Automatique',
            image: null,
          },
        ].filter(item => 
          item.marque.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.modele.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(mockResults);
        setLoading(false);
      }, 1000);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const formatPrix = (prix, devise) => {
    const formatted = prix.toLocaleString('fr-FR');
    switch(devise) {
      case 'USD': return `$${formatted}`;
      case 'EUR': return `€${formatted}`;
      default: return `${formatted} ${devise}`;
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const applyFilters = () => {
    setShowFilters(false);
    // Appliquer les filtres ici
    console.log('Filtres appliqués:', filters);
  };

  const resetFilters = () => {
    setFilters({
      marque: '',
      prixMin: '',
      prixMax: '',
      annee: '',
      transmission: '',
    });
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('VoitureDetail', { id: item.id })}
    >
      <View style={styles.resultImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.resultImage} />
        ) : (
          <View style={styles.resultImagePlaceholder}>
            <Icon name="car-outline" size={40} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.marque} {item.modele}</Text>
        <Text style={styles.resultYear}>{item.annee} • {item.transmission}</Text>
        <Text style={styles.resultPrice}>{formatPrix(item.prix, item.devise)}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* En-tête avec recherche */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une voiture..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="close-circle-outline" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="options-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.filterChip, filters.transmission === 'Automatique' && styles.filterChipActive]}
              onPress={() => setFilters({...filters, transmission: 'Automatique'})}
            >
              <Text style={[styles.filterChipText, filters.transmission === 'Automatique' && styles.filterChipTextActive]}>
                Automatique
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterChip, filters.transmission === 'Manuelle' && styles.filterChipActive]}
              onPress={() => setFilters({...filters, transmission: 'Manuelle'})}
            >
              <Text style={[styles.filterChipText, filters.transmission === 'Manuelle' && styles.filterChipTextActive]}>
                Manuelle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterChip, filters.annee === '2024' && styles.filterChipActive]}
              onPress={() => setFilters({...filters, annee: '2024'})}
            >
              <Text style={[styles.filterChipText, filters.annee === '2024' && styles.filterChipTextActive]}>
                2024
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterChip, filters.annee === '2023' && styles.filterChipActive]}
              onPress={() => setFilters({...filters, annee: '2023'})}
            >
              <Text style={[styles.filterChipText, filters.annee === '2023' && styles.filterChipTextActive]}>
                2023
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Moins de 50k €</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>50k - 100k €</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Résultats de recherche */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="search-outline" size={60} color="#ccc" />
                <Text style={styles.emptyTitle}>Aucun résultat</Text>
                <Text style={styles.emptyText}>
                  Aucune voiture ne correspond à votre recherche "{searchQuery}"
                </Text>
              </View>
            ) : (
              <View style={styles.recentContainer}>
                <Text style={styles.recentTitle}>Recherches récentes</Text>
                {recentSearches.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => handleRecentSearch(item)}
                  >
                    <Icon name="time-outline" size={20} color="#999" />
                    <Text style={styles.recentText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          }
        />
      )}
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#ef4444',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
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
    alignItems: 'center',
  },
  resultImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  resultImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  recentContainer: {
    paddingTop: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
});