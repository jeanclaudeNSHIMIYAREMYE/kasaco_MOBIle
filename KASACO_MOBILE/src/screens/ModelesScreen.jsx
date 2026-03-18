import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ModelesScreen({ route, navigation }) {
  const { marqueId } = route.params;

  const modeles = [
    { id: 1, nom: 'Modèle 1' },
    { id: 2, nom: 'Modèle 2' },
    { id: 3, nom: 'Modèle 3' },
  ];

  const renderModele = ({ item }) => (
    <TouchableOpacity 
      style={styles.modeleCard}
      onPress={() => navigation.navigate('VoitureDetail', { id: item.id })}
    >
      <Icon name="car-outline" size={24} color="#ef4444" />
      <Text style={styles.modeleNom}>{item.nom}</Text>
      <Icon name="chevron-forward-outline" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modèles</Text>
        <Text style={styles.subtitle}>Marque ID: {marqueId}</Text>
      </View>

      <FlatList
        data={modeles}
        renderItem={renderModele}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  list: {
    padding: 20,
  },
  modeleCard: {
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
  modeleNom: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});